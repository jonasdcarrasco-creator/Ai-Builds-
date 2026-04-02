import { create } from 'zustand';
import {
  CoupleType,
  Occasion,
  PartnerProfile,
  ChatMessage,
  DateOption,
  SelectedDate,
  VendorListing,
} from '../types';

interface DateStore {
  // User info
  userName: string;
  userEmail: string;
  userCity: string;

  // Planning
  planningFor: CoupleType;
  occasion: Occasion | null;
  budget: number;

  // Partner
  partnerProfile: PartnerProfile;

  // Chat
  chatMessages: ChatMessage[];

  // Date options
  dateOptions: DateOption[];

  // Selected date
  selectedDate: SelectedDate | null;

  // Booking time (for post-date rating)
  bookingTime: number | null;

  // Vendor listings
  vendorListings: VendorListing[];

  // Actions
  setUserName: (name: string) => void;
  setUserEmail: (email: string) => void;
  setPlanningFor: (type: CoupleType) => void;
  setOccasion: (occasion: Occasion) => void;
  setBudget: (budget: number) => void;
  setPartnerProfile: (profile: Partial<PartnerProfile>) => void;
  addChatMessage: (message: ChatMessage) => void;
  updateLastMessage: (content: string) => void;
  clearChatMessages: () => void;
  setDateOptions: (options: DateOption[]) => void;
  setSelectedDate: (date: SelectedDate) => void;
  setBookingTime: (time: number) => void;
  setVendorListings: (vendors: VendorListing[]) => void;
  resetPlanning: () => void;
}

const DEFAULT_PARTNER_PROFILE: PartnerProfile = {
  foodDrinks: [],
  activities: [],
  outdoors: [],
  stayHome: [],
  personality: [],
  notFanOf: [],
  accessibility: [],
};

const PHILADELPHIA_VENDORS: VendorListing[] = [
  {
    id: 'v1',
    name: "Talula's Garden",
    category: 'Fine Dining',
    rating: 4.8,
    priceRange: '$$$',
    description:
      'Farm-to-table cuisine in a gorgeous garden setting in Washington Square. Perfect for romantic evenings.',
    bookingUrl: 'https://www.opentable.com/s/?term=Talula%27s+Garden&metroId=4',
    city: 'Philadelphia, PA',
    sponsored: true,
  },
  {
    id: 'v2',
    name: 'The Franklin Bar',
    category: 'Cocktail Bar',
    rating: 4.7,
    priceRange: '$$',
    description:
      'Underground cocktail lounge with inventive drinks and an intimate atmosphere. A Philly hidden gem.',
    bookingUrl: 'https://www.eventbrite.com/d/pa--philadelphia/franklin-bar/',
    city: 'Philadelphia, PA',
    sponsored: true,
  },
  {
    id: 'v3',
    name: 'PHS Pop Up Garden',
    category: 'Outdoor Events',
    rating: 4.6,
    priceRange: '$$',
    description:
      'Seasonal outdoor garden and bar featuring local vendors, live music, and vibrant community events.',
    bookingUrl: 'https://www.eventbrite.com/d/pa--philadelphia/phs-pop-up-garden/',
    city: 'Philadelphia, PA',
    sponsored: true,
  },
  {
    id: 'v4',
    name: "Bob & Barbara's",
    category: 'Live Music & Drinks',
    rating: 4.5,
    priceRange: '$',
    description:
      "South Philly's beloved dive bar with nightly live music, cheap drinks, and an iconic Philly vibe.",
    bookingUrl: 'https://www.eventbrite.com/d/pa--philadelphia/bob-barbaras/',
    city: 'Philadelphia, PA',
    sponsored: true,
  },
  {
    id: 'v5',
    name: 'Rittenhouse Spa',
    category: 'Wellness / Spa',
    rating: 4.9,
    priceRange: '$$$$',
    description:
      'Luxury spa treatments at the historic Rittenhouse Hotel. Couples packages available for the ultimate date night.',
    bookingUrl: 'https://www.rittenhousehotel.com/spa',
    city: 'Philadelphia, PA',
    sponsored: true,
  },
  {
    id: 'v6',
    name: 'Eastern State Penitentiary',
    category: 'Unique Experience',
    rating: 4.7,
    priceRange: '$$',
    description:
      'Historic prison turned museum with unique nighttime tours and seasonal events. Unforgettable date experience.',
    bookingUrl: 'https://www.easternstate.org',
    city: 'Philadelphia, PA',
    sponsored: true,
  },
];

export const useDateStore = create<DateStore>((set) => ({
  userName: '',
  userEmail: '',
  userCity: 'Philadelphia, PA',
  planningFor: 'couple',
  occasion: null,
  budget: 150,
  partnerProfile: DEFAULT_PARTNER_PROFILE,
  chatMessages: [],
  dateOptions: [],
  selectedDate: null,
  bookingTime: null,
  vendorListings: PHILADELPHIA_VENDORS,

  setUserName: (name) => set({ userName: name }),
  setUserEmail: (email) => set({ userEmail: email }),
  setPlanningFor: (type) => set({ planningFor: type }),
  setOccasion: (occasion) => set({ occasion }),
  setBudget: (budget) => set({ budget }),
  setPartnerProfile: (profile) =>
    set((state) => ({
      partnerProfile: { ...state.partnerProfile, ...profile },
    })),
  addChatMessage: (message) =>
    set((state) => ({ chatMessages: [...state.chatMessages, message] })),
  updateLastMessage: (content) =>
    set((state) => {
      const messages = [...state.chatMessages];
      if (messages.length > 0) {
        messages[messages.length - 1] = {
          ...messages[messages.length - 1],
          content,
        };
      }
      return { chatMessages: messages };
    }),
  clearChatMessages: () => set({ chatMessages: [] }),
  setDateOptions: (options) => set({ dateOptions: options }),
  setSelectedDate: (date) => set({ selectedDate: date }),
  setBookingTime: (time) => set({ bookingTime: time }),
  setVendorListings: (vendors) => set({ vendorListings: vendors }),
  resetPlanning: () =>
    set({
      planningFor: 'couple',
      occasion: null,
      budget: 150,
      chatMessages: [],
      dateOptions: [],
      selectedDate: null,
    }),
}));
