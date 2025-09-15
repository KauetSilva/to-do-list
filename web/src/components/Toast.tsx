import React from "react";
import { XIcon } from "lucide-react";

export type ToastType = "success" | "error" | "info" | "warning";

interface ToastProps {
  type: ToastType;
  message: string;
  onClose: () => void;
  actionLabel?: string;
  onAction?: () => void;
}

export const Toast: React.FC<ToastProps> = ({
  type,
  message,
  onClose,
  actionLabel,
  onAction,
}) => {
  // Define styles based on type
  const getContainerStyles = () => {
    switch (type) {
      case "success":
        return "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 border-green-200 dark:border-green-700";
      case "error":
        return "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 border-red-200 dark:border-red-700";
      case "warning":
        return "bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 border-yellow-200 dark:border-yellow-700";
      case "info":
        return "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 border-blue-200 dark:border-blue-700";
      default:
        return "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 border-gray-200 dark:border-gray-700";
    }
  };

  const getCloseButtonStyles = () => {
    switch (type) {
      case "success":
        return "bg-green-200 dark:bg-green-800 text-green-800 dark:text-green-200 hover:bg-green-300 dark:hover:bg-green-700";
      case "error":
        return "bg-red-200 dark:bg-red-800 text-red-800 dark:text-red-200 hover:bg-red-300 dark:hover:bg-red-700";
      case "warning":
        return "bg-yellow-200 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-200 hover:bg-yellow-300 dark:hover:bg-yellow-700";
      case "info":
        return "bg-blue-200 dark:bg-blue-800 text-blue-800 dark:text-blue-200 hover:bg-blue-300 dark:hover:bg-blue-700";
      default:
        return "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600";
    }
  };

  const getActionButtonStyles = () => {
    switch (type) {
      case "success":
        return "text-green-800 dark:text-green-200 bg-green-200 dark:bg-green-800 hover:bg-green-300 dark:hover:bg-green-700";
      case "error":
        return "text-red-800 dark:text-red-200 bg-red-200 dark:bg-red-800 hover:bg-red-300 dark:hover:bg-red-700";
      case "warning":
        return "text-yellow-800 dark:text-yellow-200 bg-yellow-200 dark:bg-yellow-800 hover:bg-yellow-300 dark:hover:bg-yellow-700";
      case "info":
        return "text-blue-800 dark:text-blue-200 bg-blue-200 dark:bg-blue-800 hover:bg-blue-300 dark:hover:bg-blue-700";
      default:
        return "text-gray-800 dark:text-gray-200 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600";
    }
  };

  return (
    <div
      className={`flex items-center justify-between p-4 mb-4 rounded-lg border ${getContainerStyles()}`}
      role="alert"
    >
      <div className="flex items-center">
        <span className="text-sm font-medium">{message}</span>
      </div>
      <div className="flex items-center ml-auto space-x-2">
        {actionLabel && onAction && (
          <button
            type="button"
            className={`text-xs font-medium py-1 px-3 rounded ${getActionButtonStyles()}`}
            onClick={onAction}
          >
            {actionLabel}
          </button>
        )}
        <button
          type="button"
          className={`rounded-lg p-1.5 inline-flex items-center justify-center h-8 w-8 ${getCloseButtonStyles()}`}
          aria-label="Close"
          onClick={onClose}
        >
          <XIcon className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
