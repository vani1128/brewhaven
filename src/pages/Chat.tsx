import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Coffee, ArrowLeft, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Chat() {
  const navigate = useNavigate();

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
            <p className="text-sm text-muted-foreground">AI Barista Chat</p>
          </div>
        </div>
      </header>

      {/* Coming Soon Content */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="container mx-auto max-w-2xl">
          <Card className="p-12 text-center space-y-6">
            <div className="flex justify-center">
              <div className="relative">
                <Coffee className="h-24 w-24 text-primary/60" />
                <Sparkles className="h-8 w-8 text-primary absolute -top-2 -right-2 animate-pulse" />
              </div>
            </div>
            
            <div className="space-y-3">
              <h2 className="text-3xl font-bold text-foreground">
                Coming Soon
              </h2>
              <p className="text-lg text-muted-foreground">
                Our AI barista chat feature is brewing!
              </p>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                Venessa, your AI coffee consultant, will be available soon to help you discover your perfect coffee match based on your preferences and mood.
              </p>
            </div>

            <div className="pt-6 space-y-4">
              <div className="bg-muted/50 rounded-lg p-6 space-y-3">
                <h3 className="font-semibold text-foreground">What to expect:</h3>
                <ul className="text-sm text-muted-foreground space-y-2 text-left max-w-md mx-auto">
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>Personalized coffee recommendations</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>Brewing tips and coffee knowledge</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>Conversation-based discovery</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>Chat history to remember your preferences</span>
                  </li>
                </ul>
              </div>

              <div className="pt-4">
                <Button 
                  variant="default" 
                  onClick={() => navigate("/shop")}
                  className="w-full sm:w-auto"
                >
                  Browse Coffee Shop
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
