import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Edit2, Trash2, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface GoalItemProps {
  goal: {
    id: number;
    title: string;
    completed: boolean;
    userId: number;
  };
  onUpdate?: () => void;
  type: "daily" | "goal";
}

export function GoalItem({ goal, onUpdate, type }: GoalItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(goal.title);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: async (updates: Partial<typeof goal>) => {
      const endpoint = type === "daily" ? "daily-goals" : "goals";
      return apiRequest("PATCH", `/api/${endpoint}/${goal.id}`, updates);
    },
    onSuccess: () => {
      const queryKey = type === "daily" 
        ? ["/api/daily-goals/" + goal.userId]
        : ["/api/goals/" + goal.userId];
      queryClient.invalidateQueries({ queryKey });
      onUpdate?.();
      setIsEditing(false);
      toast({
        title: "Updated",
        description: "Goal updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update goal",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      const endpoint = type === "daily" ? "daily-goals" : "goals";
      return apiRequest("DELETE", `/api/${endpoint}/${goal.id}`);
    },
    onSuccess: () => {
      const queryKey = type === "daily" 
        ? ["/api/daily-goals/" + goal.userId]
        : ["/api/goals/" + goal.userId];
      queryClient.invalidateQueries({ queryKey });
      onUpdate?.();
      toast({
        title: "Deleted",
        description: "Goal deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete goal",
        variant: "destructive",
      });
    },
  });

  const toggleComplete = () => {
    updateMutation.mutate({ completed: !goal.completed });
  };

  const saveEdit = () => {
    if (editTitle.trim() === "") {
      toast({
        title: "Error",
        description: "Goal title cannot be empty",
        variant: "destructive",
      });
      return;
    }
    updateMutation.mutate({ title: editTitle.trim() });
  };

  const cancelEdit = () => {
    setEditTitle(goal.title);
    setIsEditing(false);
  };

  return (
    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
      <div className="flex items-center space-x-3 flex-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleComplete}
          className={cn(
            "w-6 h-6 p-0 border-2 rounded-md transition-colors",
            goal.completed
              ? "bg-secondary border-secondary text-white hover:bg-secondary/80"
              : "border-gray-300 hover:border-secondary"
          )}
          disabled={updateMutation.isPending}
        >
          {goal.completed && <Check className="w-3 h-3" />}
        </Button>
        
        {isEditing ? (
          <div className="flex items-center space-x-2 flex-1">
            <Input
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="flex-1"
              onKeyDown={(e) => {
                if (e.key === "Enter") saveEdit();
                if (e.key === "Escape") cancelEdit();
              }}
              autoFocus
            />
            <Button
              size="sm"
              onClick={saveEdit}
              disabled={updateMutation.isPending}
            >
              Save
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={cancelEdit}
            >
              Cancel
            </Button>
          </div>
        ) : (
          <span
            className={cn(
              "font-medium text-gray-800 flex-1",
              goal.completed && "line-through text-gray-500"
            )}
          >
            {goal.title}
          </span>
        )}
      </div>
      
      {!isEditing && (
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsEditing(true)}
            className="text-gray-500 hover:text-primary"
          >
            <Edit2 className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => deleteMutation.mutate()}
            className="text-gray-500 hover:text-destructive"
            disabled={deleteMutation.isPending}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
