import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Send, Coffee, Loader2, ArrowLeft, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { FullPageLoading } from "@/components/LoadingSpinner";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
}

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [retryCount, setRetryCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      loadChatHistory();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const loadChatHistory = async () => {
    try {
      const { data, error } = await supabase
        .from("chat_history")
        .select("*")
        .eq("user_id", user?.id)
        .order("created_at", { ascending: true })
        .limit(50);

      if (error) throw error;

      const formattedMessages: Message[] = [];
      data?.forEach((item) => {
        formattedMessages.push({
          id: item.id + "-user",
          role: "user",
          content: item.message,
          created_at: item.created_at,
        });
        if (item.bot_response) {
          formattedMessages.push({
            id: item.id + "-bot",
            role: "assistant",
            content: item.bot_response,
            created_at: item.created_at,
          });
        }
      });

      setMessages(formattedMessages);
    } catch (error) {
      console.error("Error loading chat history:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to load chat history";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;
  
    const userMessage = input.trim();
    setInput("");
    setLoading(true);
  
    // Add user message immediately
    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: userMessage,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsg]);
  
    try {
      // Format conversation history properly for DeepSeek
      const conversationHistory = messages.map(m => ({
        role: m.role,
        content: m.content
      }));
  
      const requestPayload = {
        message: userMessage,
        conversationHistory: conversationHistory
      };

      const { data, error } = await supabase.functions.invoke("deepseek-chat", {
        body: requestPayload
      });
  
      if (error) {
        // Parse error details for DeepSeek
        const errorContext = (error as any)?.context;
        const statusCode = errorContext?.status || (error as any)?.status;
        const errorBody = errorContext?.body || (error as any)?.body;
        
        let actualError = error.message || "Unknown error";
        if (typeof errorBody === "string") {
          try {
            const parsed = JSON.parse(errorBody);
            actualError = parsed.error || actualError;
          } catch {
            actualError = errorBody;
          }
        } else if (errorBody?.error) {
          actualError = errorBody.error;
        } else if (errorBody) {
          actualError = typeof errorBody === "string" ? errorBody : JSON.stringify(errorBody);
        }
        
        // DeepSeek specific error handling
        if (error.message?.includes("Function not found") || error.message?.includes("404") || statusCode === 404) {
          throw new Error("Edge function 'deepseek-chat' is not deployed. Please deploy it in Supabase Dashboard → Edge Functions.");
        }
        
        if (error.message?.includes("Network") || error.message?.includes("Failed to fetch")) {
          throw new Error("Cannot connect to chat service. The edge function may not be deployed. Please check Supabase Dashboard → Edge Functions.");
        }
        
        if (statusCode === 500) {
          if (actualError?.includes("DEEPSEEK_API_KEY") || actualError?.includes("API key not configured")) {
            throw new Error("DEEPSEEK_API_KEY secret is missing! Go to Supabase Dashboard → Edge Functions → Secrets → Add 'DEEPSEEK_API_KEY' with your DeepSeek API key. Get it from https://platform.deepseek.com/api_keys");
          }
          if (actualError?.includes("rate limit")) {
            throw new Error("DeepSeek API rate limit exceeded. Please wait a moment and try again.");
          }
          throw new Error(`Server error: ${actualError || "Check Supabase Dashboard → Edge Functions → deepseek-chat → Logs for details."}`);
        }
        
        if (statusCode === 401) {
          throw new Error("Invalid DeepSeek API key. Please check your DEEPSEEK_API_KEY secret in Supabase.");
        }
        
        if (statusCode === 429) {
          throw new Error("Rate limit exceeded. Please wait a moment and try again.");
        }
        
        throw new Error(`Error (${statusCode || "unknown"}): ${actualError || "Check Supabase logs for details."}`);
      }
  
      if (!data || !data.response) {
        throw new Error(data?.error || "No response from AI. Please try again.");
      }
  
      const botResponse = data.response;
  
      // Add bot message
      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: botResponse,
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, botMsg]);
  
      // Save to database
      await supabase.from("chat_history").insert({
        user_id: user?.id,
        message: userMessage,
        bot_response: botResponse,
      });
  
      // Reset retry count on success
      setRetryCount(0);
  
    } catch (error) {
      console.error("Chat error:", error);
      let errorMessage = "Failed to get response. Please try again.";
      
      if (error instanceof Error) {
        errorMessage = error.message;
        
        // Provide specific help based on error type for DeepSeek
        if (error.message.includes("Failed to fetch") || error.message.includes("NetworkError") || error.message.includes("Network error")) {
          errorMessage = "Unable to connect to the chat service. The edge function may not be deployed. Please check Supabase Edge Functions and ensure 'deepseek-chat' is deployed.";
        } else if (error.message.includes("API key not configured")) {
          errorMessage = "DeepSeek API key not configured. Please set DEEPSEEK_API_KEY in Supabase secrets with your DeepSeek API key from https://platform.deepseek.com/api_keys";
        } else if (error.message.includes("Invalid DeepSeek API key")) {
          errorMessage = "Invalid DeepSeek API key. Please check your API key at https://platform.deepseek.com/api_keys and update the DEEPSEEK_API_KEY secret in Supabase.";
        }
      }
      
      toast({
        title: "Chat Error",
        description: errorMessage,
        variant: "destructive",
        duration: 10000,
      });
      
      // Remove the user message if the request failed
      setMessages((prev) => prev.filter(msg => msg.id !== userMsg.id));
      
      setRetryCount(prev => prev + 1);
    } finally {
      setLoading(false);
    }
  };
}