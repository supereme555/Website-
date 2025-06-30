import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Sword, Crown, Target } from "lucide-react";

interface ProfileSetupProps {
  userId: number;
}

export default function ProfileSetup({ userId }: ProfileSetupProps) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    username: "",
    currentElo: "",
  });
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: existingUser } = useQuery({
    queryKey: ["/api/user/" + userId],
  });

  const createUserMutation = useMutation({
    mutationFn: async (userData: any) => {
      if (existingUser) {
        // Update existing user
        return apiRequest("PATCH", `/api/user/${userId}`, userData);
      } else {
        // Create new user
        return apiRequest("POST", "/api/user", { ...userData, id: userId });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user/" + userId] });
      toast({
        title: "Profile Setup Complete!",
        description: "Welcome to Sword Tracker. Let's improve your game!",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to setup profile. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = () => {
    if (!formData.username || !formData.currentElo) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    const eloValue = parseInt(formData.currentElo);
    if (isNaN(eloValue) || eloValue < 600 || eloValue > 3000) {
      toast({
        title: "Invalid ELO",
        description: "Please enter a valid ELO rating between 600 and 3000.",
        variant: "destructive",
      });
      return;
    }

    createUserMutation.mutate({
      username: formData.username,
      currentElo: eloValue,
      peakElo: eloValue,
      profileComplete: true,
    });
  };

  if (step === 1) {
    return (
      <div className="min-h-screen bg-neutral flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 bg-primary rounded-full flex items-center justify-center">
              <Sword className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl">Welcome to Sword Tracker</CardTitle>
            <p className="text-muted-foreground">
              Your personal chess improvement companion
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="space-y-2">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                  <Target className="w-6 h-6 text-primary" />
                </div>
                <p className="text-sm font-medium">Track Goals</p>
              </div>
              <div className="space-y-2">
                <div className="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center mx-auto">
                  <Sword className="w-6 h-6 text-secondary" />
                </div>
                <p className="text-sm font-medium">Analyze Games</p>
              </div>
              <div className="space-y-2">
                <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center mx-auto">
                  <Crown className="w-6 h-6 text-accent" />
                </div>
                <p className="text-sm font-medium">Monitor ELO</p>
              </div>
            </div>
            <Button 
              onClick={() => setStep(2)}
              className="w-full"
              size="lg"
            >
              Get Started
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Setup Your Profile</CardTitle>
          <p className="text-muted-foreground">
            Let's get to know you better
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              placeholder="Enter your chess username"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="elo">Current ELO Rating</Label>
            <Input
              id="elo"
              type="number"
              placeholder="e.g. 1500"
              value={formData.currentElo}
              onChange={(e) => setFormData({ ...formData, currentElo: e.target.value })}
            />
            <p className="text-sm text-muted-foreground">
              Don't worry, you can update this anytime
            </p>
          </div>

          <div className="pt-4 space-y-3">
            <Button 
              onClick={handleSubmit}
              className="w-full"
              disabled={createUserMutation.isPending}
            >
              {createUserMutation.isPending ? "Setting up..." : "Complete Setup"}
            </Button>
            <Button 
              variant="outline"
              onClick={() => setStep(1)}
              className="w-full"
            >
              Back
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
