import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { 
  Sword, 
  CalendarDays, 
  BookOpen, 
  Target, 
  Crown, 
  Dices, 
  TrendingUp,
  LayoutDashboard,
  Menu
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Daily Goals", href: "/daily-goals", icon: CalendarDays },
  { name: "Courses", href: "/courses", icon: BookOpen },
  { name: "Goals", href: "/goals", icon: Target },
  { name: "Masterlist", href: "/masterlist", icon: Crown },
  { name: "Analysis", href: "/analysis", icon: Dices },
  { name: "ELO Stats", href: "/elo-stats", icon: TrendingUp },
];

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const [location] = useLocation();

  return (
    <div className={cn(
      "bg-white shadow-lg transition-all duration-300 ease-in-out min-h-screen flex flex-col",
      collapsed ? "w-16" : "w-64"
    )}>
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Sword className="text-primary text-2xl flex-shrink-0" />
            {!collapsed && (
              <span className="font-bold text-xl text-gray-800">Sword Tracker</span>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggle}
            className="p-2 hover:bg-gray-100 flex-shrink-0"
          >
            <Menu className="w-4 h-4 text-gray-600" />
          </Button>
        </div>
      </div>
      
      <nav className="mt-6 flex-1">
        <div className="px-4">
          <ul className="space-y-2">
            {navigation.map((item) => {
              const isActive = location === item.href;
              return (
                <li key={item.name}>
                  <Link href={item.href}>
                    <a className={cn(
                      "flex items-center px-3 py-2 rounded-lg transition-colors",
                      isActive
                        ? "bg-primary text-white"
                        : "text-gray-700 hover:bg-gray-100",
                      collapsed ? "justify-center" : "space-x-3"
                    )}>
                      <item.icon className="w-5 h-5 flex-shrink-0" />
                      {!collapsed && <span>{item.name}</span>}
                    </a>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </nav>
    </div>
  );
}
