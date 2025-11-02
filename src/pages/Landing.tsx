import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { supabase } from "@/integrations/supabase/client";
import { Coffee, Sparkles, Users, TrendingUp, ShoppingCart, ShoppingBag, Package, ArrowRight, Menu } from "lucide-react";

interface CoffeeProduct {
  id: string;
  name: string;
  description: string | null;
  price: number;
  inventory: number;
  featured: boolean;
  image_url: string | null;
  type: string;
}

export default function Landing() {
  const navigate = useNavigate();
  const { user, signOut, isAdmin, loading: authLoading } = useAuth();
  const { totalItems } = useCart();
  const [featuredProducts, setFeaturedProducts] = useState<CoffeeProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Debug: Log admin status
  useEffect(() => {
    if (user && !authLoading) {
      console.log("🔍 Admin Status Check:", {
        userId: user.id,
        email: user.email,
        isAdmin: isAdmin,
        timestamp: new Date().toISOString()
      });
    }
  }, [user, isAdmin, authLoading]);

  useEffect(() => {
    loadFeaturedProducts();
  }, []);

  const loadFeaturedProducts = async () => {
    try {
      const { data, error } = await supabase
        .from("coffees")
        .select("*")
        .eq("featured", true)
        .gt("inventory", 0)
        .limit(6)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setFeaturedProducts(data || []);
    } catch (error) {
      console.error("Error loading featured products:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background">
      {/* Navigation */}
      <nav className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/")}>
            <Coffee className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold text-foreground">BrewHaven</span>
          </div>
          
          {/* Desktop Navigation - Hidden on mobile */}
          <div className="hidden md:flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate("/shop")}>
              <ShoppingBag className="h-4 w-4 mr-2" />
              Shop
            </Button>
            {user ? (
              <>
                <Button variant="ghost" onClick={() => navigate("/chat")}>
                  Chat
                </Button>
                <Button variant="ghost" onClick={() => navigate("/orders")}>
                  <Package className="h-4 w-4 mr-2" />
                  Orders
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => navigate("/cart")}
                  className="relative"
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Cart
                  {totalItems > 0 && (
                    <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0">
                      {totalItems}
                    </Badge>
                  )}
                </Button>
                <Button variant="ghost" onClick={() => navigate("/profile")}>
                  Profile
                </Button>
                {isAdmin && (
                  <Button 
                    variant="default" 
                    onClick={() => navigate("/admin")}
                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    <Coffee className="h-4 w-4 mr-2" />
                    Admin Panel
                  </Button>
                )}
                <Button variant="outline" onClick={async () => {
                  await signOut();
                  navigate("/auth");
                }}>
                  Sign Out
                </Button>
              </>
            ) : (
              <Button variant="hero" onClick={() => navigate("/auth")}>
                Get Started
              </Button>
            )}
          </div>

          {/* Mobile Navigation - Show hamburger + cart only */}
          <div className="md:hidden flex items-center gap-2">
            {user && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/cart")}
                className="relative"
              >
                <ShoppingCart className="h-5 w-5" />
                {totalItems > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs">
                    {totalItems}
                  </Badge>
                )}
              </Button>
            )}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <div className="flex flex-col gap-4 mt-8">
                  <div className="flex items-center gap-2 mb-4">
                    <Coffee className="h-6 w-6 text-primary" />
                    <span className="text-xl font-bold">BrewHaven</span>
                  </div>
                  
                  <Button 
                    variant="ghost" 
                    className="justify-start"
                    onClick={() => {
                      navigate("/shop");
                      setMobileMenuOpen(false);
                    }}
                  >
                    <ShoppingBag className="h-4 w-4 mr-2" />
                    Shop
                  </Button>
                  
                  {user ? (
                    <>
                      <Button 
                        variant="ghost" 
                        className="justify-start"
                        onClick={() => {
                          navigate("/chat");
                          setMobileMenuOpen(false);
                        }}
                      >
                        Chat
                      </Button>
                      <Button 
                        variant="ghost" 
                        className="justify-start"
                        onClick={() => {
                          navigate("/orders");
                          setMobileMenuOpen(false);
                        }}
                      >
                        <Package className="h-4 w-4 mr-2" />
                        Orders
                      </Button>
                      <Button 
                        variant="ghost" 
                        className="justify-start relative"
                        onClick={() => {
                          navigate("/cart");
                          setMobileMenuOpen(false);
                        }}
                      >
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        Cart
                        {totalItems > 0 && (
                          <Badge className="ml-2 h-5 w-5 flex items-center justify-center p-0">
                            {totalItems}
                          </Badge>
                        )}
                      </Button>
                      <Button 
                        variant="ghost" 
                        className="justify-start"
                        onClick={() => {
                          navigate("/profile");
                          setMobileMenuOpen(false);
                        }}
                      >
                        Profile
                      </Button>
                      {isAdmin && (
                        <Button 
                          variant="ghost" 
                          className="justify-start"
                          onClick={() => {
                            navigate("/admin");
                            setMobileMenuOpen(false);
                          }}
                        >
                          <Coffee className="h-4 w-4 mr-2" />
                          Admin Panel
                        </Button>
                      )}
                      <Button 
                        variant="outline" 
                        className="justify-start"
                        onClick={async () => {
                          await signOut();
                          navigate("/auth");
                          setMobileMenuOpen(false);
                        }}
                      >
                        Sign Out
                      </Button>
                    </>
                  ) : (
                    <Button 
                      variant="hero" 
                      className="justify-start"
                      onClick={() => {
                        navigate("/auth");
                        setMobileMenuOpen(false);
                      }}
                    >
                      Get Started
                    </Button>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 md:py-32">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="inline-block">
            <div className="bg-accent/20 text-accent px-4 py-2 rounded-full text-sm font-medium mb-6">
              🤖 AI-Powered Coffee Recommendations
            </div>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold text-foreground leading-tight">
            Premium
            <span className="bg-gradient-to-r from-[hsl(25_50%_25%)] to-[hsl(35_60%_55%)] bg-clip-text text-transparent"> Coffee</span>
            <br />
            Delivered to Your Door
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Discover handcrafted coffee blends from around the world. Order now and enjoy fresh coffee with Cash on Delivery.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Button 
              size="xl" 
              variant="hero"
              onClick={() => navigate("/shop")}
              className="w-full sm:w-auto"
            >
              <ShoppingBag className="mr-2 h-5 w-5" />
              Shop Now
            </Button>
            <Button 
              size="xl" 
              variant="outline"
              onClick={() => navigate("/chat")}
              className="w-full sm:w-auto"
            >
              🤖 AI Recommendations
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20 bg-card/30 rounded-3xl my-20">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">
            Why Choose BrewHaven?
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-card border border-border rounded-2xl p-8 hover:shadow-lg transition-all duration-300">
              <div className="bg-accent/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                🤖
              </div>
              <h3 className="text-xl font-semibold mb-3">AI-Powered</h3>
              <p className="text-muted-foreground">
                Get personalized recommendations using advanced AI technology tailored to your preferences.
              </p>
            </div>

            <div className="bg-card border border-border rounded-2xl p-8 hover:shadow-lg transition-all duration-300">
              <div className="bg-accent/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Coffee className="h-6 w-6 text-accent" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Vast Selection</h3>
              <p className="text-muted-foreground">
                Explore hundreds of coffee varieties from espresso to cold brew, all in one place.
              </p>
            </div>

            <div className="bg-card border border-border rounded-2xl p-8 hover:shadow-lg transition-all duration-300">
              <div className="bg-accent/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <TrendingUp className="h-6 w-6 text-accent" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Learn & Discover</h3>
              <p className="text-muted-foreground">
                Discover new coffee types and expand your palate with expert recommendations.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-2">
                Featured Products
              </h2>
              <p className="text-muted-foreground">
                Our most popular coffee selections
              </p>
            </div>
            <Button variant="outline" onClick={() => navigate("/shop")}>
              View All
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>

          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-48 bg-muted rounded-lg" />
                  </CardHeader>
                  <CardContent>
                    <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                    <div className="h-3 bg-muted rounded w-1/2" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : featuredProducts.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredProducts.map((product) => (
                <Card
                  key={product.id}
                  className="overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer"
                  onClick={() => navigate("/shop")}
                >
                  <div className="relative">
                    <Badge className="absolute top-2 right-2 z-10">
                      Featured
                    </Badge>
                    <div className="h-48 bg-gradient-to-br from-[hsl(25_50%_25%)] to-[hsl(35_60%_55%)] flex items-center justify-center">
                      {product.image_url ? (
                        <img
                          src={product.image_url}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Coffee className="h-20 w-20 text-primary-foreground/20" />
                      )}
                    </div>
                  </div>
                  <CardHeader>
                    <CardTitle className="line-clamp-1">{product.name}</CardTitle>
                    <CardDescription className="line-clamp-2">
                      {product.description || "Premium coffee blend"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-primary">
                        ₹{product.price.toFixed(2)}
                      </span>
                      <Badge variant="outline">{product.type}</Badge>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button className="w-full" onClick={(e) => {
                      e.stopPropagation();
                      navigate("/shop");
                    }}>
                      View Product
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-12">
                  <Coffee className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    No featured products available at the moment
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto bg-gradient-to-r from-[hsl(25_50%_25%)] to-[hsl(30_45%_35%)] rounded-3xl p-12 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-6">
            Ready to Order Your Perfect Brew?
          </h2>
          <p className="text-primary-foreground/90 text-lg mb-8 max-w-2xl mx-auto">
            Join thousands of coffee lovers. Order now and pay on delivery with Cash on Delivery.
          </p>
          <Button 
            size="xl" 
            variant="secondary"
            onClick={() => navigate("/shop")}
          >
            <ShoppingBag className="mr-2 h-5 w-5" />
            Shop Now
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card/50 backdrop-blur-sm mt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Coffee className="h-6 w-6 text-primary" />
              <span className="font-semibold text-foreground">BrewHaven</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2025 BrewHaven. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
