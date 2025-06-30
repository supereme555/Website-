import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  TrendingUp, 
  TrendingDown, 
  Trophy, 
  Target,
  CalendarIcon,
  BarChart3,
  LineChart,
  Activity
} from "lucide-react";
import { EloChart } from "@/components/elo-chart";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

export default function EloStats() {
  const currentUserId = 1;
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [eloChange, setEloChange] = useState("");
  const [notes, setNotes] = useState("");
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ["/api/user/" + currentUserId],
  });

  const { data: eloEntries } = useQuery({
    queryKey: ["/api/elo/" + currentUserId],
  });

  const { data: weeklyStats } = useQuery({
    queryKey: ["/api/elo-stats/" + currentUserId + "/week"],
  });

  const { data: monthlyStats } = useQuery({
    queryKey: ["/api/elo-stats/" + currentUserId + "/month"],
  });

  const { data: yearlyStats } = useQuery({
    queryKey: ["/api/elo-stats/" + currentUserId + "/year"],
  });

  const addEloMutation = useMutation({
    mutationFn: async (entryData: any) => {
      return apiRequest("POST", "/api/elo", entryData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/elo/" + currentUserId] });
      queryClient.invalidateQueries({ queryKey: ["/api/elo-stats/" + currentUserId] });
      queryClient.invalidateQueries({ queryKey: ["/api/user/" + currentUserId] });
      setEloChange("");
      setNotes("");
      setSelectedDate(new Date());
      toast({
        title: "ELO Updated",
        description: "Your ELO change has been recorded successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update ELO",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const change = parseInt(eloChange);
    if (isNaN(change)) {
      toast({
        title: "Invalid Input",
        description: "Please enter a valid ELO change",
        variant: "destructive",
      });
      return;
    }

    if (Math.abs(change) > 500) {
      toast({
        title: "Invalid Change",
        description: "ELO change seems too large. Please verify.",
        variant: "destructive",
      });
      return;
    }

    const newElo = (user?.currentElo || 1200) + change;

    addEloMutation.mutate({
      userId: currentUserId,
      eloChange: change,
      newElo: newElo,
      date: selectedDate,
      notes: notes.trim() || null,
    });
  };

  // Calculate additional stats
  const recentEntries = eloEntries?.slice(-10) || [];
  const winRate = recentEntries.length > 0 
    ? (recentEntries.filter(entry => entry.eloChange > 0).length / recentEntries.length) * 100
    : 0;
  
  const averageChange = recentEntries.length > 0
    ? recentEntries.reduce((sum, entry) => sum + entry.eloChange, 0) / recentEntries.length
    : 0;

  const bestStreak = () => {
    let maxStreak = 0;
    let currentStreak = 0;
    
    for (const entry of recentEntries) {
      if (entry.eloChange > 0) {
        currentStreak++;
        maxStreak = Math.max(maxStreak, currentStreak);
      } else {
        currentStreak = 0;
      }
    }
    return maxStreak;
  };

  return (
    <div className="space-y-6">
      {/* ELO Update Form */}
      <Card>
        <CardHeader>
          <CardTitle>Update ELO Rating</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="eloChange">ELO Change</Label>
              <Input
                id="eloChange"
                type="number"
                placeholder="e.g., +15 or -8"
                value={eloChange}
                onChange={(e) => setEloChange(e.target.value)}
                className="text-center font-mono"
              />
            </div>
            
            <div className="space-y-2">
              <Label>Date</Label>
              <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !selectedDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => {
                      setSelectedDate(date || new Date());
                      setIsCalendarOpen(false);
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="notes">Notes (optional)</Label>
              <Input
                id="notes"
                placeholder="e.g., Tournament game"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
            
            <div className="flex items-end">
              <Button type="submit" className="w-full" disabled={addEloMutation.isPending}>
                {addEloMutation.isPending ? "Updating..." : "Update ELO"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <Trophy className="w-8 h-8 text-primary" />
              <div>
                <p className="text-2xl font-bold">{user?.currentElo || 1200}</p>
                <p className="text-sm text-muted-foreground">Current ELO</p>
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              {weeklyStats?.change !== undefined && (
                <>
                  {weeklyStats.change >= 0 ? (
                    <TrendingUp className="w-4 h-4 text-secondary mr-1" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-destructive mr-1" />
                  )}
                  <span className={weeklyStats.change >= 0 ? "text-secondary" : "text-destructive"}>
                    {weeklyStats.change >= 0 ? '+' : ''}{weeklyStats.change}
                  </span>
                  <span className="text-muted-foreground ml-1">this week</span>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <Target className="w-8 h-8 text-accent" />
              <div>
                <p className="text-2xl font-bold">{user?.peakElo || user?.currentElo || 1200}</p>
                <p className="text-sm text-muted-foreground">Peak ELO</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <Activity className="w-8 h-8 text-secondary" />
              <div>
                <p className="text-2xl font-bold">{Math.round(winRate)}%</p>
                <p className="text-sm text-muted-foreground">Win Rate</p>
              </div>
            </div>
            <div className="mt-4 text-sm text-muted-foreground">
              Last {recentEntries.length} games
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <BarChart3 className="w-8 h-8 text-purple-600" />
              <div>
                <p className="text-2xl font-bold">{bestStreak()}</p>
                <p className="text-sm text-muted-foreground">Best Streak</p>
              </div>
            </div>
            <div className="mt-4 text-sm text-muted-foreground">
              Consecutive wins
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Period Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">This Week</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Change:</span>
                <span className={cn(
                  "font-medium",
                  (weeklyStats?.change || 0) >= 0 ? "text-secondary" : "text-destructive"
                )}>
                  {(weeklyStats?.change || 0) >= 0 ? '+' : ''}{weeklyStats?.change || 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Games:</span>
                <span>{weeklyStats?.entries?.length || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Avg/Game:</span>
                <span>{weeklyStats?.entries?.length ? 
                  ((weeklyStats.change || 0) / weeklyStats.entries.length).toFixed(1) : '0.0'}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">This Month</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Change:</span>
                <span className={cn(
                  "font-medium",
                  (monthlyStats?.change || 0) >= 0 ? "text-secondary" : "text-destructive"
                )}>
                  {(monthlyStats?.change || 0) >= 0 ? '+' : ''}{monthlyStats?.change || 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Games:</span>
                <span>{monthlyStats?.entries?.length || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Avg/Game:</span>
                <span>{monthlyStats?.entries?.length ? 
                  ((monthlyStats.change || 0) / monthlyStats.entries.length).toFixed(1) : '0.0'}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">This Year</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Change:</span>
                <span className={cn(
                  "font-medium",
                  (yearlyStats?.change || 0) >= 0 ? "text-secondary" : "text-destructive"
                )}>
                  {(yearlyStats?.change || 0) >= 0 ? '+' : ''}{yearlyStats?.change || 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Games:</span>
                <span>{yearlyStats?.entries?.length || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Avg/Game:</span>
                <span>{yearlyStats?.entries?.length ? 
                  ((yearlyStats.change || 0) / yearlyStats.entries.length).toFixed(1) : '0.0'}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ELO Progress Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <LineChart className="w-5 h-5" />
            <span>ELO Progress</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="year" className="space-y-4">
            <TabsList>
              <TabsTrigger value="week">Week</TabsTrigger>
              <TabsTrigger value="month">Month</TabsTrigger>
              <TabsTrigger value="year">Year</TabsTrigger>
            </TabsList>
            
            <TabsContent value="week" className="space-y-4">
              <EloChart 
                data={weeklyStats?.entries || []} 
                period="week"
                currentElo={user?.currentElo || 1200}
              />
            </TabsContent>
            
            <TabsContent value="month" className="space-y-4">
              <EloChart 
                data={monthlyStats?.entries || []} 
                period="month"
                currentElo={user?.currentElo || 1200}
              />
            </TabsContent>
            
            <TabsContent value="year" className="space-y-4">
              <EloChart 
                data={yearlyStats?.entries || []} 
                period="year"
                currentElo={user?.currentElo || 1200}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Recent ELO Changes */}
      <Card>
        <CardHeader>
          <CardTitle>Recent ELO Changes</CardTitle>
        </CardHeader>
        <CardContent>
          {!eloEntries?.length ? (
            <div className="text-center py-8 text-muted-foreground">
              <TrendingUp className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No ELO entries yet. Add your first ELO change to get started!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {eloEntries.slice(-10).reverse().map((entry) => (
                <div key={entry.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={cn(
                      "w-3 h-3 rounded-full",
                      entry.eloChange > 0 ? "bg-secondary" : "bg-destructive"
                    )} />
                    <div>
                      <p className="font-medium">
                        {entry.eloChange > 0 ? '+' : ''}{entry.eloChange} points
                      </p>
                      {entry.notes && (
                        <p className="text-sm text-muted-foreground">{entry.notes}</p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{entry.newElo}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(entry.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
