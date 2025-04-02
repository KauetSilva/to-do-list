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
        return "bg-green-100 text-green-800 border-green-200";
      case "error":
        return "bg-red-100 text-red-800 border-red-200";
      case "warning":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "info":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getCloseButtonStyles = () => {
    switch (type) {
      case "success":
        return "bg-green-200 text-green-800 hover:bg-green-300";
      case "error":
        return "bg-red-200 text-red-800 hover:bg-red-300";
      case "warning":
        return "bg-yellow-200 text-yellow-800 hover:bg-yellow-300";
      case "info":
        return "bg-blue-200 text-blue-800 hover:bg-blue-300";
      default:
        return "bg-gray-200 text-gray-800 hover:bg-gray-300";
    }
  };

  const getActionButtonStyles = () => {
    switch (type) {
      case "success":
        return "text-green-800 bg-green-200 hover:bg-green-300";
      case "error":
        return "text-red-800 bg-red-200 hover:bg-red-300";
      case "warning":
        return "text-yellow-800 bg-yellow-200 hover:bg-yellow-300";
      case "info":
        return "text-blue-800 bg-blue-200 hover:bg-blue-300";
      default:
        return "text-gray-800 bg-gray-200 hover:bg-gray-300";
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
