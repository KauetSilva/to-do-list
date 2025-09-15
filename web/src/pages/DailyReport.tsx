import React from "react";
import DailyReportComponent from "../components/DailyReport";
import { Header } from "../components/Header";
import { useLanguage } from "../hooks/useLanguage";
import {
  AnimatedWrapper,
  usePageAnimation,
} from "../components/AnimatedWrapper";

const DailyReport: React.FC = () => {
  const { t } = useLanguage();
  const showPage = usePageAnimation(100);

  return (
    <div className="min-h-screen w-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <AnimatedWrapper show={showPage} animation="slide-up" timeout={400}>
        <Header
          title={t("dailyReport")}
          showBackButton={true}
          showNavigationButtons={true}
        />
      </AnimatedWrapper>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AnimatedWrapper
          show={showPage}
          animation="scale"
          timeout={500}
          delay={200}
        >
          <DailyReportComponent />
        </AnimatedWrapper>
      </main>
    </div>
  );
};

export default DailyReport;
