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
  // Traduções da página de tarefas
  taskPageTitle: {
    pt: "Minhas Tarefas",
    en: "My Tasks",
  },
  taskSummary: {
    pt: "Resumo das Tarefas",
    en: "Task Summary",
  },
  tasksCompleted: {
    pt: "de",
    en: "of",
  },
  tasksTotalCompleted: {
    pt: "tarefas concluídas",
    en: "tasks completed",
  },
  addNewTask: {
    pt: "Adicionar Nova Tarefa",
    en: "Add New Task",
  },
  taskTitle: {
    pt: "Título",
    en: "Title",
  },
  taskDescription: {
    pt: "Descrição",
    en: "Description",
  },
  taskTitlePlaceholder: {
    pt: "Título da tarefa...",
    en: "Task title...",
  },
  taskDescriptionPlaceholder: {
    pt: "Descrição da tarefa (opcional)...",
    en: "Task description (optional)...",
  },
  addTask: {
    pt: "Adicionar Tarefa",
    en: "Add Task",
  },
  showDetails: {
    pt: "Mostrar Detalhes",
    en: "Show Details",
  },
  hideDetails: {
    pt: "Esconder Detalhes",
    en: "Hide Details",
  },
  deleteTask: {
    pt: "Excluir Tarefa",
    en: "Delete Task",
  },
  noTasks: {
    pt: "Você não tem tarefas ainda. Adicione sua primeira tarefa acima!",
    en: "You don't have any tasks yet. Add your first task above!",
  },
  logout: {
    pt: "Sair",
    en: "Logout",
  },

  // Traduções da página de performance
  performanceTitle: {
    pt: "Painel de Desempenho",
    en: "Performance Dashboard",
  },
  completionRate: {
    pt: "Taxa de Conclusão",
    en: "Completion Rate",
  },
  ofAllTasks: {
    pt: "de todas as tarefas",
    en: "of all your tasks",
  },
  totalTasks: {
    pt: "Total de Tarefas",
    en: "Total Tasks",
  },
  completed: {
    pt: "concluídas",
    en: "completed",
  },
  pending: {
    pt: "pendentes",
    en: "pending",
  },
  last7Days: {
    pt: "Últimos 7 dias",
    en: "Last 7 Days",
  },
  tasksCompleted7Days: {
    pt: "tarefas concluídas",
    en: "tasks completed",
  },
  dailyAverage: {
    pt: "Média Diária",
    en: "Daily Average",
  },
  tasksPerDay: {
    pt: "tarefas por dia",
    en: "tasks per day",
  },
  taskCompletionProgress: {
    pt: "Progresso de Conclusão",
    en: "Task Completion Progress",
  },
  completedLabel: {
    pt: "Concluídas",
    en: "Completed",
  },
  pendingLabel: {
    pt: "Pendentes",
    en: "Pending",
  },
  yourRecentTasks: {
    pt: "Suas Tarefas Recentes",
    en: "Your Recent Tasks",
  },
  noTasksFound: {
    pt: "Nenhuma tarefa encontrada. Crie algumas tarefas para ver seu desempenho!",
    en: "No tasks found. Create some tasks to see your performance!",
  },
  viewAllTasks: {
    pt: "Ver todas as",
    en: "View all",
  },
  tasks: {
    pt: "tarefas",
    en: "tasks",
  },
  monthlyOverview: {
    pt: "Visão Mensal",
    en: "Monthly Overview",
  },
  tasksCompletedLabel: {
    pt: "Tarefas Concluídas",
    en: "Tasks Completed",
  },
  inLast30Days: {
    pt: "nos últimos 30 dias",
    en: "in the last 30 days",
  },
  productivityScore: {
    pt: "Pontuação de Produtividade",
    en: "Productivity Score",
  },
  basedOnActivity: {
    pt: "com base na sua atividade",
    en: "based on your activity",
  },
  tipsToImprove: {
    pt: "Dicas para Melhorar a Produtividade",
    en: "Tips to Improve Productivity",
  },
  tip1: {
    pt: "Divida tarefas grandes em subtarefas menores e gerenciáveis.",
    en: "Break down large tasks into smaller, manageable subtasks.",
  },
  tip2: {
    pt: "Defina prazos específicos para cada tarefa para manter o foco.",
    en: "Set specific deadlines for each task to stay on track.",
  },
  tip3: {
    pt: "Priorize tarefas por importância e resolva as mais críticas primeiro.",
    en: "Prioritize tasks by importance and tackle the most critical ones first.",
  },
  tip4: {
    pt: "Celebre suas conquistas e faça pausas entre as tarefas.",
    en: "Celebrate your achievements and take breaks between tasks.",
  },
  switchTheme: {
    pt: "Alternar Tema",
    en: "Switch Theme",
  },
  darkMode: {
    pt: "Modo Escuro",
    en: "Dark Mode",
  },
  viewPerformance: {
    pt: "Ver Desempenho",
    en: "View Performance",
  },
  taskOverdue: {
    pt: "Esta tarefa está pendente há mais de 5 dias",
    en: "This task has been pending for more than 5 days",
  },
  taskRecent: {
    pt: "Tarefa recente (menos de 1 dia)",
    en: "Recent task (less than 1 day)",
  },
  taskTwoDays: {
    pt: "Tarefa pendente há 1-2 dias",
    en: "Task pending for 1-2 days",
  },
  taskThreeDays: {
    pt: "Tarefa pendente há 2-3 dias",
    en: "Task pending for 2-3 days",
  },
  taskFiveDays: {
    pt: "Tarefa pendente há 3-5 dias",
    en: "Task pending for 3-5 days",
  },
  editTask: {
    pt: "Editar tarefa",
    en: "Edit task",
  },
  saveTask: {
    pt: "Salvar tarefa",
    en: "Save task",
  },
  cancelEdit: {
    pt: "Cancelar edição",
    en: "Cancel edit",
  },
  save: {
    pt: "Salvar",
    en: "Save",
  },
  cancel: {
    pt: "Cancelar",
    en: "Cancel",
  },
  taskAdded: {
    pt: "Tarefa adicionada com sucesso!",
    en: "Task added successfully!",
  },
  taskAddFailed: {
    pt: "Falha ao adicionar tarefa",
    en: "Failed to add task",
  },
  taskUpdated: {
    pt: "Tarefa atualizada com sucesso!",
    en: "Task updated successfully!",
  },
  taskUpdateFailed: {
    pt: "Falha ao atualizar tarefa",
    en: "Failed to update task",
  },
  taskMarkedComplete: {
    pt: "Tarefa marcada como concluída",
    en: "Task marked as complete",
  },
  taskMarkedIncomplete: {
    pt: "Tarefa marcada como não concluída",
    en: "Task marked as incomplete",
  },
  taskDeletedUndo: {
    pt: "Tarefa excluída. Desfazer?",
    en: "Task deleted. Undo?",
  },
  taskBeingDeleted: {
    pt: 'A tarefa "{{title}}" será excluída em 5 segundos',
    en: 'Task "{{title}}" will be deleted in 5 seconds',
  },
  undoDelete: {
    pt: "Desfazer exclusão",
    en: "Undo delete",
  },
  taskRestored: {
    pt: "Tarefa restaurada",
    en: "Task restored",
  },
  taskDeleteFailed: {
    pt: "Falha ao excluir tarefa",
    en: "Failed to delete task",
  },
  loginSuccess: {
    pt: "Login realizado com sucesso!",
    en: "Login successful!",
  },
  loginFailed: {
    pt: "Falha ao fazer login",
    en: "Login failed",
  },
  signUpSuccess: {
    pt: "Cadastro realizado com sucesso! Redirecionando para a página inicial...",
    en: "Sign up successful! Redirecting to home page...",
  },
  signUpFailed: {
    pt: "Falha ao realizar cadastro",
    en: "Sign up failed",
  },
  // Register page translations
  createAccount: {
    pt: "Criar Conta",
    en: "Create Account",
  },
  signUpToManageTasks: {
    pt: "Cadastre-se para começar a gerenciar suas tarefas",
    en: "Sign up to start managing your tasks",
  },
  fullName: {
    pt: "Nome Completo",
    en: "Full Name",
  },
  username: {
    pt: "Nome de Usuário",
    en: "Username",
  },
  enterFullName: {
    pt: "Digite seu nome completo",
    en: "Enter your full name",
  },
  createPassword: {
    pt: "Crie uma senha",
    en: "Create a password",
  },
  confirmPassword: {
    pt: "Confirmar Senha",
    en: "Confirm Password",
  },
  confirmYourPassword: {
    pt: "Confirme sua senha",
    en: "Confirm your password",
  },
  creatingAccount: {
    pt: "Criando conta...",
    en: "Creating account...",
  },
  alreadyHaveAccount: {
    pt: "Já tem uma conta?",
    en: "Already have an account?",
  },
  passwordsDontMatch: {
    pt: "As senhas não coincidem",
    en: "Passwords don't match",
  },
  registrationFailed: {
    pt: "Falha no registro",
    en: "Registration failed",
  },
  actions: {
    pt: "Ações",
    en: "Actions",
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
