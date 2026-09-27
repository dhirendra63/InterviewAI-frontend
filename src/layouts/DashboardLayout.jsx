import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  BarChart3,
  ChevronRight,
  Coins,
  FileText,
  History,
  LayoutDashboard,
  LogOut,
  Menu,
  Mic2,
  Moon,
  Settings,
  Sparkles,
  Sun,
  User,
  X,
  Crown,
} from "lucide-react";
import { useState } from "react";

import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

const navigation = [
  {
    name: "Dashboard",
    path: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Start Interview",
    path: "/interview/setup",
    icon: Mic2,
  },
  {
    name: "Interview History",
    path: "/history",
    icon: History,
  },
  {
    name: "Analytics",
    path: "/analytics",
    icon: BarChart3,
  },
  {
    name: "Resume",
    path: "/resume",
    icon: FileText,
  },
  {
    name: "Credits",
    path: "/credits",
    icon: Coins,
  },
];

const bottomNavigation = [
  {
    name: "Profile",
    path: "/profile",
    icon: User,
  },
  {
    name: "Settings",
    path: "/settings",
    icon: Settings,
  },
];

const DashboardLayout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const accountLabel = user?.isPremium
    ? "Premium Account"
    : "Free Account";

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950 transition-colors duration-300 dark:bg-[#08090d] dark:text-white">
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-slate-200 bg-white transition-transform duration-300 dark:border-white/[0.08] dark:bg-[#0b0d12] lg:translate-x-0 ${mobileOpen ? "translate-x-0" : "-translate-x-full"
          }`}
      >
        <div className="flex h-20 items-center justify-between border-b border-slate-200 px-6 dark:border-white/[0.08]">
          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-3"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-950 font-bold text-white dark:bg-white dark:text-black">
              IA
            </div>

            <div className="text-left">
              <p className="font-semibold tracking-tight">
                InterviewAI
              </p>

              <p className="text-[11px] text-slate-500">
                AI Interview Platform
              </p>
            </div>
          </button>

          <button
            onClick={() => setMobileOpen(false)}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 lg:hidden"
          >
            <X size={20} />
          </button>
        </div>

        <div className="px-4 pt-6">
          <p className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Workspace
          </p>

          <nav className="space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `group flex items-center gap-3 rounded-xl px-3 py-3 text-sm transition ${isActive
                      ? "bg-slate-950 text-white dark:bg-white dark:text-black"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-400 dark:hover:bg-white/[0.05] dark:hover:text-white"
                    }`
                  }
                >
                  <Icon size={18} />
                  <span>{item.name}</span>

                  <ChevronRight
                    size={15}
                    className="ml-auto opacity-0 transition group-hover:opacity-100"
                  />
                </NavLink>
              );
            })}
          </nav>
        </div>

        <div className="mt-auto px-4 pb-5">
          <div className="mb-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-white/[0.08] dark:bg-white/[0.03]">
            <div className="mb-3 flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-slate-700 shadow-sm dark:bg-white/10 dark:text-white dark:shadow-none">
                <Sparkles size={17} />
              </div>

              <div>
                <p className="text-sm font-medium">
                  AI Practice
                </p>

                <p className="text-xs text-slate-500">
                  Improve every session
                </p>
              </div>
            </div>

            <button
              onClick={() => navigate("/interview/setup")}
              className="w-full rounded-lg bg-slate-950 px-3 py-2 text-xs font-semibold text-white transition hover:bg-slate-800 dark:bg-white dark:text-black dark:hover:bg-slate-200"
            >
              Start Practice
            </button>
          </div>

          <nav className="space-y-1">
            {bottomNavigation.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-xl px-3 py-3 text-sm transition ${isActive
                      ? "bg-slate-100 text-slate-950 dark:bg-white/10 dark:text-white"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-500 dark:hover:bg-white/[0.05] dark:hover:text-white"
                    }`
                  }
                >
                  <Icon size={18} />
                  {item.name}
                </NavLink>
              );
            })}

            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm text-slate-500 transition hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-500/10 dark:hover:text-red-400"
            >
              <LogOut size={18} />
              Logout
            </button>
          </nav>
        </div>
      </aside>

      <div className="lg:pl-72">
        <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-slate-200 bg-white/80 px-5 backdrop-blur-xl dark:border-white/[0.08] dark:bg-[#08090d]/80 sm:px-8">
          <button
            onClick={() => setMobileOpen(true)}
            className="rounded-xl border border-slate-200 p-2.5 text-slate-600 hover:bg-slate-100 dark:border-white/[0.08] dark:text-slate-400 dark:hover:bg-white/5 lg:hidden"
          >
            <Menu size={20} />
          </button>

          <div className="hidden lg:block">
            <p className="text-sm text-slate-500">
              AI Interview Workspace
            </p>
          </div>

          <div className="ml-auto flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-100 dark:border-white/[0.08] dark:bg-white/[0.03] dark:text-slate-300 dark:hover:bg-white/[0.08]"
            >
              {theme === "dark" ? (
                <Sun size={18} />
              ) : (
                <Moon size={18} />
              )}
            </button>

            <button
              onClick={() => navigate("/credits")}
              className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm transition hover:bg-slate-100 dark:border-white/[0.08] dark:bg-white/[0.03] dark:hover:bg-white/[0.06]"
            >
              <Coins size={16} />

              <span className="hidden text-slate-600 dark:text-slate-300 sm:block">
                Credits
              </span>

              <span className="font-semibold">
                {user?.credits ?? 0}
              </span>
            </button>

            <button
              onClick={() => navigate("/profile")}
              className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-1.5 pr-3 transition hover:bg-slate-100 dark:border-white/[0.08] dark:bg-white/[0.03] dark:hover:bg-white/[0.06]"
            >
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="h-9 w-9 rounded-lg object-cover"
                />
              ) : (
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-950 text-sm font-bold text-white dark:bg-white dark:text-black">
                  {user?.name?.charAt(0)?.toUpperCase() || "U"}
                </div>
              )}

              <div className="hidden text-left sm:block">
                <p className="max-w-32 truncate text-sm font-medium">
                  {user?.name || "User"}
                </p>

                <div className="flex items-center gap-1.5">
                  {user?.isPremium && (
                    <Crown
                      size={11}
                      className="text-slate-900 dark:text-white"
                    />
                  )}

                  <p
                    className={`text-[11px] ${user?.isPremium
                      ? "font-semibold text-slate-900 dark:text-white"
                      : "text-slate-500"
                      }`}
                  >
                    {accountLabel}
                  </p>
                </div>
              </div>
            </button>
          </div>
        </header>

        <main className="min-h-[calc(100vh-5rem)] p-5 sm:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;