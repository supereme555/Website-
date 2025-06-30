import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Target, Calendar, TrendingUp } from "lucide-react";
import { GoalItem } from "@/components/goal-item";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function Goals() {
  const currentUserId = 1;
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<"weekly" | "monthly" | "yearly">("weekly");
  const [newGoal, setNewGoal] = useState({
    title: "",
    description: "",
    type: "weekly" as "weekly" | "monthly" | "yearly",
  });
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch goals for each type
  const { data: weeklyGoals } = useQuery({
    queryKey: ["/api/goals/" + currentUserId, { type: "weekly" }],
  });

  const { data: monthlyGoals } = useQuery({
    queryKey: ["/api/goals/" + currentUserId, { type: "monthly" }],
  });

  const { data: yearlyGoals } = useQuery({
    queryKey: ["/api/goals/" + currentUserId, { type: "yearly" }],
  });

  const createGoalMutation = useMutation({
    mutationFn: async (goalData: any) => {
      return apiRequest("POST", "/api/goals", {
        ...goalData,
        userId: currentUserId,
      });
    },
    onSuccess: () => {
      // Invalidate all goal queries
      queryClient.invalidateQueries({ queryKey: ["/api/goals/" + currentUserId] });
      setIsDialogOpen(false);
      setNewGoal({ title: "", description: "", type: "weekly" });
      toast({
        title: "Goal Created",
        description: "Your goal has been added successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create goal",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoal.title.trim()) {
      toast({
        title: "Error",
        description: "Please enter a goal title",
        variant: "destructive",
      });
      return;
    }
    createGoalMutation.mutate(newGoal);
  };

  const getGoalsForType = (type: string) => {
    switch (type) {
      case "weekly":
        return weeklyGoals || [];
      case "monthly":
        return monthlyGoals || [];
      case "yearly":
        return yearlyGoals || [];
      default:
        return [];
    }
  };

  const getStatsForType = (type: string) => {
    const goals = getGoalsForType(type);
    const completed = goals.filter(goal => goal.completed).length;
    return { total: goals.length, completed };
  };

  const weeklyStats = getStatsForType("weekly");
  const monthlyStats = getStatsForType("monthly");
  const yearlyStats = getStatsForType("yearly");

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <Calendar className="w-8 h-8 text-primary" />
              <div>
                <p className="text-2xl font-bold">{weeklyStats.completed}/{weeklyStats.total}</p>
                <p className="text-sm text-muted-foreground">Weekly Goals</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <Target className="w-8 h-8 text-secondary" />
              <div>
                <p className="text-2xl font-bold">{monthlyStats.completed}/{monthlyStats.total}</p>
                <p className="text-sm text-muted-foreground">Monthly Goals</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <TrendingUp className="w-8 h-8 text-accent" />
              <div>
                <p className="text-2xl font-bold">{yearlyStats.completed}/{yearlyStats.total}</p>
                <p className="text-sm text-muted-foreground">Yearly Goals</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add Goal Button */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Manage Your Goals</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Goal
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Create New Goal</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="type">Goal Type</Label>
                <Select 
                  value={newGoal.type} 
                  onValueChange={(value: "weekly" | "monthly" | "yearly") => 
                    setNewGoal({ ...newGoal, type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="weekly">Weekly Goal</SelectItem>
                    <SelectItem value="monthly">Monthly Goal</SelectItem>
                    <SelectItem value="yearly">Yearly Goal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="title">Goal Title</Label>
                <Input
                  id="title"
                  placeholder="e.g., Play 10 rated games"
                  value={newGoal.title}
                  onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description (optional)</Label>
                <Textarea
                  id="description"
                  placeholder="Additional details about your goal"
                  value={newGoal.description}
                  onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
                />
              </div>
              
              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={createGoalMutation.isPending}>
                  {createGoalMutation.isPending ? "Creating..." : "Create Goal"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Goals Categories */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Weekly Goals */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-primary" />
              <span>Weekly Goals</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {!weeklyGoals?.length ? (
              <div className="text-center py-6 text-muted-foreground">
                <Target className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No weekly goals yet</p>
              </div>
            ) : (
              weeklyGoals.map((goal) => (
                <div key={goal.id} className="p-3 bg-gray-50 rounded-lg">
                  <GoalItem goal={goal} type="goal" />
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Monthly Goals */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2">
              <Target className="w-5 h-5 text-secondary" />
              <span>Monthly Goals</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {!monthlyGoals?.length ? (
              <div className="text-center py-6 text-muted-foreground">
                <Target className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No monthly goals yet</p>
              </div>
            ) : (
              monthlyGoals.map((goal) => (
                <div key={goal.id} className="p-3 bg-gray-50 rounded-lg">
                  <GoalItem goal={goal} type="goal" />
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Yearly Goals */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-accent" />
              <span>Yearly Goals</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {!yearlyGoals?.length ? (
              <div className="text-center py-6 text-muted-foreground">
                <Target className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No yearly goals yet</p>
              </div>
            ) : (
              yearlyGoals.map((goal) => (
                <div key={goal.id} className="p-3 bg-gray-50 rounded-lg">
                  <GoalItem goal={goal} type="goal" />
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
