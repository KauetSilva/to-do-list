import React, {
  useState,
  useEffect,
  createContext,
  useContext,
  ReactNode,
} from "react";

// Tipos de idiomas suportados
type Language = "pt" | "en";

// Interface para traduções
interface Translations {
  [key: string]: {
    [key: string]: string;
  };
}

// Dicionário de traduções
const translations: Translations = {
  // Traduções da página de login
  welcomeBack: {
    pt: "Bem-vindo(a) de Volta",
    en: "Welcome Back",
  },
  pleaseSignIn: {
    pt: "Por favor, faça login em sua conta",
    en: "Please sign in to your account",
  },
  email: {
    pt: "E-mail",
    en: "Email",
  },
  password: {
    pt: "Senha",
    en: "Password",
  },
  enterEmail: {
    pt: "Digite seu e-mail",
    en: "Enter your email",
  },
  enterPassword: {
    pt: "Digite sua senha",
    en: "Enter your password",
  },
  signIn: {
    pt: "Entrar",
    en: "Sign in",
  },
  signingIn: {
    pt: "Entrando...",
    en: "Signing in...",
  },
  dontHaveAccount: {
    pt: "Não tem uma conta?",
    en: "Don't have an account?",
  },
  signUp: {
    pt: "Cadastre-se",
    en: "Sign up",
  },
  invalidCredentials: {
    pt: "E-mail ou senha inválidos",
    en: "Invalid email or password",
  },
  loginError: {
    pt: "Ocorreu um erro durante o login",
    en: "An error occurred during login",
  },
};

// Contexto para o idioma
interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  toggleLanguage: () => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined
);

// Provider para o contexto de idioma
interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({
  children,
}) => {
  const [language, setLanguage] = useState<Language>(() => {
    const savedLanguage = localStorage.getItem("@todo:language");
    return (savedLanguage as Language) || "pt";
  });

  useEffect(() => {
    localStorage.setItem("@todo:language", language);
  }, [language]);

  // Função para traduzir
  const t = (key: string): string => {
    if (!translations[key]) {
      console.warn(`Translation key not found: ${key}`);
      return key;
    }
    return translations[key][language] || key;
  };

  // Função para alternar entre idiomas
  const toggleLanguage = () => {
    setLanguage(language === "pt" ? "en" : "pt");
  };
  return (
    <LanguageContext.Provider
      value={{ language, setLanguage, t, toggleLanguage }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

// Hook para usar o contexto de idioma
export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
