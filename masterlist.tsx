import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Crown, Trophy, Target, Star } from "lucide-react";
import { GoalItem } from "@/components/goal-item";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

export default function Masterlist() {
  const currentUserId = 1;
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newGoal, setNewGoal] = useState({
    title: "",
    description: "",
  });
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: yearlyGoals, isLoading } = useQuery({
    queryKey: ["/api/goals/" + currentUserId, { type: "yearly" }],
  });

  const createGoalMutation = useMutation({
    mutationFn: async (goalData: any) => {
      return apiRequest("POST", "/api/goals", {
        ...goalData,
        userId: currentUserId,
        type: "yearly",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/goals/" + currentUserId] });
      setIsDialogOpen(false);
      setNewGoal({ title: "", description: "" });
      toast({
        title: "Masterlist Goal Created",
        description: "Your ultimate chess goal has been added to your masterlist",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create masterlist goal",
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const completedGoals = yearlyGoals?.filter(goal => goal.completed).length || 0;
  const totalGoals = yearlyGoals?.length || 0;

  const gradientStyles = [
    "bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200",
    "bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200",
    "bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200",
    "bg-gradient-to-r from-green-50 to-green-100 border-green-200",
    "bg-gradient-to-r from-red-50 to-red-100 border-red-200",
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-3">
          <Crown className="w-12 h-12 text-accent" />
          <h1 className="text-3xl font-bold text-gray-800">Chess Mastery Masterlist</h1>
        </div>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Your ultimate chess improvement objectives. These are the big goals that will define your chess journey.
        </p>
        
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
          <Card>
            <CardContent className="p-4 text-center">
              <Trophy className="w-8 h-8 text-accent mx-auto mb-2" />
              <p className="text-2xl font-bold">{totalGoals}</p>
              <p className="text-sm text-muted-foreground">Total Goals</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Star className="w-8 h-8 text-secondary mx-auto mb-2" />
              <p className="text-2xl font-bold">{completedGoals}</p>
              <p className="text-sm text-muted-foreground">Completed</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Target className="w-8 h-8 text-primary mx-auto mb-2" />
              <p className="text-2xl font-bold">{totalGoals - completedGoals}</p>
              <p className="text-sm text-muted-foreground">Remaining</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Add Goal Button */}
      <div className="flex justify-center">
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button size="lg" className="bg-accent hover:bg-accent/90">
              <Plus className="w-5 h-5 mr-2" />
              Add to Masterlist
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <Crown className="w-5 h-5 text-accent" />
                <span>Add to Masterlist</span>
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Masterlist Goal</Label>
                <Input
                  id="title"
                  placeholder="e.g., Achieve 2000 ELO Rating"
                  value={newGoal.title}
                  onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description & Strategy</Label>
                <Textarea
                  id="description"
                  placeholder="Describe your goal and how you plan to achieve it..."
                  value={newGoal.description}
                  onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
                  rows={3}
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
                  {createGoalMutation.isPending ? "Adding..." : "Add to Masterlist"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Masterlist Goals */}
      <div className="max-w-4xl mx-auto">
        {!yearlyGoals?.length ? (
          <Card>
            <CardContent className="text-center py-12">
              <Crown className="w-20 h-20 mx-auto mb-4 text-accent opacity-50" />
              <h3 className="text-xl font-semibold mb-2">Your Masterlist is Empty</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Start building your chess legacy by adding your most ambitious goals to the masterlist.
              </p>
              <Button 
                onClick={() => setIsDialogOpen(true)}
                className="bg-accent hover:bg-accent/90"
              >
                <Crown className="w-4 h-4 mr-2" />
                Create Your First Masterlist Goal
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {yearlyGoals.map((goal, index) => (
              <Card key={goal.id} className={cn(
                "border-2 transition-all duration-200 hover:shadow-lg",
                gradientStyles[index % gradientStyles.length]
              )}>
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <div className={cn(
                        "w-12 h-12 rounded-full flex items-center justify-center",
                        goal.completed 
                          ? "bg-secondary text-white" 
                          : "bg-white border-2 border-accent"
                      )}>
                        {goal.completed ? (
                          <Trophy className="w-6 h-6" />
                        ) : (
                          <Crown className="w-6 h-6 text-accent" />
                        )}
                      </div>
                    </div>
                    
                    <div className="flex-1">
                      <div className="mb-4">
                        <h3 className={cn(
                          "text-lg font-semibold",
                          goal.completed && "line-through text-gray-600"
                        )}>
                          {goal.title}
                        </h3>
                        {goal.description && (
                          <p className="text-muted-foreground mt-1">
                            {goal.description}
                          </p>
                        )}
                      </div>
                      
                      <GoalItem goal={goal} type="goal" />
                    </div>
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
