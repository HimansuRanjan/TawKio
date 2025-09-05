import {
  Home,
  MessageCircle,
  Bell,
  LogOut,
  User,
  Settings,
  Key,
} from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import { logout } from "../../store/slices/userSlice"; // ✅ make sure you have this

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function Navbar({ activeTab, setActiveTab }: NavbarProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const dispatch = useDispatch<AppDispatch>();
  const {user} = useSelector((state: RootState) => state.user );

  const handleNavClick = (tab: string, path: string) => {
    setActiveTab(tab);
    navigate(path);
  };

  const handleLogout = async () => {
    try {
      // 1. Clear Redux + localStorage via slice action
      dispatch(logout());

      // 2. Navigate to login
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <nav className="w-full bg-white shadow-sm sticky top-0 z-50 px-6 py-3 flex items-center justify-between">
      {/* Brand */}
      <h1 className="text-xl font-bold text-violet-900">TawKio</h1>

      {/* Navigation Buttons */}
      <div className="flex gap-6 text-gray-600">
        <button
          onClick={() => handleNavClick("home", "/feed")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
            location.pathname === "/feed"
              ? "bg-gray-200 text-violet-800 font-semibold"
              : "hover:bg-gray-100"
          }`}
        >
          <Home className="w-5 h-5" /> Home
        </button>

        <button
          onClick={() => handleNavClick("messages", "/messages")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
            location.pathname === "/messages"
              ? "bg-gray-200 text-violet-800 font-semibold"
              : "hover:bg-gray-100"
          }`}
        >
          <MessageCircle className="w-5 h-5" /> Messages
        </button>

        <button
          onClick={() => handleNavClick("notifications", "/notifications")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
            location.pathname === "/notifications"
              ? "bg-gray-200 text-violet-800 font-semibold"
              : "hover:bg-gray-100"
          }`}
        >
          <Bell className="w-5 h-5" /> Notifications
        </button>
      </div>

      {/* Profile Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            aria-label="Profile menu"
            className="rounded-full overflow-hidden w-10 h-10"
          >
            <Avatar>
              <AvatarImage src={user.avatarUrl} alt="Profile" />
              <AvatarFallback>{user.username ? user.username[0] : ""}</AvatarFallback>
            </Avatar>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuItem
            onClick={() => navigate("/profile")}
            className="hover:cursor-pointer"
          >
            <User className="w-4 h-4 mr-2" />
            <span>My Profile</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => navigate("/update/profile")}
            className="hover:cursor-pointer"
          >
            <Settings className="w-4 h-4 mr-2" />
            <span>Update Profile</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => navigate("/update/password")}
            className="hover:cursor-pointer"
          >
            <Key className="w-4 h-4 mr-2" />
            <span>Update Password</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={handleLogout}
            className="text-red-600 focus:text-red-600 hover:cursor-pointer"
          >
            <LogOut className="w-4 h-4 mr-2" />
            <span>Logout</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </nav>
  );
}
