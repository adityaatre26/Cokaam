export const validateEmail = (email: string): string | null => {
  if (!email) return "Email is required";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "Invalid email format";
  return null;
};

export const validateRequired = (
  value: string,
  field: string
): string | null => {
  if (!value || value.trim() === "") return `${field} is required`;
  return null;
};

export const validateUrl = (url: string): string | null => {
  if (!url) return "URL is required";
  try {
    new URL(url);
    return null;
  } catch {
    return "URL should be in the format: https://github.com/username/reponame";
  }
};

export const validateGithubUrl = (url: string): string | null => {
  // First check if it's a valid URL
  const urlError = validateUrl(url);
  if (urlError) return urlError;

  // Check if it's a GitHub URL
  if (!url.includes("github.com")) {
    return "Must be a GitHub repository URL";
  }

  // More specific GitHub URL validation
  const githubUrlPattern =
    /^https:\/\/github\.com\/[a-zA-Z0-9._-]+\/[a-zA-Z0-9._-]+\/?$/;

  if (!githubUrlPattern.test(url)) {
    return "GitHub URL must be in format: https://github.com/username/reponame";
  }

  // Additional checks
  const urlParts = url.replace(/\/$/, "").split("/"); // Remove trailing slash and split

  if (urlParts.length !== 5) {
    return "Invalid GitHub repository URL format";
  }

  const username = urlParts[3];
  const reponame = urlParts[4];

  // Check username constraints
  if (username.length < 1 || username.length > 39) {
    return "GitHub username must be 1-39 characters";
  }

  if (username.startsWith("-") || username.endsWith("-")) {
    return "GitHub username cannot start or end with hyphen";
  }

  if (username.includes("--")) {
    return "GitHub username cannot contain consecutive hyphens";
  }

  // Check repository name constraints
  if (reponame.length < 1 || reponame.length > 100) {
    return "GitHub repository name must be 1-100 characters";
  }

  if (reponame.startsWith(".") || reponame.endsWith(".")) {
    return "GitHub repository name cannot start or end with period";
  }

  return null;
};

export const validateLength = (
  value: string,
  min: number,
  max: number,
  field: string
): string | null => {
  if (value.length < min) return `${field} must be at least ${min} characters`;
  if (value.length > max) return `${field} must be less than ${max} characters`;
  return null;
};

// Sanitize input to prevent XSS
export const sanitizeInput = (input: string): string => {
  return input
    .replace(/[<>]/g, "") // Remove angle brackets
    .replace(/javascript:/gi, "") // Remove javascript: protocol
    .replace(/on\w+=/gi, "") // Remove event handlers
    .trim();
};
