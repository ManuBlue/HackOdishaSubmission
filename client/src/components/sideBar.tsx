import { User, Upload, FileImage, LogOut, Home, Video, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate, useLocation } from "react-router-dom";

interface SidebarProps {
  userEmail?: string;
  onLogout: () => void;
}

const navItems = [
  { label: "Dashboard", icon: Home, path: "/dashboard" },
  { label: "Upload", icon: Upload, path: "/add-media" },
  { label: "Process Video", icon: Video, path: "/process-video" },
  { label: "My Files", icon: FileImage, path: "/current-media" },
  { label: "Create Model", icon: Settings, path: "/create-model" }, // Added create-model
];

const Sidebar: React.FC<SidebarProps> = ({ userEmail, onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <aside className="h-screen w-64 bg-white border-r border-gray-200 flex flex-col justify-between fixed left-0 top-0 z-30">
      <div>
        <div className="px-6 py-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 tracking-tight">Monitr</h2>
          {userEmail && (
            <div className="flex items-center gap-2 mt-4 text-sm text-gray-600">
              <User className="h-4 w-4" />
              <span className="truncate">{userEmail}</span>
            </div>
          )}
        </div>
        <nav className="mt-6 flex flex-col gap-1 px-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Button
                key={item.label}
                variant={isActive ? "default" : "ghost"}
                className={`w-full justify-start gap-3 px-4 py-2 rounded-lg text-base ${
                  isActive
                    ? "bg-black text-white"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
                onClick={() => navigate(item.path)}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </Button>
            );
          })}
        </nav>
      </div>
      <div className="px-6 py-4 border-t border-gray-100">
        <Button
          onClick={onLogout}
          variant="outline"
          className="w-full flex items-center gap-2 bg-black text-white"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>
    </aside>
  );
};

export default Sidebar;