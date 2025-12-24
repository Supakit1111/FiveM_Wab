export type Role = "ADMIN" | "USER";

export type AuthUser = {
  id: number;
  inGameName: string;
  phoneNumber?: string;
  role: Role;
  profileImageUrl?: string | null;
};

const TOKEN_KEY = "gm_token";
const USER_KEY = "gm_user";

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

export function getUser(): AuthUser | null {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export function setUser(user: AuthUser): void {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearUser(): void {
  localStorage.removeItem(USER_KEY);
}

export function logout(): void {
  clearToken();
  clearUser();
}

export function isAuthed(): boolean {
  return Boolean(getToken());
}

export function hasRole(allowed: Role[], role?: Role): boolean {
  if (!role) return false;
  return allowed.includes(role);
}
