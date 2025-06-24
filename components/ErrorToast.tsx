"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, AlertTriangle, Ban, Zap } from "lucide-react";
import { useEffect } from "react";

interface ErrorToastProps {
  message: string;
  type: "validation" | "server" | "permission" | "network";
  isVisible: boolean;
  onClose: () => void;
  duration?: number;
}

export default function ErrorToast({
  message,
  type,
  isVisible,
  onClose,
  duration = 5000,
}: ErrorToastProps) {
  const getIcon = () => {
    switch (type) {
      case "validation":
        return <AlertTriangle className="w-5 h-5" />;
      case "server":
        return <Zap className="w-5 h-5" />;
      case "permission":
        return <Ban className="w-5 h-5" />;
      case "network":
        return <AlertTriangle className="w-5 h-5" />;
    }
  };

  const getColors = () => {
    switch (type) {
      case "validation":
        return "border-yellow-500/50 bg-yellow-500/10 text-yellow-200";
      case "server":
        return "border-red-500/50 bg-red-500/10 text-red-200";
      case "permission":
        return "border-orange-500/50 bg-orange-500/10 text-orange-200";
      case "network":
        return "border-blue-500/50 bg-blue-500/10 text-blue-200";
    }
  };

  const getTitle = () => {
    switch (type) {
      case "validation":
        return "Invalid Input";
      case "server":
        return "Server Error";
      case "permission":
        return "Access Denied";
      case "network":
        return "Connection Error";
    }
  };

  useEffect(() => {
    if (isVisible && duration > 0) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -50, scale: 0.95 }}
          className="fixed top-4 right-4 z-999 max-w-md"
        >
          <div
            className={`border border-dashed rounded-lg p-4 backdrop-blur-md ${getColors()}`}
          >
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-0.5">{getIcon()}</div>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-sm font-darker">
                  {getTitle()}
                </h4>
                <p className="text-sm font-primary mt-1 text-gray-300">
                  {message}
                </p>
              </div>
              <button
                onClick={onClose}
                className="flex-shrink-0 text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
