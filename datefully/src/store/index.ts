import { create } from 'zustand';

// Auth store — lightweight, just tracks session
interface AuthState {
  isAuthenticated: boolean;
  userEmail: string | null;
  setAuthenticated: (value: boolean, email?: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  userEmail: null,
  setAuthenticated: (value, email) =>
    set({ isAuthenticated: value, userEmail: email ?? null }),
  logout: () => set({ isAuthenticated: false, userEmail: null }),
}));

// Re-export the main date store
export { useDateStore } from './dateStore';
