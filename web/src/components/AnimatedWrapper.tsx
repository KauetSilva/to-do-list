import React, { ReactNode, useState, useEffect } from "react";

interface AnimatedWrapperProps {
  children: ReactNode;
  show?: boolean;
  animation?:
    | "fade"
    | "slide-up"
    | "scale"
    | "slide-right"
    | "bounce"
    | "rotate"
    | "page"
    | "stagger";
  timeout?: number;
  delay?: number;
  className?: string;
  unmountOnExit?: boolean;
}

export const AnimatedWrapper: React.FC<AnimatedWrapperProps> = ({
  children,
  show = true,
  animation = "fade",
  timeout = 500,
  delay = 0,
  className = "",
  unmountOnExit = false,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [shouldRender, setShouldRender] = useState(!unmountOnExit);

  useEffect(() => {
    if (show) {
      setShouldRender(true);
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, delay);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
      if (unmountOnExit) {
        const timer = setTimeout(() => {
          setShouldRender(false);
        }, timeout);
        return () => clearTimeout(timer);
      }
    }
  }, [show, delay, timeout, unmountOnExit]);

  if (!shouldRender) {
    return null;
  }

  const animationClass = isVisible
    ? `${animation}-enter-active`
    : `${animation}-enter`;

  return (
    <div
      className={`${className} ${animationClass}`}
      style={{
        transition: `all ${timeout}ms ease-out`,
      }}
    >
      {children}
    </div>
  );
};

// Componente para animações em listas com efeito stagger
interface StaggeredListProps {
  children: ReactNode[];
  animation?: "stagger" | "fade" | "slide-up" | "scale";
  staggerDelay?: number;
  className?: string;
}

export const StaggeredList: React.FC<StaggeredListProps> = ({
  children,
  animation = "stagger",
  staggerDelay = 100,
  className = "",
}) => {
  return (
    <div className={className}>
      {React.Children.map(children, (child, index) => (
        <AnimatedWrapper
          key={index}
          animation={animation}
          delay={index * staggerDelay}
          className={`stagger-delay-${Math.min(index + 1, 5)}`}
        >
          {child}
        </AnimatedWrapper>
      ))}
    </div>
  );
};

// Hook personalizado para controlar animações de montagem
export const usePageAnimation = (delay: number = 0) => {
  const [show, setShow] = React.useState(false);

  React.useEffect(() => {
    // Garantir que comece oculto
    setShow(false);

    const timer = setTimeout(() => {
      setShow(true);
    }, Math.max(delay, 50)); // Mínimo de 50ms para garantir que renderize oculto primeiro

    return () => clearTimeout(timer);
  }, [delay]);

  return show;
};

export default AnimatedWrapper;
