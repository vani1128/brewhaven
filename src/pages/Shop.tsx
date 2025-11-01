import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCart } from "@/contexts/CartContext";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ShoppingCart, Coffee, Search, Filter, Plus, Minus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Coffee {
  id: string;
  name: string;
  description: string | null;
  price: number;
  inventory: number;
  featured: boolean;
  image_url: string | null;
  type: string;
  category_id: string | null;
  category?: {
    name: string;
  };
}

export default function Shop() {
  const [coffees, setCoffees] = useState<Coffee[]>([]);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<string>("all");
  const { addToCart } = useCart();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    loadCategories();
    loadCoffees();
  }, []);

  useEffect(() => {
    loadCoffees();
  }, [selectedCategory, selectedType, searchQuery]);

  const loadCategories = async () => {
    try {
      const { data, error } = await supabase
        .from("categories")
        .select("id, name")
        .order("name");

      if (error) throw error;
      setCategories(data || []);
    } catch (error: any) {
      console.error("Error loading categories:", error);
    }
  };

  const loadCoffees = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("coffees")
        .select(`
          *,
          category:categories(id, name)
        `)
        .order("featured", { ascending: false })
        .order("created_at", { ascending: false });

      if (selectedCategory !== "all") {
        query = query.eq("category_id", selectedCategory);
      }

      if (selectedType !== "all") {
        query = query.eq("type", selectedType);
      }

      if (searchQuery.trim()) {
        query = query.or(`name.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);
      }

      const { data, error } = await query;

      if (error) throw error;
      setCoffees((data as any) || []);
    } catch (error: any) {
      console.error("Error loading coffees:", error);
      toast({
        title: "Error",
        description: "Failed to load products",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (coffee: Coffee) => {
    if (coffee.inventory <= 0) {
      toast({
        title: "Out of Stock",
        description: "This item is currently out of stock",
        variant: "destructive",
      });
      return;
    }

    addToCart({
      id: coffee.id,
      name: coffee.name,
      price: coffee.price,
      quantity: 1,
      image_url: coffee.image_url,
    });

    toast({
      title: "Added to Cart",
      description: `${coffee.name} has been added to your cart`,
    });
  };

  const filteredCoffees = coffees.filter((coffee) => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        coffee.name.toLowerCase().includes(query) ||
        coffee.description?.toLowerCase().includes(query)
      );
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background">
      {/* Header */}
      <div className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Coffee className="h-8 w-8 text-primary" />
              <h1 className="text-3xl font-bold">BrewHaven</h1>
            </div>
            <Button
              variant="outline"
              onClick={() => navigate("/cart")}
              className="relative"
            >
              <ShoppingCart className="h-5 w-5 mr-2" />
              View Cart
            </Button>
          </div>

          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search coffees..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full md:w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="Hot">Hot</SelectItem>
                <SelectItem value="Cold">Cold</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
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
        ) : filteredCoffees.length === 0 ? (
          <div className="text-center py-20">
            <Coffee className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-semibold mb-2">No products found</h2>
            <p className="text-muted-foreground">
              Try adjusting your search or filters
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredCoffees.map((coffee) => (
              <Card
                key={coffee.id}
                className="overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col"
              >
                <div className="relative">
                  {coffee.featured && (
                    <Badge className="absolute top-2 right-2 z-10">
                      Featured
                    </Badge>
                  )}
                  <div className="h-48 bg-gradient-to-br from-[hsl(25_50%_25%)] to-[hsl(35_60%_55%)] flex items-center justify-center">
                    {coffee.image_url ? (
                      <img
                        src={coffee.image_url}
                        alt={coffee.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Coffee className="h-20 w-20 text-primary-foreground/20" />
                    )}
                  </div>
                </div>
                <CardHeader>
                  <CardTitle className="line-clamp-1">{coffee.name}</CardTitle>
                  <CardDescription className="line-clamp-2">
                    {coffee.description || "Premium coffee blend"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl font-bold text-primary">
                      ₹{coffee.price.toFixed(2)}
                    </span>
                    <Badge variant="outline">{coffee.type}</Badge>
                  </div>
                  {coffee.category && (
                    <p className="text-sm text-muted-foreground mb-2">
                      {coffee.category.name}
                    </p>
                  )}
                  <p
                    className={`text-sm ${
                      coffee.inventory > 0
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {coffee.inventory > 0
                      ? `In Stock (${coffee.inventory})`
                      : "Out of Stock"}
                  </p>
                </CardContent>
                <CardFooter>
                  <Button
                    className="w-full"
                    onClick={() => handleAddToCart(coffee)}
                    disabled={coffee.inventory <= 0}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add to Cart
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

