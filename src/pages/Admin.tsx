import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { Coffee, Plus, Trash2, Edit, ArrowLeft, Users, MessageSquare, ShoppingBag, CheckCircle, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { FullPageLoading } from "@/components/LoadingSpinner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";

interface Coffee {
  id: string;
  name: string;
  description: string;
  type: string;
  category_id: string;
  price?: number;
  inventory?: number;
  featured?: boolean;
  image_url?: string | null;
}

interface Category {
  id: string;
  name: string;
}

interface Stats {
  totalUsers: number;
  totalChats: number;
  totalCoffees: number;
  totalOrders: number;
}

interface OrderItem {
  id: string;
  coffee_id: string;
  quantity: number;
  price: number;
  subtotal: number;
  coffee: {
    name: string;
    image_url: string | null;
  };
}

interface Order {
  id: string;
  user_id: string;
  status: string;
  payment_method: string;
  shipping_address: string;
  shipping_city: string;
  shipping_postal_code: string;
  shipping_phone: string;
  total_amount: number;
  created_at: string;
  updated_at: string;
  order_items: OrderItem[];
  user_email?: string;
  user_full_name?: string | null;
}

export default function Admin() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [coffees, setCoffees] = useState<Coffee[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [stats, setStats] = useState<Stats>({ totalUsers: 0, totalChats: 0, totalCoffees: 0, totalOrders: 0 });
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeTab, setActiveTab] = useState<"coffees" | "orders">("coffees");
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCoffee, setEditingCoffee] = useState<Coffee | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    type: "Hot",
    category_id: "",
    price: 100,
    inventory: 0,
    featured: false,
    image_url: "",
  });

  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      try {
        setError(null);
        setLoading(true);

        const [coffeesResult, categoriesResult, usersResult, chatsResult, coffeesCountResult, ordersCountResult] = await Promise.all([
          supabase.from("coffees").select("*").order("created_at", { ascending: false }),
          supabase.from("categories").select("*").order("name"),
          supabase.from("profiles").select("*", { count: "exact", head: true }),
          supabase.from("chat_history").select("*", { count: "exact", head: true }),
          supabase.from("coffees").select("*", { count: "exact", head: true }),
          supabase.from("orders").select("*", { count: "exact", head: true }),
        ]);

        if (cancelled) return;

        if (coffeesResult.error) {
          throw new Error(`Failed to load coffees: ${coffeesResult.error.message}`);
        }

        if (categoriesResult.error) {
          throw new Error(`Failed to load categories: ${categoriesResult.error.message}`);
        }

        setCoffees(coffeesResult.data || []);
        setCategories(categoriesResult.data || []);

        if (usersResult.count !== null && chatsResult.count !== null && coffeesCountResult.count !== null && ordersCountResult.count !== null) {
          setStats({
            totalUsers: usersResult.count,
            totalChats: chatsResult.count,
            totalCoffees: coffeesCountResult.count,
            totalOrders: ordersCountResult.count,
          });
        }

        if (!categoriesResult.data || categoriesResult.data.length === 0) {
          toast({
            title: "No Categories Found",
            description: "Please create categories first before adding coffees.",
            variant: "destructive",
          });
        }
      } catch (err) {
        if (cancelled) return;
        const errorMessage = err instanceof Error ? err.message : "Failed to load admin data";
        setError(errorMessage);
        console.error("Error loading admin data:", err);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadData();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load orders when orders tab becomes active
  useEffect(() => {
    if (activeTab === "orders") {
      loadOrders();
    } else {
      // Clear orders when switching away from orders tab
      setOrders([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const loadCoffees = async () => {
    const { data, error } = await supabase
      .from("coffees")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error loading coffees:", error);
      toast({
        title: "Error",
        description: "Failed to reload coffees list.",
        variant: "destructive",
      });
      return;
    }
    setCoffees(data || []);
  };

  const loadStats = async () => {
    const [usersResult, chatsResult, coffeesResult, ordersResult] = await Promise.all([
      supabase.from("profiles").select("*", { count: "exact", head: true }),
      supabase.from("chat_history").select("*", { count: "exact", head: true }),
      supabase.from("coffees").select("*", { count: "exact", head: true }),
      supabase.from("orders").select("*", { count: "exact", head: true }),
    ]);

    setStats({
      totalUsers: usersResult.count || 0,
      totalChats: chatsResult.count || 0,
      totalCoffees: coffeesResult.count || 0,
      totalOrders: ordersResult.count || 0,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.description || !formData.category_id) {
      toast({
        title: "Validation Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    if (formData.price < 100) {
      toast({
        title: "Validation Error",
        description: "Price must be at least ₹100",
        variant: "destructive",
      });
      return;
    }

    try {
      const updateData = {
        ...formData,
        image_url: formData.image_url?.trim() || null,
      };

      if (editingCoffee) {
        const { error } = await supabase
          .from("coffees")
          .update(updateData)
          .eq("id", editingCoffee.id);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Coffee updated successfully",
        });
      } else {
        const { error } = await supabase.from("coffees").insert(updateData);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Coffee added successfully",
        });
      }

      setDialogOpen(false);
      resetForm();
      loadCoffees();
      loadStats();
    } catch (error) {
      console.error("Error saving coffee:", error);
      const errorMessage = error instanceof Error 
        ? error.message 
        : "Failed to save coffee";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this coffee?")) return;

    try {
      const { error } = await supabase.from("coffees").delete().eq("id", id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Coffee deleted successfully",
      });

      loadCoffees();
      loadStats();
    } catch (error) {
      console.error("Error deleting coffee:", error);
      const errorMessage = error instanceof Error 
        ? error.message 
        : "Failed to delete coffee";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleEdit = (coffee: Coffee) => {
    setEditingCoffee(coffee);
    setFormData({
      name: coffee.name,
      description: coffee.description || "",
      type: coffee.type,
      category_id: coffee.category_id || "",
      price: coffee.price || 100,
      inventory: coffee.inventory || 0,
      featured: coffee.featured || false,
      image_url: coffee.image_url || "",
    });
    setDialogOpen(true);
  };

  const resetForm = () => {
    setEditingCoffee(null);
    setFormData({
      name: "",
      description: "",
      type: "Hot",
      category_id: "",
      price: 100,
      inventory: 0,
      featured: false,
      image_url: "",
    });
  };

  const loadOrders = async () => {
    try {
      // Load orders with items
      const { data: ordersData, error: ordersError } = await supabase
        .from("orders")
        .select(`
          *,
          order_items (
            *,
            coffee:coffees (name, image_url)
          )
        `)
        .order("created_at", { ascending: false });

      if (ordersError) throw ordersError;

      // Get user profiles with full details
      const userIds = [...new Set((ordersData || []).map((o: any) => o.user_id))];
      const { data: profilesData } = await supabase
        .from("profiles")
        .select("id, email, full_name")
        .in("id", userIds);

      // Create profile map
      const profileMap = new Map((profilesData || []).map((p: any) => [p.id, p]));

      // Format orders with user details
      const formattedOrders = (ordersData || []).map((order: any) => {
        const profile = profileMap.get(order.user_id);
        return {
          ...order,
          user_email: profile?.email || "Unknown",
          user_full_name: profile?.full_name || null
        };
      });

      setOrders(formattedOrders);
    } catch (error) {
      console.error("Error loading orders:", error);
      toast({
        title: "Error",
        description: "Failed to load orders",
        variant: "destructive",
      });
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: "pending" | "confirmed" | "processing" | "out_for_delivery" | "delivered" | "cancelled") => {
    try {
      const { error } = await supabase
        .from("orders")
        .update({ status: newStatus })
        .eq("id", orderId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Order status updated to ${newStatus.replace("_", " ")}`,
      });

      // Reload orders
      loadOrders();
    } catch (error: any) {
      console.error("Error updating order status:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update order status",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400";
      case "confirmed":
        return "bg-blue-500/10 text-blue-600 dark:text-blue-400";
      case "processing":
        return "bg-purple-500/10 text-purple-600 dark:text-purple-400";
      case "out_for_delivery":
        return "bg-orange-500/10 text-orange-600 dark:text-orange-400";
      case "delivered":
        return "bg-green-500/10 text-green-600 dark:text-green-400";
      case "cancelled":
        return "bg-red-500/10 text-red-600 dark:text-red-400";
      default:
        return "bg-gray-500/10 text-gray-600 dark:text-gray-400";
    }
  };

  const getStatusLabel = (status: string) => {
    return status
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };


  if (loading) {
    return <FullPageLoading />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Error Loading Admin Panel</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={() => window.location.reload()} className="w-full">
              Reload Page
            </Button>
            <Button variant="outline" onClick={() => navigate("/")} className="w-full">
              Go Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
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
          <h1 className="text-xl font-bold text-foreground">Admin Dashboard</h1>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12 max-w-6xl space-y-8">
        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Chats</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalChats}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Coffees</CardTitle>
              <Coffee className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalCoffees}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
              <ShoppingBag className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalOrders}</div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 border-b border-border">
          <Button
            variant={activeTab === "coffees" ? "default" : "ghost"}
            onClick={() => setActiveTab("coffees")}
          >
            <Coffee className="h-4 w-4 mr-2" />
            Coffee Management
          </Button>
          <Button
            variant={activeTab === "orders" ? "default" : "ghost"}
            onClick={() => setActiveTab("orders")}
          >
            <ShoppingBag className="h-4 w-4 mr-2" />
            Order Management
          </Button>
        </div>

        {/* Coffee Management */}
        {activeTab === "coffees" && (
          <Card className="border-2">
            <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Coffee Management</CardTitle>
                <CardDescription>Add, edit, or remove coffee items</CardDescription>
              </div>
              <Dialog open={dialogOpen} onOpenChange={(open) => {
                setDialogOpen(open);
                if (!open) resetForm();
              }}>
                <DialogTrigger asChild>
                  <Button variant="hero">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Coffee
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{editingCoffee ? "Edit Coffee" : "Add New Coffee"}</DialogTitle>
                    <DialogDescription>
                      Fill in the details for the coffee item
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Name</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g., Caramel Latte"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Describe the coffee..."
                        rows={3}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="type">Type</Label>
                      <Select
                        value={formData.type}
                        onValueChange={(value) => setFormData({ ...formData, type: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Hot">Hot</SelectItem>
                          <SelectItem value="Cold">Cold</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="category">Category</Label>
                      <Select
                        value={formData.category_id || undefined}
                        onValueChange={(value) => setFormData({ ...formData, category_id: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((cat) => (
                            <SelectItem key={cat.id} value={cat.id}>
                              {cat.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="price">Price (₹)</Label>
                        <Input
                          id="price"
                          type="number"
                          step="0.01"
                          min="100"
                          value={formData.price}
                          onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 100 })}
                          placeholder="100.00"
                        />
                        <p className="text-xs text-muted-foreground">
                          Minimum price: ₹100
                        </p>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="inventory">Inventory</Label>
                        <Input
                          id="inventory"
                          type="number"
                          min="0"
                          value={formData.inventory}
                          onChange={(e) => setFormData({ ...formData, inventory: parseInt(e.target.value) || 0 })}
                          placeholder="0"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="image_url">Image URL (Optional)</Label>
                      <Input
                        id="image_url"
                        type="url"
                        value={formData.image_url}
                        onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                        placeholder="https://example.com/coffee-image.jpg"
                      />
                      <p className="text-xs text-muted-foreground">
                        Enter a direct image URL. For featured products, use high-quality images (800x600px recommended).
                      </p>
                      {formData.image_url && (
                        <div className="mt-2">
                          <p className="text-xs text-muted-foreground mb-1">Preview:</p>
                          <img
                            src={formData.image_url}
                            alt="Preview"
                            className="w-full h-32 object-cover rounded-md border"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                          />
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="featured"
                          checked={formData.featured}
                          onCheckedChange={(checked) => setFormData({ ...formData, featured: checked === true })}
                        />
                        <Label htmlFor="featured" className="cursor-pointer">
                          Featured Product
                        </Label>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-4">
                      <Button type="submit" className="flex-1" variant="hero">
                        {editingCoffee ? "Update" : "Add"} Coffee
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setDialogOpen(false);
                          resetForm();
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {coffees.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No coffees yet. Add your first one!
                </p>
              ) : (
                coffees.map((coffee) => (
                  <div
                    key={coffee.id}
                    className="flex items-center gap-4 p-4 border border-border rounded-lg hover:bg-secondary/30 transition-colors"
                  >
                    {coffee.image_url ? (
                      <div className="w-20 h-20 flex-shrink-0 rounded-md overflow-hidden border">
                        <img
                          src={coffee.image_url}
                          alt={coffee.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      </div>
                    ) : (
                      <div className="w-20 h-20 flex-shrink-0 rounded-md border flex items-center justify-center bg-muted">
                        <Coffee className="h-8 w-8 text-muted-foreground/50" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{coffee.name}</h3>
                        {coffee.featured && (
                          <Badge variant="secondary" className="text-xs">Featured</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-1">
                        {coffee.description}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                        <span>{coffee.type}</span>
                        {coffee.price !== undefined && (
                          <span className="font-semibold text-primary">₹{coffee.price.toFixed(2)}</span>
                        )}
                        {coffee.inventory !== undefined && (
                          <span>Stock: {coffee.inventory}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(coffee)}
                        title="Edit coffee"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(coffee.id)}
                        title="Delete coffee"
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
          </Card>
        )}

        {/* Order Management */}
        {activeTab === "orders" && (
          <Card className="border-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Order Management</CardTitle>
                  <CardDescription>View and manage all customer orders</CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => loadOrders()}
                  title="Refresh orders"
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {orders.length === 0 ? (
                  <div className="text-center py-12">
                    <ShoppingBag className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">No orders yet</h3>
                    <p className="text-muted-foreground">
                      Orders will appear here when customers place them.
                    </p>
                  </div>
                ) : (
                  orders.map((order) => (
                    <Card key={order.id} className="overflow-hidden">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <CardTitle className="flex items-center gap-2">
                              Order #{order.id.slice(0, 8).toUpperCase()}
                              <Badge className={getStatusColor(order.status)}>
                                {getStatusLabel(order.status)}
                              </Badge>
                            </CardTitle>
                            <p className="text-sm text-muted-foreground mt-1">
                              Placed on: {new Date(order.created_at).toLocaleString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold">₹{order.total_amount.toFixed(2)}</p>
                            <p className="text-xs text-muted-foreground">{order.payment_method}</p>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {/* Customer Details */}
                        <div className="border-b pb-4">
                          <h4 className="font-semibold mb-3">Customer Details:</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                            <div>
                              <p className="text-muted-foreground mb-1">Name:</p>
                              <p className="font-medium">{order.user_full_name || "Not provided"}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground mb-1">Email:</p>
                              <p className="font-medium">{order.user_email || "Unknown"}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground mb-1">Phone:</p>
                              <p className="font-medium">{order.shipping_phone}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground mb-1">User ID:</p>
                              <p className="font-mono text-xs">{order.user_id.slice(0, 8)}...</p>
                            </div>
                          </div>
                        </div>

                        {/* Delivery Address */}
                        <div className="border-b pb-4">
                          <h4 className="font-semibold mb-2">Delivery Address:</h4>
                          <div className="text-sm space-y-1">
                            <p className="text-muted-foreground">
                              <span className="font-medium">Address:</span> {order.shipping_address}
                            </p>
                            <p className="text-muted-foreground">
                              <span className="font-medium">City:</span> {order.shipping_city}
                            </p>
                            <p className="text-muted-foreground">
                              <span className="font-medium">Postal Code:</span> {order.shipping_postal_code}
                            </p>
                          </div>
                        </div>

                        {/* Order Items */}
                        <div>
                          <h4 className="font-semibold mb-2">Order Items:</h4>
                          <div className="space-y-2">
                            {order.order_items?.map((item) => (
                              <div
                                key={item.id}
                                className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg"
                              >
                                <div className="w-16 h-16 bg-gradient-to-br from-[hsl(25_50%_25%)] to-[hsl(35_60%_55%)] rounded-lg flex items-center justify-center flex-shrink-0">
                                  {item.coffee?.image_url ? (
                                    <img
                                      src={item.coffee.image_url}
                                      alt={item.coffee.name}
                                      className="w-full h-full object-cover rounded-lg"
                                    />
                                  ) : (
                                    <Coffee className="h-8 w-8 text-primary-foreground/20" />
                                  )}
                                </div>
                                <div className="flex-1">
                                  <p className="font-semibold">{item.coffee?.name || "Unknown"}</p>
                                  <p className="text-sm text-muted-foreground">
                                    Qty: {item.quantity} × ₹{item.price.toFixed(2)}
                                  </p>
                                </div>
                                <p className="font-semibold">₹{item.subtotal.toFixed(2)}</p>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Status Update */}
                        <div className="border-t pt-4 flex items-center justify-between">
                          <div>
                            <Label htmlFor={`status-${order.id}`} className="mb-2 block">
                              Update Status:
                            </Label>
                            <Select
                              value={order.status}
                              onValueChange={(value) => updateOrderStatus(order.id, value as "pending" | "confirmed" | "processing" | "out_for_delivery" | "delivered" | "cancelled")}
                            >
                              <SelectTrigger className="w-[200px]">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="confirmed">Confirmed</SelectItem>
                                <SelectItem value="processing">Processing</SelectItem>
                                <SelectItem value="out_for_delivery">Out for Delivery</SelectItem>
                                <SelectItem value="delivered">Delivered</SelectItem>
                                <SelectItem value="cancelled">Cancelled</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateOrderStatus(order.id, "confirmed")}
                            disabled={order.status === "confirmed"}
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Confirm Order
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
