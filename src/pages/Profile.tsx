import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Coffee, Mail, User, Calendar, ArrowLeft, MessageSquare } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { FullPageLoading } from "@/components/LoadingSpinner";

interface Profile {
  email: string;
  full_name: string;
  created_at: string;
  role: string;
}

export default function Profile() {
  const { user, signOut, isAdmin } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [chatCount, setChatCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadProfile();
      loadChatCount();
    }
  }, [user]);

  const loadProfile = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user?.id)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error("Error loading profile:", error);
      const errorMessage = error instanceof Error 
        ? error.message 
        : "Failed to load profile";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadChatCount = async () => {
    try {
      const { count, error } = await supabase
        .from("chat_history")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user?.id);

      if (error) throw error;
      setChatCount(count || 0);
    } catch (error) {
      console.error("Error loading chat count:", error);
      // Silently fail for chat count
    }
  };

  if (loading) {
    return <FullPageLoading />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm px-4 py-4">
        <div className="container mx-auto flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <Coffee className="h-8 w-8 text-primary" />
          <h1 className="text-xl font-bold text-foreground">Profile</h1>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="grid gap-6">
          {/* Profile Info Card */}
          <Card className="border-2">
            <CardHeader>
              <CardTitle className="text-2xl">Account Information</CardTitle>
              <CardDescription>Your BrewHaven account details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3 p-4 bg-secondary/30 rounded-lg">
                <User className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Full Name</p>
                  <p className="font-medium">{profile?.full_name || "Not set"}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-secondary/30 rounded-lg">
                <Mail className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{profile?.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-secondary/30 rounded-lg">
                <Calendar className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Member Since</p>
                  <p className="font-medium">
                    {profile?.created_at
                      ? new Date(profile.created_at).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })
                      : "Unknown"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Activity Card */}
          <Card className="border-2">
            <CardHeader>
              <CardTitle>Activity</CardTitle>
              <CardDescription>Your BrewHaven usage statistics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3 p-4 bg-secondary/30 rounded-lg">
                <MessageSquare className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Total Conversations</p>
                  <p className="text-2xl font-bold text-foreground">{chatCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Admin Panel Access */}
          {isAdmin && (
            <Card className="border-2 border-primary/20 bg-primary/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Coffee className="h-5 w-5 text-primary" />
                  Admin Access
                </CardTitle>
                <CardDescription>You have admin privileges to manage the coffee shop</CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  variant="default"
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                  onClick={() => navigate("/admin")}
                >
                  <Coffee className="h-4 w-4 mr-2" />
                  Open Admin Panel
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              variant="hero"
              className="flex-1"
              onClick={() => navigate("/chat")}
            >
              Continue Chatting
            </Button>
            <Button
              variant="destructive"
              className="flex-1"
              onClick={async () => {
                await signOut();
                navigate("/auth");
              }}
            >
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
