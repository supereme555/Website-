import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Edit2, Trash2, Check, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";

interface CourseItemProps {
  course: {
    id: number;
    title: string;
    description?: string;
    totalLessons: number;
    completedLessons: number;
    completed: boolean;
    userId: number;
  };
  onUpdate?: () => void;
}

export function CourseItem({ course, onUpdate }: CourseItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    title: course.title,
    description: course.description || "",
    totalLessons: course.totalLessons,
    completedLessons: course.completedLessons,
  });
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: async (updates: Partial<typeof course>) => {
      return apiRequest("PATCH", `/api/courses/${course.id}`, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/courses/" + course.userId] });
      onUpdate?.();
      setIsEditing(false);
      toast({
        title: "Updated",
        description: "Course updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update course",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("DELETE", `/api/courses/${course.id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/courses/" + course.userId] });
      onUpdate?.();
      toast({
        title: "Deleted",
        description: "Course deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete course",
        variant: "destructive",
      });
    },
  });

  const toggleComplete = () => {
    const newCompleted = !course.completed;
    const updates: any = { completed: newCompleted };
    
    if (newCompleted && course.completedLessons < course.totalLessons) {
      updates.completedLessons = course.totalLessons;
    }
    
    updateMutation.mutate(updates);
  };

  const saveEdit = () => {
    if (!editData.title.trim()) {
      toast({
        title: "Error",
        description: "Course title cannot be empty",
        variant: "destructive",
      });
      return;
    }
    
    if (editData.completedLessons > editData.totalLessons) {
      toast({
        title: "Error",
        description: "Completed lessons cannot exceed total lessons",
        variant: "destructive",
      });
      return;
    }

    const completed = editData.completedLessons >= editData.totalLessons;
    updateMutation.mutate({ ...editData, completed });
  };

  const cancelEdit = () => {
    setEditData({
      title: course.title,
      description: course.description || "",
      totalLessons: course.totalLessons,
      completedLessons: course.completedLessons,
    });
    setIsEditing(false);
  };

  const progressPercentage = course.totalLessons > 0 
    ? (course.completedLessons / course.totalLessons) * 100 
    : 0;

  if (isEditing) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 space-y-4">
        <Input
          value={editData.title}
          onChange={(e) => setEditData({ ...editData, title: e.target.value })}
          placeholder="Course title"
        />
        <Input
          value={editData.description}
          onChange={(e) => setEditData({ ...editData, description: e.target.value })}
          placeholder="Course description (optional)"
        />
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Total Lessons</label>
            <Input
              type="number"
              min="0"
              value={editData.totalLessons}
              onChange={(e) => setEditData({ ...editData, totalLessons: parseInt(e.target.value) || 0 })}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Completed Lessons</label>
            <Input
              type="number"
              min="0"
              max={editData.totalLessons}
              value={editData.completedLessons}
              onChange={(e) => setEditData({ ...editData, completedLessons: parseInt(e.target.value) || 0 })}
            />
          </div>
        </div>
        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={cancelEdit}>
            Cancel
          </Button>
          <Button onClick={saveEdit} disabled={updateMutation.isPending}>
            Save
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start space-x-3 flex-1">
          <BookOpen className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
          <div className="flex-1">
            <h4 className="font-semibold text-gray-800">{course.title}</h4>
            {course.description && (
              <p className="text-sm text-muted-foreground mt-1">{course.description}</p>
            )}
          </div>
        </div>
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
      </div>
      
      <div className="space-y-3">
        <div>
          <Progress value={progressPercentage} className="h-2" />
          <p className="text-sm text-muted-foreground mt-2">
            {Math.round(progressPercentage)}% complete
          </p>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            {course.completedLessons}/{course.totalLessons} lessons
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleComplete}
            className={cn(
              "w-8 h-8 p-0 border-2 rounded-md transition-colors",
              course.completed
                ? "bg-secondary border-secondary text-white hover:bg-secondary/80"
                : "border-gray-300 hover:border-secondary"
            )}
            disabled={updateMutation.isPending}
          >
            {course.completed && <Check className="w-4 h-4" />}
          </Button>
        </div>
      </div>
    </div>
  );
}
