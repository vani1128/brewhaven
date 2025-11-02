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
      // Format conversation history properly for Gemini
      const conversationHistory = messages.map(m => ({
        role: m.role,
        content: m.content
      }));

      // 🔍 DEBUG: Log what we're sending
      const requestPayload = {
        message: userMessage,
        conversationHistory: conversationHistory
      };
      
      console.log("🔍 DEBUG: Request payload:");
      console.log("- message type:", typeof userMessage);
      console.log("- message value:", userMessage);
      console.log("- message length:", userMessage.length);
      console.log("- conversationHistory type:", typeof conversationHistory);
      console.log("- conversationHistory is array:", Array.isArray(conversationHistory));
      console.log("- conversationHistory length:", conversationHistory.length);
      console.log("- Full payload:", JSON.stringify(requestPayload, null, 2));

      // Check for common issues
      if (typeof userMessage !== 'string') {
        console.error("❌ ERROR: message is not a string!");
      }
      if (!Array.isArray(conversationHistory)) {
        console.error("❌ ERROR: conversationHistory is not an array!");
      }
      
      console.log("📤 Calling edge function: coffee-chat");

      const { data, error } = await supabase.functions.invoke("coffee-chat", {
        body: requestPayload
      });

      console.log("📥 Response received");
      console.log("- error:", error);
      console.log("- data:", data);

      if (error) {
        // Parse error details
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
        
        // Specific error handling with helpful messages
        if (error.message?.includes("Function not found") || error.message?.includes("404") || statusCode === 404) {
          if (actualError.includes("models/gemini-1.5-flash is not found")) {
            throw new Error("❌ Gemini API Error: The model endpoint has changed. Please redeploy your edge function with the updated code (using v1 instead of v1beta).");
          }
          throw new Error("Edge function 'coffee-chat' is not deployed. Please deploy it in Supabase Dashboard → Edge Functions.");
        }
        
        if (error.message?.includes("Network") || error.message?.includes("Failed to fetch")) {
          throw new Error("Cannot connect to chat service. The edge function may not be deployed. Please check Supabase Dashboard → Edge Functions.");
        }
        
        if (statusCode === 500) {
          if (actualError?.includes("AI_API_KEY") || actualError?.includes("AI service not configured")) {
            throw new Error("❌ AI_API_KEY secret is missing! Go to Supabase Dashboard → Edge Functions → Secrets → Add 'AI_API_KEY' with your Gemini API key. Get it from https://makersuite.google.com/app/apikey");
          }
          if (actualError?.includes("models/gemini-1.5-flash is not found")) {
            throw new Error("❌ Gemini API Error: Model not found. Please update your edge function to use the v1 API endpoint instead of v1beta.");
          }
          throw new Error(`❌ Server error: ${actualError || "Check Supabase Dashboard → Edge Functions → coffee-chat → Logs for details."}`);
        }
        
        if (statusCode === 400) {
          throw new Error(`❌ Bad request: ${actualError || "Invalid request format."}`);
        }
        
        if (statusCode === 429) {
          throw new Error("❌ Rate limit exceeded. Please wait a moment and try again.");
        }
        
        throw new Error(`❌ Error (${statusCode || "unknown"}): ${actualError || "Check Supabase logs for details."}`);
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
        
        // Provide specific help based on error type
        if (error.message.includes("Failed to fetch") || error.message.includes("NetworkError") || error.message.includes("Network error")) {
          errorMessage = "Unable to connect to the chat service. The edge function may not be deployed. Please check Supabase Edge Functions and ensure 'coffee-chat' is deployed.";
        } else if (error.message.includes("AI service not configured")) {
          errorMessage = "AI service not configured. Please set AI_API_KEY in Supabase secrets with your Gemini API key.";
        } else if (error.message.includes("Supabase configuration")) {
          errorMessage = "Missing Supabase configuration. Please check VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY are set.";
        } else if (error.message.includes("models/gemini-1.5-flash is not found") || error.message.includes("v1beta")) {
          errorMessage = "❌ API Version Error: Your edge function needs to be updated to use Gemini's v1 API instead of v1beta. Please redeploy with the fixed code.";
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

  if (loadingHistory) {
    return <FullPageLoading />;
  }

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-background via-secondary/20 to-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm px-4 py-4">
        <div className="container mx-auto flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <Coffee className="h-8 w-8 text-primary" />
          <div className="flex-1">
            <h1 className="text-xl font-bold text-foreground">Venessa</h1>
            <p className="text-sm text-muted-foreground">Your AI Barista</p>
          </div>
          {retryCount > 2 && (
            <div className="flex items-center gap-2 text-sm text-yellow-600 dark:text-yellow-500">
              <AlertCircle className="h-4 w-4" />
              <span>Connection issues detected</span>
            </div>
          )}
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="container mx-auto max-w-4xl space-y-6">
          {messages.length === 0 && (
            <>
              <div className="text-center py-12">
                <Coffee className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h2 className="text-2xl font-semibold mb-2">Start Your Coffee Journey</h2>
                <p className="text-muted-foreground mb-4">
                  Ask me anything about coffee! I can recommend drinks based on your taste.
                </p>
                <div className="flex flex-wrap gap-2 justify-center">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setInput("I want something strong and bold")}
                  >
                    Strong & Bold
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setInput("I prefer sweet and creamy drinks")}
                  >
                    Sweet & Creamy
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setInput("What's a good cold coffee for summer?")}
                  >
                    Cold Coffee
                  </Button>
                </div>
              </div>
            </>
          )}

          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <Card
                className={`max-w-[80%] p-4 ${
                  message.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-card border-2"
                }`}
              >
                <p className="whitespace-pre-wrap">{message.content}</p>
              </Card>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <Card className="max-w-[80%] p-4 bg-card border-2">
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-muted-foreground">Brewing response...</span>
                </div>
              </Card>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="border-t border-border bg-card/50 backdrop-blur-sm px-4 py-4">
        <form onSubmit={handleSubmit} className="container mx-auto max-w-4xl">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about coffee recommendations..."
              disabled={loading}
              className="flex-1"
            />
            <Button type="submit" disabled={loading} variant="hero">
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}