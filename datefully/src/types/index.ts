export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  bio?: string;
  relationshipType: 'single' | 'dating' | 'married' | 'friends';
  partnerName?: string;
  partnerAvatar?: string;
  location?: string;
  preferences: UserPreferences;
  createdAt: string;
}

export interface UserPreferences {
  categories: string[];
  budgetRange: string;
  notificationsEnabled: boolean;
  saveHistory: boolean;
}

export interface DateIdea {
  id: string;
  title: string;
  description: string;
  category: string;
  imageUrl: string;
  rating: number;
  reviewCount: number;
  priceRange: '$' | '$$' | '$$$' | '$$$$';
  estimatedDuration: string;
  location?: string;
  distance?: string;
  tags: string[];
  isFeatured: boolean;
  isSaved: boolean;
  vendor?: Vendor;
  tips?: string[];
  bestFor: string[];
}

export interface Restaurant {
  id: string;
  name: string;
  cuisine: string;
  description: string;
  imageUrl: string;
  images: string[];
  rating: number;
  reviewCount: number;
  priceRange: '$' | '$$' | '$$$' | '$$$$';
  address: string;
  distance: string;
  phone: string;
  website?: string;
  hours: DayHours[];
  ambiance: string[];
  features: string[];
  availableSlots: TimeSlot[];
  isOpen: boolean;
  isVerified: boolean;
}

export interface DayHours {
  day: string;
  open: string;
  close: string;
}

export interface TimeSlot {
  time: string;
  available: number;
  total: number;
}

export interface Reservation {
  id: string;
  restaurantId: string;
  restaurantName: string;
  restaurantImage: string;
  date: string;
  time: string;
  partySize: number;
  specialRequests?: string;
  status: 'confirmed' | 'pending' | 'cancelled' | 'completed';
  confirmationCode: string;
  createdAt: string;
}

export interface Vendor {
  id: string;
  name: string;
  type: 'restaurant' | 'activity' | 'spa' | 'entertainment' | 'travel';
  description: string;
  imageUrl: string;
  rating: number;
  reviewCount: number;
  priceRange: string;
  phone?: string;
  website?: string;
  address?: string;
  isVerified: boolean;
}

export interface DatePlan {
  id: string;
  title: string;
  date: string;
  time?: string;
  notes?: string;
  items: DatePlanItem[];
  totalBudget?: number;
  status: 'upcoming' | 'completed' | 'cancelled';
  coverImage?: string;
  memories?: Memory[];
  createdAt: string;
}

export interface DatePlanItem {
  id: string;
  type: 'restaurant' | 'activity' | 'idea' | 'custom';
  title: string;
  description?: string;
  time?: string;
  duration?: string;
  cost?: number;
  location?: string;
  referenceId?: string;
  isCompleted: boolean;
}

export interface Memory {
  id: string;
  planId: string;
  imageUrls: string[];
  caption?: string;
  mood: string;
  rating: number;
  createdAt: string;
}

export interface Review {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  targetId: string;
  targetType: 'restaurant' | 'idea' | 'vendor';
  rating: number;
  title?: string;
  body: string;
  images?: string[];
  helpfulCount: number;
  createdAt: string;
}

export interface Notification {
  id: string;
  type: 'reminder' | 'reservation' | 'suggestion' | 'achievement';
  title: string;
  body: string;
  data?: Record<string, string>;
  isRead: boolean;
  createdAt: string;
}

export type RootStackParamList = {
  Welcome: undefined;
  Login: undefined;
  Signup: undefined;
  Onboarding: undefined;
  MainTabs: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Explore: undefined;
  Plan: undefined;
  Reservations: undefined;
  Profile: undefined;
};

export type HomeStackParamList = {
  HomeScreen: undefined;
  DateIdeaDetail: { idea: DateIdea };
  RestaurantDetail: { restaurant: Restaurant };
};

export type ExploreStackParamList = {
  ExploreScreen: undefined;
  CategoryResults: { category: string; label: string };
  DateIdeaDetail: { idea: DateIdea };
};

export type PlanStackParamList = {
  PlansScreen: undefined;
  CreatePlan: undefined;
  PlanDetail: { plan: DatePlan };
  AddTosPlan: { planId: string };
};

export type ReservationsStackParamList = {
  ReservationsScreen: undefined;
  RestaurantList: undefined;
  RestaurantDetail: { restaurant: Restaurant };
  BookTable: { restaurant: Restaurant };
  ReservationConfirmation: { reservation: Reservation };
};

// ─── Datefully Planner Types ─────────────────────────────────────────────────

export interface DateOption {
  id: string;
  name: string;
  description: string;
  estimatedCost: number;
  isPaid: boolean;
  category: string;
  openTableUrl: string | null;
  emoji: string;
}

export type DatefullyStackParamList = {
  Splash: undefined;
  PlannerSetup: undefined;
  Budget: undefined;
  PartnerProfile: undefined;
  Results: undefined;
  Confirmation: { dateOption: DateOption };
};
