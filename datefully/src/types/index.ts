// ─── Datefully — TypeScript Types ───────────────────────────────────────────

export type CoupleType = 'couple' | 'two_women' | 'two_men' | 'surprise' | 'solo';

export type Occasion =
  | 'Anniversary'
  | 'First Date'
  | 'Just Because'
  | "Valentine's Day"
  | 'Chill at Home'
  | 'Surprise'
  | 'Apology Date'
  | 'Teen Date'
  | 'Proposal';

export interface PartnerProfile {
  foodDrinks: string[];
  activities: string[];
  outdoors: string[];
  stayHome: string[];
  personality: string[];
  notFanOf: string[];
  accessibility: string[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export type DateCardType = 'best_match' | 'chill' | 'splurge';

export interface DateOption {
  id: string;
  type: DateCardType;
  typeLabel: string;
  typeEmoji: string;
  title: string;
  venues: string[];
  estimatedCost: string;
  description: string;
  dressCode: string;
  address?: string;
}

export interface VendorListing {
  id: string;
  name: string;
  category: string;
  rating: number;
  priceRange: string;
  description: string;
  bookingUrl: string;
  city: string;
  sponsored: boolean;
}

export interface SelectedDate {
  option: DateOption;
  bookedAt: Date;
  confirmationNumber: string;
  transportMode?: TransportMode;
}

export type TransportMode = 'walk' | 'uber' | 'lyft' | 'transit' | 'taxi';

export interface StarRating {
  bookingId: string;
  stars: number;
  review?: string;
  submittedAt: Date;
}

// Navigation param types
export type RootStackParamList = {
  Splash: undefined;
  WhosPlanning: undefined;
  Budget: undefined;
  PartnerProfile: undefined;
  AIChat: undefined;
  DateOptions: undefined;
  VendorMarketplace: undefined;
  InvitationCard: undefined;
  Confirmation: undefined;
  Login: undefined;
  Signup: undefined;
  AIError: undefined;
  LocationError: undefined;
  BudgetTooLow: undefined;
};
