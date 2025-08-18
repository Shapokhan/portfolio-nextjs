// utils/authErrors.ts
export function mapAuthError(errorCode?: string): string {
  if (!errorCode) return "An unknown error occurred";

  switch (errorCode) {
    case "CredentialsSignin":
      return "Incorrect Email or Password";
    case "Configuration":
      return "Configuration error. Please contact support.";
    case "AccessDenied":
      return "Access denied. You don’t have permission.";
    case "Verification":
      return "Email verification failed.";
    default:
      return errorCode; // fallback (shows original if unknown)
  }
}
