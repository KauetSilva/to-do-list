import React, { useState } from "react";
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
  List,
  X,
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
        {/* Main header bar */}
        <div className="flex items-center justify-between py-4">
          {/* Left side - Logo, title and back button */}
          <div className="flex items-center space-x-3">
            {showBackButton && (
              <button
                onClick={handleBackClick}
                className="group p-2 rounded-xl bg-white dark:bg-gray-800 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 md:hidden"
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
                <Sparkle size={20} className="text-white md:w-6 md:h-6" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-lg md:text-xl lg:text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                  {title}
                </h1>
                <div className="h-1 w-8 md:w-12 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full mt-1"></div>
              </div>
            </div>
          </div>

          {/* Right side - Controls and hamburger */}
          <div className="flex items-center space-x-2">
            {/* Desktop navigation */}
            {showNavigationButtons && (
              <nav className="hidden lg:flex space-x-2">
                {navigationItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = isActivePath(item.path);

                  return (
                    <button
                      key={item.path}
                      onClick={() => navigate(item.path)}
                      className={`
                        group relative flex items-center space-x-2 px-4 py-2 rounded-xl font-medium text-sm
                        transition-all duration-300 hover:scale-105 hover:shadow-lg whitespace-nowrap
                        ${
                          isActive
                            ? `${item.bgColor} text-white shadow-lg`
                            : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white shadow-md"
                        }
                      `}
                    >
                      <Icon size={16} />
                      <span className="hidden xl:block">{item.label}</span>
                    </button>
                  );
                })}
              </nav>
            )}

            {/* Theme and Language controls */}
            <div className="hidden sm:flex items-center space-x-2">
              <button
                onClick={toggleLanguage}
                className="group p-2 rounded-xl bg-white dark:bg-gray-800 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105"
                title={
                  language === "pt"
                    ? t("switchToEnglish")
                    : t("switchToPortuguese")
                }
              >
                <Translate
                  size={18}
                  className="text-gray-600 dark:text-gray-300 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors"
                />
              </button>

              <button
                onClick={toggleTheme}
                className="group p-2 rounded-xl bg-white dark:bg-gray-800 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105"
                title={t("switchTheme")}
              >
                {theme === "dark" ? (
                  <Sun
                    size={18}
                    className="text-yellow-500 group-hover:text-yellow-400 transition-colors"
                  />
                ) : (
                  <Moon
                    size={18}
                    className="text-gray-600 group-hover:text-indigo-600 transition-colors"
                  />
                )}
              </button>
            </div>

            {/* Hamburger menu button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl bg-white dark:bg-gray-800 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105"
              title="Menu"
            >
              {isMobileMenuOpen ? (
                <X size={20} className="text-gray-600 dark:text-gray-300" />
              ) : (
                <List size={20} className="text-gray-600 dark:text-gray-300" />
              )}
            </button>

            {/* Desktop logout */}
            <button
              onClick={handleLogout}
              className="hidden sm:flex items-center space-x-2 px-3 py-2 rounded-xl bg-white dark:bg-gray-800 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 text-sm font-medium"
            >
              <SignOut
                size={16}
                className="text-gray-600 dark:text-gray-300 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors"
              />
              <span className="hidden md:block text-gray-600 dark:text-gray-300">
                {t("logout")}
              </span>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden pb-4 border-t border-gray-200 dark:border-gray-700 pt-4 mobile-menu-enter">
            <nav className="space-y-2">
              {showNavigationButtons &&
                navigationItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = isActivePath(item.path);

                  return (
                    <button
                      key={item.path}
                      onClick={() => {
                        navigate(item.path);
                        setIsMobileMenuOpen(false);
                      }}
                      className={`
                      w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-medium text-sm
                      transition-all duration-300 hover:scale-[1.02]
                      ${
                        isActive
                          ? `${item.bgColor} text-white shadow-lg`
                          : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white shadow-md"
                      }
                    `}
                    >
                      <Icon size={20} />
                      <span>{item.label}</span>
                      {isActive && (
                        <div className="ml-auto w-2 h-2 bg-white rounded-full"></div>
                      )}
                    </button>
                  );
                })}

              {/* Mobile controls */}
              <div className="pt-2 border-t border-gray-200 dark:border-gray-700 space-y-2">
                <button
                  onClick={() => {
                    toggleLanguage();
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 shadow-md font-medium text-sm"
                >
                  <Translate size={20} />
                  <span>{language === "pt" ? "English" : "Português"}</span>
                </button>

                <button
                  onClick={() => {
                    toggleTheme();
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 shadow-md font-medium text-sm"
                >
                  {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
                  <span>
                    {theme === "dark" ? t("lightMode") : t("darkMode")}
                  </span>
                </button>

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 shadow-md font-medium text-sm hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                >
                  <SignOut size={20} />
                  <span>{t("logout")}</span>
                </button>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
