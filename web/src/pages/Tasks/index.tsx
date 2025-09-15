import React from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../../hooks/useLanguage";
import TaskList from "../../components/TaskList";
import { Header } from "../../components/Header";
import {
  AnimatedWrapper,
  usePageAnimation,
} from "../../components/AnimatedWrapper";

export function Tasks() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const showPage = usePageAnimation(100);

  // Check if user is authenticated
  React.useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
    }
  }, [navigate]);

  return (
    <div className="min-h-screen w-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <AnimatedWrapper show={showPage} animation="slide-up" timeout={400}>
        <Header title={t("taskPageTitle")} />
      </AnimatedWrapper>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AnimatedWrapper
          show={showPage}
          animation="fade"
          timeout={600}
          delay={200}
        >
          <TaskList />
        </AnimatedWrapper>
      </main>
    </div>
  );
}
