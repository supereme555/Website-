import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Calendar } from "lucide-react";
import { GoalItem } from "@/components/goal-item";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const weekDays = [
  { id: "monday", label: "Monday" },
  { id: "tuesday", label: "Tuesday" },
  { id: "wednesday", label: "Wednesday" },
  { id: "thursday", label: "Thursday" },
  { id: "friday", label: "Friday" },
  { id: "saturday", label: "Saturday" },
  { id: "sunday", label: "Sunday" },
];

export default function DailyGoals() {
  const currentUserId = 1;
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newGoal, setNewGoal] = useState({
    title: "",
    repeatDays: [] as string[],
  });
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: dailyGoals, isLoading } = useQuery({
    queryKey: ["/api/daily-goals/" + currentUserId],
  });

  const createGoalMutation = useMutation({
    mutationFn: async (goalData: any) => {
      return apiRequest("POST", "/api/daily-goals", {
        ...goalData,
        userId: currentUserId,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/daily-goals/" + currentUserId] });
      setIsDialogOpen(false);
      setNewGoal({ title: "", repeatDays: [] });
      toast({
        title: "Goal Created",
        description: "Your daily goal has been added successfully",
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

  const toggleRepeatDay = (dayId: string) => {
    setNewGoal(prev => ({
      ...prev,
      repeatDays: prev.repeatDays.includes(dayId)
        ? prev.repeatDays.filter(d => d !== dayId)
        : [...prev.repeatDays, dayId]
    }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const completedGoals = dailyGoals?.filter(goal => goal.completed).length || 0;
  const totalGoals = dailyGoals?.length || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Calendar className="w-8 h-8 text-primary" />
          <div>
            <h2 className="text-xl font-semibold">Today's Progress</h2>
            <p className="text-muted-foreground">
              {completedGoals} of {totalGoals} goals completed
            </p>
          </div>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Daily Goal
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Create Daily Goal</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Goal Title</Label>
                <Input
                  id="title"
                  placeholder="e.g., Study 30 minutes of tactics"
                  value={newGoal.title}
                  onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                />
              </div>
              
              <div className="space-y-3">
                <Label>Repeat on days (optional)</Label>
                <div className="grid grid-cols-2 gap-2">
                  {weekDays.map((day) => (
                    <div key={day.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={day.id}
                        checked={newGoal.repeatDays.includes(day.id)}
                        onCheckedChange={() => toggleRepeatDay(day.id)}
                      />
                      <Label htmlFor={day.id} className="text-sm">
                        {day.label}
                      </Label>
                    </div>
                  ))}
                </div>
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

      {/* Goals List */}
      <Card>
        <CardHeader>
          <CardTitle>Today's Goals</CardTitle>
        </CardHeader>
        <CardContent>
          {!dailyGoals?.length ? (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No daily goals yet. Create your first goal to get started!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {dailyGoals.map((goal) => (
                <GoalItem
                  key={goal.id}
                  goal={goal}
                  type="daily"
                  onUpdate={() => queryClient.invalidateQueries({ queryKey: ["/api/daily-goals/" + currentUserId] })}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
