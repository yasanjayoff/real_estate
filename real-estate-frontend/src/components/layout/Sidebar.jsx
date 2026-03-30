import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  LayoutDashboard,
  Building2,
  Handshake,
  CalendarDays,
  FileText,
  TrendingUp,
  Users,
  LogOut,
  UserCircle2,
  Home,
  Newspaper,
} from "lucide-react";

const navItems = [
  {
    to: "/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    roles: ["ADMIN", "AGENT", "BUYER", "SELLER"],
  },
  {
    to: "/properties",
    label: "Properties",
    icon: Building2,
    roles: ["ADMIN", "AGENT", "BUYER", "SELLER"],
  },
  { to: "/deals", label: "Deals", icon: Handshake, roles: ["ADMIN", "AGENT"] },
  {
    to: "/visits",
    label: "Visits",
    icon: CalendarDays,
    roles: ["ADMIN", "AGENT", "BUYER"],
  },
  {
    to: "/documents",
    label: "Documents",
    icon: FileText,
    roles: ["ADMIN", "AGENT", "SELLER"],
  },
  {
    to: "/profits",
    label: "Profits",
    icon: TrendingUp,
    roles: ["ADMIN", "AGENT"],
  },
  { to: "/users", label: "Users", icon: Users, roles: ["ADMIN"] },
  {
    to: "/news",
    label: "News & Events",
    icon: Newspaper,
    roles: ["ADMIN", "AGENT", "BUYER", "SELLER"],
  },
  {
    to: "/news-admin",
    label: "Manage News",
    icon: Newspaper,
    roles: ["ADMIN"],
  },
  {
    to: "/profile",
    label: "My Profile",
    icon: UserCircle2,
    roles: ["ADMIN", "BUYER"],
  },
];

export default function Sidebar() {
  const { user, logout, hasRole } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const filtered = navItems.filter((item) => hasRole(...item.roles));

  return (
    <aside className="flex flex-col w-64 min-h-screen bg-slate-900 shrink-0">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary-600">
            <Home size={16} className="text-white" />
          </div>
          <div>
            <div className="text-sm font-bold leading-tight text-white font-display">
              RealEstate Pro
            </div>
            <div className="text-xs text-slate-500">Management System</div>
          </div>
        </div>
      </div>

      {/* User info */}
      <div className="px-4 py-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center rounded-full w-9 h-9 bg-primary-700 shrink-0">
            <span className="text-sm font-semibold text-white">
              {user?.firstName?.[0]}
              {user?.lastName?.[0]}
            </span>
          </div>
          <div className="min-w-0">
            <div className="text-sm font-medium text-white truncate">
              {user?.firstName} {user?.lastName}
            </div>
            <div className="text-xs truncate text-slate-400">{user?.role}</div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {filtered.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `sidebar-link ${isActive ? "sidebar-link-active" : "sidebar-link-inactive"}`
            }
          >
            <item.icon size={18} />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-slate-800">
        <button
          onClick={handleLogout}
          className="w-full text-left sidebar-link sidebar-link-inactive"
        >
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
