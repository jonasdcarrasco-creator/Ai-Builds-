// ─── Datefully — TypeScript Types (v2) ───────────────────────────────────────

export type CoupleType = 'couple' | 'two_women' | 'two_men' | 'surprise' | 'solo' | 'family';

export type TimeOfDay = 'morning' | 'afternoon' | 'evening' | 'late_night';

export type Occasion =
  | 'Anniversary'
  | 'First Date'
  | 'Just Because'
  | "Valentine's Day"
  | 'Surprise'
  | 'Apology Date'
  | 'Teen Date'
  | 'Proposal'
  | 'Family Date';

export type OccasionType = 'anniversary' | 'birthday' | 'first_date_anniversary' | 'custom';

export interface PartnerProfile {
  // Food section 1 — dietary needs (hard filters)
  dietaryNeeds: string[];
  // Food section 2 — cuisine preferences
  cuisinePreferences: string[];
  // Other sections
  activities: string[];
  accessibility: string[];
  personality: string[];
  avoid: string[];
  // Legacy support
  foodDrinks?: string[];
  outdoors?: string[];
  stayHome?: string[];
  notFanOf?: string[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export type DateCardType = 'best_match' | 'chill' | 'splurge';

export interface DateStop {
  label: 'START' | 'MIDDLE' | 'END';
  venueName: string;
  venueType: string;
  estimatedCost: string;
  duration: string;       // e.g. "1.5 hrs"
  time?: string;          // e.g. "7:00 PM"
  dietaryVerified?: string; // 'Halal Verified' | 'Vegan Friendly' | null
  rating?: number;
  reviewCount?: number;
}

export interface DateOption {
  id: string;
  type: DateCardType;
  typeLabel: string;
  typeEmoji: string;
  title: string;
  stops: DateStop[];      // START, MIDDLE, END
  venues: string[];       // flat list for backward compat
  estimatedCost: string;
  totalCost: number;      // numeric for breakdown
  description: string;
  dressCode: string;
  address?: string;
  dietaryBadge?: string | null;
}

export interface VendorListing {
  id: string;
  name: string;
  category: 'restaurant' | 'experience' | 'addon';
  city: string;
  dietaryTags: string[];
  rating: number;
  reviewCount: number;
  priceRange: string;
  distance: string;       // e.g. "0.4 mi"
  parkingInfo: string;
  badges: string[];       // 'Black-Owned', 'Woman-Owned', 'Halal Verified', 'LGBTQ+ Welcoming'
  description: string;
  bookingUrl: string;
  sponsored: boolean;
}

export interface SelectedDate {
  option: DateOption;
  bookedAt: Date;
  confirmationNumber: string;
  transportMode?: TransportMode;
}

export type TransportMode = 'walk' | 'uber' | 'lyft' | 'transit' | 'taxi' | 'limo';

export interface StarRating {
  bookingId: string;
  stars: number;
  review?: string;
  submittedAt: Date;
}

export interface WeatherData {
  city: string;
  temperature: number;
  condition: string;
  description: string;
  isRainy: boolean;
  emoji: string;
  windSpeed: number;
  humidity: number;
}

export interface SpecialOccasion {
  id?: string;
  userId: string;
  type: OccasionType;
  label: string;
  date: string;          // ISO date string YYYY-MM-DD
  reminderSent: boolean;
}

export interface UserCoords {
  lat: number;
  lon: number;
}

// Navigation
export type RootStackParamList = {
  Splash: undefined;
  CityPicker: undefined;
  WhosPlanning: undefined;
  Budget: undefined;
  PartnerProfile: undefined;
  WeatherChat: undefined;
  DateOptions: undefined;
  VendorMarketplace: undefined;
  InvitationCard: undefined;
  Confirmation: undefined;
  Anniversary: undefined;
  Login: undefined;
  Signup: undefined;
  AIError: undefined;
  LocationError: undefined;
  BudgetTooLow: undefined;
};
