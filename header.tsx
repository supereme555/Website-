import { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User, Settings, LogOut, ChevronDown } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { User as UserType } from "@shared/schema";

interface HeaderProps {
  user: UserType;
}

const pageTitles: Record<string, { title: string; description: string }> = {
  "/": { title: "Dashboard", description: "Track your chess improvement journey" },
  "/daily-goals": { title: "Daily Goals", description: "Manage your daily chess learning objectives" },
  "/courses": { title: "Courses", description: "Track your chess course progress" },
  "/goals": { title: "Goals", description: "Manage your weekly, monthly, and yearly goals" },
  "/masterlist": { title: "Masterlist", description: "Your ultimate chess improvement objectives" },
  "/analysis": { title: "Game Analysis", description: "Analyze your games with chess engines" },
  "/elo-stats": { title: "ELO Statistics", description: "Monitor your rating progress" },
};

export function Header({ user }: HeaderProps) {
  const [location] = useState(window.location.pathname);
  const currentPage = pageTitles[location] || pageTitles["/"];

  const handleLogout = () => {
    // In a real app, you'd handle logout here
    window.location.reload();
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">{currentPage.title}</h1>
          <p className="text-gray-600 text-sm">{currentPage.description}</p>
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center space-x-2 p-2 hover:bg-gray-100">
              <Avatar className="w-8 h-8">
                <AvatarImage src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=100&h=100" />
                <AvatarFallback>{user.username.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
              <span className="font-medium text-gray-700">{user.username}</span>
              <ChevronDown className="w-4 h-4 text-gray-500" />
            </Button>
          </DropdownMenuTrigger>
          
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem className="flex items-center cursor-pointer">
              <User className="w-4 h-4 mr-3" />
              View Profile
            </DropdownMenuItem>
            <DropdownMenuItem className="flex items-center cursor-pointer">
              <Settings className="w-4 h-4 mr-3" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              className="flex items-center cursor-pointer text-red-600 focus:text-red-600"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4 mr-3" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
