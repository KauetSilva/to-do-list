import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../hooks/useTheme";
import { useLanguage } from "../../hooks/useLanguage";
import { Eye, EyeSlash, Moon, Sun, Translate } from "phosphor-react";

interface LoginData {
  email: string;
  password: string;
}

export function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [loginData, setLoginData] = useState<LoginData>({
    email: "",
    password: "",
  });
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { t, toggleLanguage, language } = useLanguage();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");

    try {
      const response = await fetch("http://localhost:8000/user/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(loginData),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("@todo:token", data.token);
        navigate("/tasks");
      } else {
        throw new Error(data.message || t("invalidCredentials"));
      }
    } catch (error) {
      if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage(t("loginError"));
      }
      console.error("Login failed:", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen h-screen w-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 transition-colors duration-300 overflow-hidden">
      <div className="absolute top-4 right-4 flex space-x-2">
        <button
          onClick={toggleLanguage}
          className="p-2 rounded-full bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-all duration-300"
          title={
            language === "pt" ? "Switch to English" : "Mudar para Português"
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

      <div className="w-full max-w-md p-8 space-y-8 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl transform hover:scale-[1.01] transition-all duration-300">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
            {t("welcomeBack")}
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            {t("pleaseSignIn")}
          </p>
        </div>

        {errorMessage && (
          <div className="p-3 bg-red-100 text-red-700 rounded-lg text-sm">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
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
              value={loginData.email}
              onChange={(e) =>
                setLoginData({ ...loginData, email: e.target.value })
              }
              className="mt-1 block w-full px-4 py-3 rounded-lg bg-gray-100 dark:bg-gray-700 border-transparent focus:border-purple-500 focus:bg-white dark:focus:bg-gray-600 focus:ring-0 text-sm dark:text-white"
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
                value={loginData.password}
                onChange={(e) =>
                  setLoginData({ ...loginData, password: e.target.value })
                }
                className="block w-full px-4 py-3 rounded-lg bg-gray-100 dark:bg-gray-700 border-transparent focus:border-purple-500 focus:bg-white dark:focus:bg-gray-600 focus:ring-0 text-sm dark:text-white"
                placeholder={t("enterPassword")}
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
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-300"
            >
              {loading ? t("signingIn") : t("signIn")}
            </button>
          </div>
        </form>

        <div className="text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {t("dontHaveAccount")}{" "}
            <a
              href="/register"
              className="font-medium text-purple-600 hover:text-purple-500 dark:text-purple-400 dark:hover:text-purple-300"
            >
              {t("signUp")}
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
