import { create } from 'zustand';
import {
  CoupleType, TimeOfDay, Occasion, PartnerProfile,
  ChatMessage, DateOption, SelectedDate, VendorListing,
  WeatherData, UserCoords, SpecialOccasion,
} from '../types';

interface DateStore {
  // User
  userName: string;
  userEmail: string;
  userCity: string;
  userCoords: UserCoords | null;

  // Planning
  planningFor: CoupleType;
  occasion: Occasion | null;
  timeOfDay: TimeOfDay;
  budget: number;

  // Weather
  weatherData: WeatherData | null;

  // Partner
  partnerProfile: PartnerProfile;

  // Chat
  chatMessages: ChatMessage[];

  // Date options
  dateOptions: DateOption[];

  // Selected date
  selectedDate: SelectedDate | null;
  bookingTime: number | null;

  // Vendors
  vendorListings: VendorListing[];

  // Special occasions
  specialOccasions: SpecialOccasion[];

  // Actions
  setUserName: (name: string) => void;
  setUserEmail: (email: string) => void;
  setUserCity: (city: string) => void;
  setUserCoords: (coords: UserCoords) => void;
  setPlanningFor: (type: CoupleType) => void;
  setOccasion: (occasion: Occasion) => void;
  setTimeOfDay: (time: TimeOfDay) => void;
  setBudget: (budget: number) => void;
  setWeatherData: (data: WeatherData) => void;
  setPartnerProfile: (profile: Partial<PartnerProfile>) => void;
  addChatMessage: (message: ChatMessage) => void;
  updateLastMessage: (content: string) => void;
  clearChatMessages: () => void;
  setDateOptions: (options: DateOption[]) => void;
  setSelectedDate: (date: SelectedDate) => void;
  setBookingTime: (time: number) => void;
  setVendorListings: (vendors: VendorListing[]) => void;
  addSpecialOccasion: (occasion: SpecialOccasion) => void;
  removeSpecialOccasion: (id: string) => void;
  resetPlanning: () => void;
}

const DEFAULT_PARTNER_PROFILE: PartnerProfile = {
  dietaryNeeds: [],
  cuisinePreferences: [],
  activities: [],
  accessibility: [],
  personality: [],
  avoid: [],
};

const PHILLY_VENDORS: VendorListing[] = [
  {
    id: 'v1', name: "Talula's Garden", category: 'restaurant', city: 'Philadelphia, PA',
    dietaryTags: ['Vegan Friendly', 'Vegetarian', 'Gluten Free Options'],
    rating: 4.8, reviewCount: 1240, priceRange: '$$$', distance: '0.3 mi',
    parkingInfo: 'Street parking on Washington Sq, paid garage on 5th St',
    badges: ['Woman-Owned', 'LGBTQ+ Welcoming'],
    description: 'Farm-to-table cuisine in a gorgeous garden setting in Washington Square.',
    bookingUrl: "https://www.opentable.com/s/?term=Talula's+Garden&metroId=4",
    sponsored: true,
  },
  {
    id: 'v2', name: 'The Franklin Bar', category: 'experience', city: 'Philadelphia, PA',
    dietaryTags: ['Mocktails Available'],
    rating: 4.7, reviewCount: 876, priceRange: '$$', distance: '0.6 mi',
    parkingInfo: 'Metered street parking on 9th St',
    badges: ['LGBTQ+ Welcoming'],
    description: 'Underground cocktail lounge with inventive drinks and an intimate atmosphere.',
    bookingUrl: 'https://www.exploretock.com/franklinbar',
    sponsored: true,
  },
  {
    id: 'v3', name: 'PHS Pop Up Garden', category: 'experience', city: 'Philadelphia, PA',
    dietaryTags: ['Vegan Options', 'Halal Options'],
    rating: 4.6, reviewCount: 654, priceRange: '$$', distance: '0.8 mi',
    parkingInfo: 'Free parking on Broad St after 6pm',
    badges: ['Minority-Owned', 'LGBTQ+ Welcoming'],
    description: 'Seasonal outdoor garden featuring local vendors, live music, and vibrant community events.',
    bookingUrl: 'https://www.eventbrite.com/d/pa--philadelphia/phs-pop-up-garden/',
    sponsored: true,
  },
  {
    id: 'v4', name: "Bob & Barbara's", category: 'experience', city: 'Philadelphia, PA',
    dietaryTags: [],
    rating: 4.5, reviewCount: 2180, priceRange: '$', distance: '1.1 mi',
    parkingInfo: 'Street parking on South St',
    badges: ['LGBTQ+ Welcoming'],
    description: "South Philly's beloved dive bar with nightly live music and iconic Philly vibe.",
    bookingUrl: 'https://www.bobandbarbaras.com',
    sponsored: true,
  },
  {
    id: 'v5', name: 'Rittenhouse Spa', category: 'addon', city: 'Philadelphia, PA',
    dietaryTags: [],
    rating: 4.9, reviewCount: 430, priceRange: '$$$$', distance: '0.2 mi',
    parkingInfo: 'Valet parking available at the hotel',
    badges: ['Woman-Owned'],
    description: 'Luxury spa treatments at the historic Rittenhouse Hotel. Couples packages available.',
    bookingUrl: 'https://www.rittenhousehotel.com/spa',
    sponsored: true,
  },
  {
    id: 'v6', name: 'Eastern State Penitentiary', category: 'experience', city: 'Philadelphia, PA',
    dietaryTags: [],
    rating: 4.7, reviewCount: 3870, priceRange: '$$', distance: '1.4 mi',
    parkingInfo: 'Free lot on Fairmount Ave',
    badges: [],
    description: 'Historic prison turned museum with unique nighttime tours and seasonal events.',
    bookingUrl: 'https://www.easternstate.org',
    sponsored: true,
  },
];

