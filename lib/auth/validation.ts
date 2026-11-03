export function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function getPasswordError(password: string) {
  if (password.length < 8) {
    return "Use at least 8 characters for your password.";
  }

  return null;
}
