import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Trophy, 
  CheckCircle, 
  GraduationCap, 
  Dices,
  Plus,
  Target,
  Upload,
  TrendingUp
} from "lucide-react";
import { Progress } from "@/components/ui/progress";

export default function Dashboard() {
  const currentUserId = 1;

  const { data: user } = useQuery({
    queryKey: ["/api/user/" + currentUserId],
  });

  const { data: dailyGoals } = useQuery({
    queryKey: ["/api/daily-goals/" + currentUserId],
  });

  const { data: courses } = useQuery({
    queryKey: ["/api/courses/" + currentUserId],
  });

  const { data: eloStats } = useQuery({
    queryKey: ["/api/elo-stats/" + currentUserId + "/week"],
  });

  const { data: gameAnalyses } = useQuery({
    queryKey: ["/api/game-analyses/" + currentUserId],
  });

  const completedDailyGoals = dailyGoals?.filter(goal => goal.completed).length || 0;
  const totalDailyGoals = dailyGoals?.length || 0;
  const dailyGoalsProgress = totalDailyGoals > 0 ? (completedDailyGoals / totalDailyGoals) * 100 : 0;

  const completedCourses = courses?.filter(course => course.completed).length || 0;
  const totalCourses = courses?.length || 0;
  const coursesProgress = totalCourses > 0 ? (completedCourses / totalCourses) * 100 : 0;

  const totalGamesAnalyzed = gameAnalyses?.length || 0;
  const weeklyEloChange = eloStats?.change || 0;

  return (
    <div className="space-y-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Current ELO */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Current ELO</p>
                <p className="text-3xl font-bold text-primary">{user?.currentElo || 1200}</p>
              </div>
              <div className="bg-primary/10 p-3 rounded-lg">
                <Trophy className="w-6 h-6 text-primary" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className={`font-medium ${weeklyEloChange >= 0 ? 'text-secondary' : 'text-destructive'}`}>
                {weeklyEloChange >= 0 ? '+' : ''}{weeklyEloChange}
              </span>
              <span className="text-muted-foreground ml-1">this week</span>
            </div>
          </CardContent>
        </Card>

        {/* Daily Goals Progress */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Daily Goals</p>
                <p className="text-3xl font-bold text-gray-800">{completedDailyGoals}/{totalDailyGoals}</p>
              </div>
              <div className="bg-secondary/10 p-3 rounded-lg">
                <CheckCircle className="w-6 h-6 text-secondary" />
              </div>
            </div>
            <div className="mt-4">
              <Progress value={dailyGoalsProgress} className="h-2" />
            </div>
          </CardContent>
        </Card>

        {/* Courses Progress */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Courses</p>
                <p className="text-3xl font-bold text-gray-800">{completedCourses}/{totalCourses}</p>
              </div>
              <div className="bg-accent/10 p-3 rounded-lg">
                <GraduationCap className="w-6 h-6 text-accent" />
              </div>
            </div>
            <div className="mt-4">
              <Progress value={coursesProgress} className="h-2" />
            </div>
          </CardContent>
        </Card>

        {/* Games Analyzed */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Games Analyzed</p>
                <p className="text-3xl font-bold text-gray-800">{totalGamesAnalyzed}</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-lg">
                <Dices className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-secondary font-medium">+{gameAnalyses?.slice(0, 7).length || 0}</span>
              <span className="text-muted-foreground ml-1">this week</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button className="flex items-center justify-center p-4 h-auto">
              <TrendingUp className="w-5 h-5 mr-3" />
              Update ELO
            </Button>
            <Button className="flex items-center justify-center p-4 h-auto bg-secondary hover:bg-secondary/90">
              <Target className="w-5 h-5 mr-3" />
              Add Daily Goal
            </Button>
            <Button className="flex items-center justify-center p-4 h-auto bg-accent hover:bg-accent/90">
              <Upload className="w-5 h-5 mr-3" />
              Analyze Game
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {dailyGoals?.slice(0, 3).map((goal) => (
              <div key={goal.id} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                <div className="bg-primary text-white p-2 rounded-lg">
                  {goal.completed ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    <Target className="w-4 h-4" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-800">
                    {goal.completed ? 'Completed: ' : 'Goal: '}{goal.title}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(goal.createdAt!).toLocaleDateString()}
                  </p>
                </div>
                {goal.completed && (
                  <Badge className="bg-secondary text-white">Completed</Badge>
                )}
              </div>
            ))}
            
            {gameAnalyses?.slice(0, 2).map((analysis) => (
              <div key={analysis.id} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                <div className="bg-secondary text-white p-2 rounded-lg">
                  <Dices className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-800">
                    Analyzed game: {analysis.whitePlayer} vs {analysis.blackPlayer}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(analysis.createdAt!).toLocaleDateString()}
                  </p>
                </div>
                <Badge variant="outline">{analysis.result}</Badge>
              </div>
            ))}

            {(!dailyGoals?.length && !gameAnalyses?.length) && (
              <div className="text-center py-8 text-muted-foreground">
                <Dices className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No recent activity. Start by setting some goals or analyzing a game!</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
