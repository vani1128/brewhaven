import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { Coffee, Plus, Trash2, Edit, ArrowLeft, Users, MessageSquare, IceCream } from "lucide-react";
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
  ice_flavour_id?: string;
  price?: number;
  inventory?: number;
  featured?: boolean;
}

interface Category {
  id: string;
  name: string;
}

interface IceFlavour {
  id: string;
  name: string;
  description?: string;
  color?: string;
}

interface Stats {
  totalUsers: number;
  totalChats: number;
  totalCoffees: number;
}

export default function Admin() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [coffees, setCoffees] = useState<Coffee[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [iceFlavours, setIceFlavours] = useState<IceFlavour[]>([]);
  const [stats, setStats] = useState<Stats>({ totalUsers: 0, totalChats: 0, totalCoffees: 0 });
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCoffee, setEditingCoffee] = useState<Coffee | null>(null);
  const [iceFlavourDialogOpen, setIceFlavourDialogOpen] = useState(false);
  const [editingIceFlavour, setEditingIceFlavour] = useState<IceFlavour | null>(null);
  const [iceFlavourFormData, setIceFlavourFormData] = useState({
    name: "",
    description: "",
    color: "#CCCCCC",
  });

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    type: "Hot",
    category_id: "",
    ice_flavour_id: "",
    price: 0,
    inventory: 0,
    featured: false,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      await Promise.all([loadCoffees(), loadCategories(), loadIceFlavours(), loadStats()]);
    } finally {
      setLoading(false);
    }
  };

  const loadCoffees = async () => {
    const { data, error } = await supabase
      .from("coffees")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    setCoffees(data || []);
  };

  const loadCategories = async () => {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("name");

    if (error) throw error;
    setCategories(data || []);
  };

  const loadIceFlavours = async () => {
    const { data, error } = await supabase
      .from("ice_flavours")
      .select("*")
      .order("name");

    if (error) throw error;
    setIceFlavours(data || []);
  };

  const loadStats = async () => {
    const [usersResult, chatsResult, coffeesResult] = await Promise.all([
      supabase.from("profiles").select("*", { count: "exact", head: true }),
      supabase.from("chat_history").select("*", { count: "exact", head: true }),
      supabase.from("coffees").select("*", { count: "exact", head: true }),
    ]);

    setStats({
      totalUsers: usersResult.count || 0,
      totalChats: chatsResult.count || 0,
      totalCoffees: coffeesResult.count || 0,
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

    try {
      const updateData = {
        ...formData,
        ice_flavour_id: formData.ice_flavour_id || null,
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
      ice_flavour_id: coffee.ice_flavour_id || "",
      price: coffee.price || 0,
      inventory: coffee.inventory || 0,
      featured: coffee.featured || false,
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
      ice_flavour_id: "",
      price: 0,
      inventory: 0,
      featured: false,
    });
  };

  const handleIceFlavourSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!iceFlavourFormData.name) {
      toast({
        title: "Validation Error",
        description: "Please enter a name",
        variant: "destructive",
      });
      return;
    }

    try {
      if (editingIceFlavour) {
        const { error } = await supabase
          .from("ice_flavours")
          .update({
            name: iceFlavourFormData.name,
            description: iceFlavourFormData.description || null,
            color: iceFlavourFormData.color || null,
          })
          .eq("id", editingIceFlavour.id);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Ice flavour updated successfully",
        });
      } else {
        const { error } = await supabase.from("ice_flavours").insert({
          name: iceFlavourFormData.name,
          description: iceFlavourFormData.description || null,
          color: iceFlavourFormData.color || null,
        });

        if (error) throw error;

        toast({
          title: "Success",
          description: "Ice flavour added successfully",
        });
      }

      setIceFlavourDialogOpen(false);
      resetIceFlavourForm();
      loadIceFlavours();
    } catch (error) {
      console.error("Error saving ice flavour:", error);
      const errorMessage = error instanceof Error 
        ? error.message 
        : "Failed to save ice flavour";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleDeleteIceFlavour = async (id: string) => {
    if (!confirm("Are you sure you want to delete this ice flavour?")) return;

    try {
      const { error } = await supabase.from("ice_flavours").delete().eq("id", id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Ice flavour deleted successfully",
      });

      loadIceFlavours();
    } catch (error) {
      console.error("Error deleting ice flavour:", error);
      const errorMessage = error instanceof Error 
        ? error.message 
        : "Failed to delete ice flavour";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleEditIceFlavour = (iceFlavour: IceFlavour) => {
    setEditingIceFlavour(iceFlavour);
    setIceFlavourFormData({
      name: iceFlavour.name,
      description: iceFlavour.description || "",
      color: iceFlavour.color || "#CCCCCC",
    });
    setIceFlavourDialogOpen(true);
  };

  const resetIceFlavourForm = () => {
    setEditingIceFlavour(null);
    setIceFlavourFormData({
      name: "",
      description: "",
      color: "#CCCCCC",
    });
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
          <h1 className="text-xl font-bold text-foreground">Admin Dashboard</h1>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12 max-w-6xl space-y-8">
        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-6">
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
        </div>

        {/* Ice Flavour Management */}
        <Card className="border-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Ice Flavour Management</CardTitle>
                <CardDescription>Add, edit, or remove ice flavours</CardDescription>
              </div>
              <Dialog open={iceFlavourDialogOpen} onOpenChange={(open) => {
                setIceFlavourDialogOpen(open);
                if (!open) resetIceFlavourForm();
              }}>
                <DialogTrigger asChild>
                  <Button variant="hero">
                    <IceCream className="h-4 w-4 mr-2" />
                    Add Ice Flavour
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{editingIceFlavour ? "Edit Ice Flavour" : "Add New Ice Flavour"}</DialogTitle>
                    <DialogDescription>
                      Fill in the details for the ice flavour
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleIceFlavourSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="iceFlavourName">Name</Label>
                      <Input
                        id="iceFlavourName"
                        value={iceFlavourFormData.name}
                        onChange={(e) => setIceFlavourFormData({ ...iceFlavourFormData, name: e.target.value })}
                        placeholder="e.g., Vanilla"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="iceFlavourDescription">Description</Label>
                      <Textarea
                        id="iceFlavourDescription"
                        value={iceFlavourFormData.description}
                        onChange={(e) => setIceFlavourFormData({ ...iceFlavourFormData, description: e.target.value })}
                        placeholder="Describe the ice flavour..."
                        rows={3}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="iceFlavourColor">Color (Hex)</Label>
                      <div className="flex gap-2">
                        <Input
                          id="iceFlavourColor"
                          type="color"
                          value={iceFlavourFormData.color}
                          onChange={(e) => setIceFlavourFormData({ ...iceFlavourFormData, color: e.target.value })}
                          className="w-20 h-10"
                        />
                        <Input
                          type="text"
                          value={iceFlavourFormData.color}
                          onChange={(e) => setIceFlavourFormData({ ...iceFlavourFormData, color: e.target.value })}
                          placeholder="#CCCCCC"
                          className="flex-1"
                        />
                      </div>
                    </div>

                    <div className="flex gap-2 pt-4">
                      <Button type="submit" className="flex-1" variant="hero">
                        {editingIceFlavour ? "Update" : "Add"} Ice Flavour
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setIceFlavourDialogOpen(false);
                          resetIceFlavourForm();
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
              {iceFlavours.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No ice flavours yet. Add your first one!
                </p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {iceFlavours.map((iceFlavour) => (
                    <div
                      key={iceFlavour.id}
                      className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-secondary/30 transition-colors"
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <div
                          className="w-8 h-8 rounded-full border-2 border-border"
                          style={{ backgroundColor: iceFlavour.color || "#CCCCCC" }}
                        />
                        <div className="flex-1">
                          <h3 className="font-semibold">{iceFlavour.name}</h3>
                          {iceFlavour.description && (
                            <p className="text-sm text-muted-foreground line-clamp-1">
                              {iceFlavour.description}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditIceFlavour(iceFlavour)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteIceFlavour(iceFlavour.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Coffee Management */}
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
                        value={formData.category_id}
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

                    <div className="space-y-2">
                      <Label htmlFor="iceFlavour">Ice Flavour (Optional)</Label>
                      <Select
                        value={formData.ice_flavour_id}
                        onValueChange={(value) => setFormData({ ...formData, ice_flavour_id: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select ice flavour (optional)" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">None</SelectItem>
                          {iceFlavours.map((flavour) => (
                            <SelectItem key={flavour.id} value={flavour.id}>
                              <div className="flex items-center gap-2">
                                <div
                                  className="w-3 h-3 rounded-full border border-border"
                                  style={{ backgroundColor: flavour.color || "#CCCCCC" }}
                                />
                                {flavour.name}
                              </div>
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
                          min="0"
                          value={formData.price}
                          onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                          placeholder="0.00"
                        />
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
                    className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-secondary/30 transition-colors"
                  >
                    <div className="flex-1">
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
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(coffee.id)}
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
      </div>
    </div>
  );
}
