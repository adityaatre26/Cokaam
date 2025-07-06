import { useState, useCallback } from "react";

interface ErrorState {
  message: string;
  type: "validation" | "server" | "permission" | "network";
  isVisible: boolean;
}

export const useErrorHandler = () => {
  const [error, setError] = useState<ErrorState>({
    message: "",
    type: "validation",
    isVisible: false,
  });

  const showError = useCallback(
    (message: string, type: ErrorState["type"] = "validation") => {
      setError({
        message,
        type,
        isVisible: true,
      });
    },
    []
  );

  const hideError = useCallback(() => {
    setError((prev) => ({ ...prev, isVisible: false }));
  }, []);

  const handleApiError = useCallback(
    (error: any) => {
      console.error("API Error:", error);

      if (error.response) {
        const status = error.response.status;
        const data = error.response.data;
        const errorMessage = data.error || data.message || "An error occurred";

        switch (status) {
          case 400:
            showError(
              errorMessage || "Invalid request. Check your input.",
              "validation"
            );
            break;
          case 401:
            showError(
              "You're not authorized. Please log in again.",
              "permission"
            );
            break;
          case 403:
            showError("You don't have permission to do that.", "permission");
            break;
          case 404:
            showError("Not found", "server");
            break;

          case 500:
            showError("Server is having issues. We're on it!", "server");
            break;
          default:
            showError("Something went wrong. Try again.", "server");
        }
      } else if (error.request) {
        showError("Can't reach the server. Check your connection.", "network");
      } else {
        showError("Something unexpected happened.", "server");
      }
    },
    [showError]
  );

  return {
    error,
    showError,
    hideError,
    handleApiError,
  };
};