export const useDateStore = create<DateStore>((set) => ({
  userName: '',
  userEmail: '',
  userCity: 'Philadelphia, PA',
  userCoords: null,
  planningFor: 'couple',
  occasion: null,
  timeOfDay: 'evening',
  budget: 150,
  weatherData: null,
  partnerProfile: DEFAULT_PARTNER_PROFILE,
  chatMessages: [],
  dateOptions: [],
  selectedDate: null,
  bookingTime: null,
  vendorListings: PHILLY_VENDORS,
  specialOccasions: [],

  setUserName: (name) => set({ userName: name }),
  setUserEmail: (email) => set({ userEmail: email }),
  setUserCity: (city) => set({ userCity: city }),
  setUserCoords: (coords) => set({ userCoords: coords }),
  setPlanningFor: (type) => set({ planningFor: type }),
  setOccasion: (occasion) => set({ occasion }),
  setTimeOfDay: (time) => set({ timeOfDay: time }),
  setBudget: (budget) => set({ budget }),
  setWeatherData: (data) => set({ weatherData: data }),
  setPartnerProfile: (profile) =>
    set((state) => ({ partnerProfile: { ...state.partnerProfile, ...profile } })),
  addChatMessage: (message) =>
    set((state) => ({ chatMessages: [...state.chatMessages, message] })),
  updateLastMessage: (content) =>
    set((state) => {
      const messages = [...state.chatMessages];
      if (messages.length > 0) messages[messages.length - 1] = { ...messages[messages.length - 1], content };
      return { chatMessages: messages };
    }),
  clearChatMessages: () => set({ chatMessages: [] }),
  setDateOptions: (options) => set({ dateOptions: options }),
  setSelectedDate: (date) => set({ selectedDate: date }),
  setBookingTime: (time) => set({ bookingTime: time }),
  setVendorListings: (vendors) => set({ vendorListings: vendors }),
  addSpecialOccasion: (occasion) =>
    set((state) => ({ specialOccasions: [...state.specialOccasions, occasion] })),
  removeSpecialOccasion: (id) =>
    set((state) => ({ specialOccasions: state.specialOccasions.filter((o) => o.id !== id) })),
  resetPlanning: () =>
    set({ planningFor: 'couple', occasion: null, timeOfDay: 'evening', chatMessages: [], dateOptions: [], selectedDate: null }),
}));
