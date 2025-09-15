import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../hooks/useTheme";
import { useLanguage } from "../../hooks/useLanguage";
import {
  Eye,
  EyeSlash,
  Moon,
  Sun,
  Translate,
  CheckCircle,
  X,
  Warning,
  Info,
  UserPlus,
} from "phosphor-react";

interface RegisterData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface Toast {
  id: string;
  type: "success" | "error" | "info" | "warning";
  message: string;
  duration?: number;
}

export function Register() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [registerData, setRegisterData] = useState<RegisterData>({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errorMessage, setErrorMessage] = useState("");
  const [toasts, setToasts] = useState<Toast[]>([]);
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { t, toggleLanguage, language } = useLanguage();

  // Show toast notification
  const showToast = (
    type: "success" | "error" | "info" | "warning",
    message: string,
    duration = 3000
  ) => {
    const id = Date.now().toString();
    const newToast: Toast = { id, type, message, duration };
    setToasts((prevToasts) => [...prevToasts, newToast]);

    if (duration > 0) {
      setTimeout(() => {
        setToasts((prevToasts) =>
          prevToasts.filter((toast) => toast.id !== id)
        );
      }, duration);
    }
  };

  // Remove a specific toast
  const removeToast = (id: string) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");

    // Validations
    if (registerData.password !== registerData.confirmPassword) {
      setErrorMessage(t("passwordsDontMatch"));
      showToast("error", t("passwordsDontMatch"));
      setLoading(false);
      return;
    }

    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8000";
      const response = await fetch(`${apiUrl}/user/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: registerData.username,
          email: registerData.email,
          password: registerData.password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Armazenar o token retornado pela API
        localStorage.setItem("token", data.token);
        showToast("success", t("signUpSuccess"));

        // Curto delay para permitir que o usuário veja o toast de sucesso
        setTimeout(() => {
          // Redireciona para a página inicial (tasks) após registro bem-sucedido
          navigate("/tasks");
        }, 1500);
      } else {
        throw new Error(data.message || t("registrationFailed"));
      }
    } catch (error) {
      if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage(t("registrationFailed"));
      }
      showToast("error", t("signUpFailed"));
      console.error("Registration failed:", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen w-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 transition-colors duration-300 overflow-hidden relative">
      {/* Toast Container */}
      <div className="fixed top-4 right-4 z-50 flex flex-col space-y-2 w-80 max-w-[90%]">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`flex items-center justify-between p-3 rounded-lg shadow-lg transition-all duration-300 ${
              toast.type === "success"
                ? "bg-green-100 text-green-800"
                : toast.type === "error"
                ? "bg-red-100 text-red-800"
                : toast.type === "warning"
                ? "bg-yellow-100 text-yellow-800"
                : "bg-blue-100 text-blue-800"
            }`}
          >
            <div className="flex items-center">
              {toast.type === "success" ? (
                <CheckCircle className="mr-2" size={20} weight="fill" />
              ) : toast.type === "error" ? (
                <X className="mr-2" size={20} weight="fill" />
              ) : toast.type === "warning" ? (
                <Warning className="mr-2" size={20} weight="fill" />
              ) : (
                <Info className="mr-2" size={20} weight="fill" />
              )}
              <span className="text-sm">{toast.message}</span>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className={`p-1 rounded-full hover:bg-opacity-80 ${
                toast.type === "success"
                  ? "bg-green-200 text-green-800"
                  : toast.type === "error"
                  ? "bg-red-200 text-red-800"
                  : toast.type === "warning"
                  ? "bg-yellow-200 text-yellow-800"
                  : "bg-blue-200 text-blue-800"
              }`}
            >
              <X size={16} />
            </button>
          </div>
        ))}
      </div>

      <div className="absolute top-4 right-4 flex space-x-2">
        <button
          onClick={toggleLanguage}
          className="p-2 rounded-full bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-all duration-300"
          title={
            language === "pt" ? t("switchToEnglish") : t("switchToPortuguese")
          }
        >
          <Translate
            size={24}
            className="text-purple-600 dark:text-purple-400"
          />
        </button>
        <button
          onClick={toggleTheme}
          className="p-2 rounded-full bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-all duration-300"
        >
          {theme === "dark" ? (
            <Sun size={24} className="text-yellow-500" />
          ) : (
            <Moon size={24} className="text-gray-700" />
          )}
        </button>
      </div>

      <div className="w-full max-w-md mx-4 p-6 sm:p-8 space-y-4 sm:space-y-6 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl transform hover:scale-[1.01] transition-all duration-300">
        <div className="text-center">
          <div className="flex justify-center mb-3 sm:mb-4">
            <UserPlus
              size={40}
              className="text-purple-600 dark:text-purple-400 sm:h-12 sm:w-12"
              weight="duotone"
            />
          </div>
          <h1 className="text-2xl sm:text-4xl font-bold text-gray-900 dark:text-white">
            {t("createAccount")}
          </h1>
          <p className="mt-2 text-sm sm:text-base text-gray-600 dark:text-gray-400">
            {t("signUpToManageTasks")}
          </p>
        </div>

        {errorMessage && (
          <div className="p-3 bg-red-100 text-red-700 rounded-lg text-sm">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-6">
          <div>
            <label
              htmlFor="name"
              className="text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              {t("username")}
            </label>
            <input
              id="name"
              type="text"
              required
              value={registerData.username}
              onChange={(e) =>
                setRegisterData({ ...registerData, username: e.target.value })
              }
              className="mt-1 block w-full px-4 py-2 sm:py-3 rounded-lg bg-gray-100 dark:bg-gray-700 border-transparent focus:border-purple-500 focus:bg-white dark:focus:bg-gray-600 focus:ring-0 text-sm dark:text-white"
              placeholder={t("username")}
            />
          </div>

          <div>
            <label
              htmlFor="email"
              className="text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              {t("email")}
            </label>
            <input
              id="email"
              type="email"
              required
              value={registerData.email}
              onChange={(e) =>
                setRegisterData({ ...registerData, email: e.target.value })
              }
              className="mt-1 block w-full px-4 py-2 sm:py-3 rounded-lg bg-gray-100 dark:bg-gray-700 border-transparent focus:border-purple-500 focus:bg-white dark:focus:bg-gray-600 focus:ring-0 text-sm dark:text-white"
              placeholder={t("enterEmail")}
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              {t("password")}
            </label>
            <div className="relative mt-1">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                required
                value={registerData.password}
                onChange={(e) =>
                  setRegisterData({ ...registerData, password: e.target.value })
                }
                className="block w-full px-4 py-2 sm:py-3 rounded-lg bg-gray-100 dark:bg-gray-700 border-transparent focus:border-purple-500 focus:bg-white dark:focus:bg-gray-600 focus:ring-0 text-sm dark:text-white"
                placeholder={t("createPassword")}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                {showPassword ? (
                  <EyeSlash
                    size={20}
                    className="text-gray-500 dark:text-gray-400"
                  />
                ) : (
                  <Eye size={20} className="text-gray-500 dark:text-gray-400" />
                )}
              </button>
            </div>
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              {t("confirmPassword")}
            </label>
            <div className="relative mt-1">
              <input
                id="confirmPassword"
                type={showPassword ? "text" : "password"}
                required
                value={registerData.confirmPassword}
                onChange={(e) =>
                  setRegisterData({
                    ...registerData,
                    confirmPassword: e.target.value,
                  })
                }
                className="block w-full px-4 py-2 sm:py-3 rounded-lg bg-gray-100 dark:bg-gray-700 border-transparent focus:border-purple-500 focus:bg-white dark:focus:bg-gray-600 focus:ring-0 text-sm dark:text-white"
                placeholder={t("confirmYourPassword")}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 sm:py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-300"
            >
              {loading ? t("creatingAccount") : t("createAccount")}
            </button>
          </div>
        </form>

        <div className="text-center mt-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {t("alreadyHaveAccount")}{" "}
            <a
              href="/login"
              className="font-medium text-purple-600 hover:text-purple-500 dark:text-purple-400 dark:hover:text-purple-300"
            >
              {t("signIn")}
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
