import React from "react";
import SprintBoard from "../components/SprintBoard";
import { Header } from "../components/Header";
import { useLanguage } from "../hooks/useLanguage";
import {
  AnimatedWrapper,
  usePageAnimation,
} from "../components/AnimatedWrapper";

const Sprints: React.FC = () => {
  const { t } = useLanguage();
  const showPage = usePageAnimation(100);

  return (
    <div className="min-h-screen w-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <AnimatedWrapper show={showPage} animation="slide-up" timeout={400}>
        <Header
          title={t("sprints")}
          showBackButton={true}
          showNavigationButtons={true}
        />
      </AnimatedWrapper>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AnimatedWrapper
          show={showPage}
          animation="slide-right"
          timeout={500}
          delay={200}
        >
          <SprintBoard />
        </AnimatedWrapper>
      </main>
    </div>
  );
};

export default Sprints;
