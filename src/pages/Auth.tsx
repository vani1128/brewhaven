import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { Coffee, Mail } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useEffect } from "react";

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const { signUp, signIn, resetPassword, user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  // Check if password reset was requested
  useEffect(() => {
    if (searchParams.get("reset") === "true") {
      setIsForgotPassword(false);
      toast({
        title: "Check your email",
        description: "We've sent you a password reset link. Please check your inbox.",
      });
    }
  }, [searchParams, toast]);

  const validateForm = () => {
    if (!email || !password) {
      toast({
        title: "Validation Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return false;
    }

    if (!email.includes("@")) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return false;
    }

    if (password.length < 6) {
      toast({
        title: "Password Too Short",
        description: "Password must be at least 6 characters",
        variant: "destructive",
      });
      return false;
    }

    if (!isLogin && !fullName) {
      toast({
        title: "Name Required",
        description: "Please enter your full name",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);

    try {
      if (isLogin) {
        const { error, data } = await signIn(email, password);
        if (error) {
          if (error.message.includes("Invalid login credentials") || error.message.includes("Invalid email or password")) {
            toast({
              title: "Login Failed",
              description: "Invalid email or password. Please check your credentials and try again.",
              variant: "destructive",
            });
          } else if (error.message.includes("Email not confirmed")) {
            toast({
              title: "Email Not Verified",
              description: "Please check your email and click the verification link before signing in.",
              variant: "destructive",
            });
          } else {
            toast({
              title: "Error",
              description: error.message || "Failed to sign in. Please try again.",
              variant: "destructive",
            });
          }
        } else {
          toast({
            title: "Welcome back!",
            description: "You've successfully signed in.",
          });
          navigate("/");
        }
      } else {
        const { error, data } = await signUp(email, password, fullName);
        if (error) {
          if (error.message.includes("User already registered") || error.message.includes("already registered")) {
            toast({
              title: "Account Exists",
              description: "This email is already registered. Please sign in instead.",
              variant: "destructive",
            });
          } else {
            toast({
              title: "Error",
              description: error.message || "Failed to create account. Please try again.",
              variant: "destructive",
            });
          }
        } else {
          // Check if email confirmation is required
          if (data?.user && !data.session) {
            toast({
              title: "Account Created!",
              description: "Please check your email to verify your account before signing in.",
            });
          } else {
            toast({
              title: "Account Created!",
              description: "Welcome to BrewHaven!",
            });
            navigate("/");
          }
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : "An unexpected error occurred";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !email.includes("@")) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await resetPassword(email);
      if (error) {
        toast({
          title: "Error",
          description: error.message || "Failed to send reset email",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Email Sent",
          description: "Check your email for password reset instructions.",
        });
        setIsForgotPassword(false);
        setEmail("");
      }
    } catch (error) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : "An unexpected error occurred";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Coffee className="h-10 w-10 text-primary" />
            <span className="text-3xl font-bold text-foreground">BrewHaven</span>
          </div>
          <p className="text-muted-foreground">Your AI Coffee Companion</p>
        </div>

        <Card className="border-2 shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl">
              {isForgotPassword ? "Reset Password" : isLogin ? "Welcome Back" : "Create Account"}
            </CardTitle>
            <CardDescription>
              {isForgotPassword
                ? "Enter your email and we'll send you a reset link"
                : isLogin
                ? "Sign in to continue your coffee journey"
                : "Join us and discover your perfect coffee"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={isForgotPassword ? handleForgotPassword : handleSubmit} className="space-y-4">
              {!isForgotPassword && !isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="Enter your full name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    disabled={loading}
                  />
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                />
              </div>

              {!isForgotPassword && (
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                  />
                </div>
              )}

              {isLogin && !isForgotPassword && (
                <div className="text-right">
                  <button
                    type="button"
                    onClick={() => {
                      setIsForgotPassword(true);
                      setPassword("");
                    }}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    disabled={loading}
                  >
                    Forgot password?
                  </button>
                </div>
              )}

              <Button
                type="submit"
                className="w-full"
                variant="hero"
                size="lg"
                disabled={loading}
              >
                {loading
                  ? "Please wait..."
                  : isForgotPassword
                  ? "Send Reset Link"
                  : isLogin
                  ? "Sign In"
                  : "Create Account"}
              </Button>

              {isForgotPassword ? (
                <div className="text-center pt-4 space-y-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsForgotPassword(false);
                      setEmail("");
                    }}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors block w-full"
                    disabled={loading}
                  >
                    ← Back to Sign In
                  </button>
                </div>
              ) : (
                <div className="text-center pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setIsLogin(!isLogin);
                      setEmail("");
                      setPassword("");
                      setFullName("");
                      setIsForgotPassword(false);
                    }}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    disabled={loading}
                  >
                    {isLogin
                      ? "Don't have an account? Sign up"
                      : "Already have an account? Sign in"}
                  </button>
                </div>
              )}
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
