import { create } from 'zustand';
import { User, DateIdea, Restaurant, Reservation, DatePlan, Notification } from '../types';

export { useDatePlannerStore, DATE_OPTIONS, getDateOptionsForBudget } from './datePlannerStore';

interface AuthState {
  isAuthenticated: boolean;
  isOnboarded: boolean;
  user: User | null;
  token: string | null;
  setUser: (user: User) => void;
  setToken: (token: string) => void;
  logout: () => void;
  setOnboarded: (value: boolean) => void;
}

interface AppState {
  savedIdeas: string[];
  savedRestaurants: string[];
  plans: DatePlan[];
  reservations: Reservation[];
  notifications: Notification[];
  unreadNotifications: number;
  activeCategory: string;
  searchQuery: string;
  toggleSaveIdea: (id: string) => void;
  toggleSaveRestaurant: (id: string) => void;
  addPlan: (plan: DatePlan) => void;
  updatePlan: (id: string, updates: Partial<DatePlan>) => void;
  deletePlan: (id: string) => void;
  addReservation: (reservation: Reservation) => void;
  cancelReservation: (id: string) => void;
  setActiveCategory: (category: string) => void;
  setSearchQuery: (query: string) => void;
  markNotificationRead: (id: string) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  isOnboarded: false,
  user: null,
  token: null,
  setUser: (user) => set({ user, isAuthenticated: true }),
  setToken: (token) => set({ token }),
  logout: () => set({ isAuthenticated: false, user: null, token: null }),
  setOnboarded: (value) => set({ isOnboarded: value }),
}));

export const useAppStore = create<AppState>((set) => ({
  savedIdeas: [],
  savedRestaurants: [],
  plans: [],
  reservations: [],
  notifications: [],
  unreadNotifications: 0,
  activeCategory: 'all',
  searchQuery: '',

  toggleSaveIdea: (id) =>
    set((state) => ({
      savedIdeas: state.savedIdeas.includes(id)
        ? state.savedIdeas.filter((i) => i !== id)
        : [...state.savedIdeas, id],
    })),

  toggleSaveRestaurant: (id) =>
    set((state) => ({
      savedRestaurants: state.savedRestaurants.includes(id)
        ? state.savedRestaurants.filter((i) => i !== id)
        : [...state.savedRestaurants, id],
    })),

  addPlan: (plan) =>
    set((state) => ({ plans: [plan, ...state.plans] })),

  updatePlan: (id, updates) =>
    set((state) => ({
      plans: state.plans.map((p) => (p.id === id ? { ...p, ...updates } : p)),
    })),

  deletePlan: (id) =>
    set((state) => ({ plans: state.plans.filter((p) => p.id !== id) })),

  addReservation: (reservation) =>
    set((state) => ({ reservations: [reservation, ...state.reservations] })),

  cancelReservation: (id) =>
    set((state) => ({
      reservations: state.reservations.map((r) =>
        r.id === id ? { ...r, status: 'cancelled' as const } : r
      ),
    })),

  setActiveCategory: (category) => set({ activeCategory: category }),
  setSearchQuery: (query) => set({ searchQuery: query }),

  markNotificationRead: (id) =>
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, isRead: true } : n
      ),
      unreadNotifications: Math.max(0, state.unreadNotifications - 1),
    })),
}));
