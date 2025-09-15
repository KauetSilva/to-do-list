import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTheme } from "../hooks/useTheme";
import { useLanguage } from "../hooks/useLanguage";
import {
  Moon,
  Sun,
  ChartPie,
  Translate,
  Calendar,
  Target,
  SignOut,
  ArrowLeft,
  ListChecks,
  Sparkle,
} from "phosphor-react";

interface HeaderProps {
  title: string;
  showBackButton?: boolean;
  onBackClick?: () => void;
  showNavigationButtons?: boolean;
}

export function Header({
  title,
  showBackButton = false,
  onBackClick,
  showNavigationButtons = true,
}: HeaderProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const { t, toggleLanguage, language } = useLanguage();

  // Check if user is authenticated
  React.useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
    }
  }, [navigate]);

  // Logout function
  function handleLogout() {
    localStorage.removeItem("token");
    navigate("/login");
  }

  // Navigation items configuration
  const navigationItems = [
    {
      path: "/tasks",
      icon: ListChecks,
      label: t("tasks"),
      color: "from-indigo-500 to-purple-600",
      bgColor: "bg-gradient-to-r from-indigo-500 to-purple-600",
      hoverColor: "hover:from-indigo-600 hover:to-purple-700",
    },
    {
      path: "/daily-report",
      icon: Calendar,
      label: t("dailyReport"),
      color: "from-blue-500 to-cyan-600",
      bgColor: "bg-gradient-to-r from-blue-500 to-cyan-600",
      hoverColor: "hover:from-blue-600 hover:to-cyan-700",
    },
    {
      path: "/sprints",
      icon: Target,
      label: t("sprints"),
      color: "from-green-500 to-emerald-600",
      bgColor: "bg-gradient-to-r from-green-500 to-emerald-600",
      hoverColor: "hover:from-green-600 hover:to-emerald-700",
    },
    {
      path: "/performance",
      icon: ChartPie,
      label: t("viewPerformance"),
      color: "from-purple-500 to-pink-600",
      bgColor: "bg-gradient-to-r from-purple-500 to-pink-600",
      hoverColor: "hover:from-purple-600 hover:to-pink-700",
    },
  ];

  // Check if current path is active
  const isActivePath = (path: string) => location.pathname === path;

  // Função para voltar
  function handleBackClick() {
    if (onBackClick) {
      onBackClick();
    } else if (window.history.length > 1) {
      window.history.back();
    } else {
      navigate("/tasks");
    }
  }

  return (
    <header className="relative bg-white dark:bg-gray-900 shadow-lg border-b border-gray-200 dark:border-gray-700">
      {/* Gradient background overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 opacity-50"></div>

      <div className="relative w-full px-4 sm:px-6 lg:px-8">
        {/* Top section with title and controls */}
        <div className="flex items-center justify-between py-4">
          {/* Left side - Title and back button */}
          <div className="flex items-center space-x-4">
            {showBackButton && (
              <button
                onClick={handleBackClick}
                className="group p-2 rounded-xl bg-white dark:bg-gray-800 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105"
                title={t("back")}
              >
                <ArrowLeft
                  size={20}
                  className="text-gray-600 dark:text-gray-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors"
                />
              </button>
            )}
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 shadow-lg float-animation">
                <Sparkle size={24} className="text-white" />
              </div>
              <div>
                <h1 className="text-xl lg:text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                  {title}
                </h1>
                <div className="h-1 w-12 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full mt-1"></div>
              </div>
            </div>
          </div>

          {/* Right side - Theme, Language and Logout */}
          <div className="flex items-center space-x-3">
            <button
              onClick={toggleLanguage}
              className="group p-2.5 rounded-xl bg-white dark:bg-gray-800 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105"
              title={
                language === "pt"
                  ? t("switchToEnglish")
                  : t("switchToPortuguese")
              }
            >
              <Translate
                size={20}
                className="text-gray-600 dark:text-gray-300 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors"
              />
            </button>

            <button
              onClick={toggleTheme}
              className="group p-2.5 rounded-xl bg-white dark:bg-gray-800 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105"
              title={t("switchTheme")}
            >
              {theme === "dark" ? (
                <Sun
                  size={20}
                  className="text-yellow-500 group-hover:text-yellow-400 transition-colors"
                />
              ) : (
                <Moon
                  size={20}
                  className="text-gray-600 group-hover:text-indigo-600 transition-colors"
                />
              )}
            </button>

            <button
              onClick={handleLogout}
              className="group flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-white dark:bg-gray-800 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 text-sm font-medium"
            >
              <SignOut
                size={16}
                className="text-gray-600 dark:text-gray-300 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors"
              />
              <span className="text-gray-600 dark:text-gray-300 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
                {t("logout")}
              </span>
            </button>
          </div>
        </div>

        {/* Navigation tabs */}
        {showNavigationButtons && (
          <div className="pb-4">
            <nav className="flex space-x-2 overflow-x-auto scrollbar-hide">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = isActivePath(item.path);

                return (
                  <button
                    key={item.path}
                    onClick={() => navigate(item.path)}
                    className={`
                      group relative flex items-center space-x-3 px-6 py-3 rounded-2xl font-medium text-sm
                      transition-all duration-300 hover:scale-105 hover:shadow-lg whitespace-nowrap
                      ${
                        isActive
                          ? `${item.bgColor} text-white shadow-lg shadow-${
                              item.color.split("-")[1]
                            }-500/25`
                          : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white shadow-md"
                      }
                    `}
                  >
                    {/* Active indicator */}
                    {isActive && (
                      <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-white rounded-full shadow-lg"></div>
                    )}

                    <Icon
                      size={20}
                      className={`
                        transition-all duration-300
                        ${
                          isActive
                            ? "text-white"
                            : "text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-200"
                        }
                      `}
                    />
                    <span className="font-semibold">{item.label}</span>

                    {/* Hover effect */}
                    {!isActive && (
                      <div
                        className={`absolute inset-0 rounded-2xl ${item.bgColor} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}
                      ></div>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
