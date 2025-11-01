import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Package, ShoppingBag, ArrowLeft, Coffee } from "lucide-react";
import { format } from "date-fns";

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
}

export default function Orders() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadOrders();
    }
  }, [user]);

  const loadOrders = async () => {
    try {
      const { data, error } = await supabase
        .from("orders")
        .select(
          `
          *,
          order_items (
            *,
            coffee:coffees (name, image_url)
          )
        `
        )
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setOrders((data as any) || []);
    } catch (error: any) {
      console.error("Error loading orders:", error);
    } finally {
      setLoading(false);
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

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6">
            <div className="text-center">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Sign In Required</h2>
              <p className="text-muted-foreground mb-4">
                Please sign in to view your orders
              </p>
              <Button onClick={() => navigate("/auth")}>Sign In</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <ShoppingBag className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">My Orders</h1>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-4 bg-muted rounded w-1/4 mb-4" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : orders.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-20">
                <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h2 className="text-2xl font-semibold mb-2">No orders yet</h2>
                <p className="text-muted-foreground mb-6">
                  Start shopping to see your orders here
                </p>
                <Button onClick={() => navigate("/shop")}>
                  <Coffee className="h-4 w-4 mr-2" />
                  Browse Products
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <Card key={order.id} className="overflow-hidden">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        Order #{order.id.slice(0, 8).toUpperCase()}
                        <Badge className={getStatusColor(order.status)}>
                          {getStatusLabel(order.status)}
                        </Badge>
                      </CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        Placed on {format(new Date(order.created_at), "PPP p")}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold">₹{order.total_amount.toFixed(2)}</p>
                      <p className="text-xs text-muted-foreground">
                        {order.payment_method}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">Items:</h3>
                    <div className="space-y-2">
                      {order.order_items.map((item) => (
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
                            <p className="font-semibold">{item.coffee?.name}</p>
                            <p className="text-sm text-muted-foreground">
                              Qty: {item.quantity} × ₹{item.price.toFixed(2)}
                            </p>
                          </div>
                          <p className="font-semibold">
                            ₹{item.subtotal.toFixed(2)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="border-t pt-4">
                    <h3 className="font-semibold mb-2">Delivery Address:</h3>
                    <p className="text-sm text-muted-foreground">
                      {order.shipping_address}, {order.shipping_city}{" "}
                      {order.shipping_postal_code}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Phone: {order.shipping_phone}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

