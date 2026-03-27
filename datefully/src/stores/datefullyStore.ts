import { create } from 'zustand';

interface ChatMessage {
  id: string;
  role: 'ai' | 'user';
  text: string;
}

interface PartnerPrefs {
  food: string[];
  activities: string[];
  outdoors: string[];
  stayHome: string[];
  personality: string[];
  notAFan: string[];
  accessibility: string[];
}

interface DatefullyState {
  // Screen 2
  planner: string;
  occasion: string;
  // Screen 3
  budget: number;
  // Screen 4
  partnerPrefs: PartnerPrefs;
  // Screen 5
  chatMessages: ChatMessage[];
  // Screen 6
  selectedDateOption: number;
  // Screen 7
  selectedVendors: string[];
  vendorTotal: number;
  // Screen 8
  invitationSent: boolean;
  // Screen 9
  dateRating: number;
  // Actions
  setPlanner: (v: string) => void;
  setOccasion: (v: string) => void;
  setBudget: (v: number) => void;
  toggleFoodPref: (v: string) => void;
  toggleActivityPref: (v: string) => void;
  toggleOutdoorPref: (v: string) => void;
  toggleStayHomePref: (v: string) => void;
  togglePersonalityPref: (v: string) => void;
  toggleNotFanPref: (v: string) => void;
  toggleAccessibilityPref: (v: string) => void;
  addChatMessage: (msg: ChatMessage) => void;
  setSelectedDateOption: (v: number) => void;
  toggleVendor: (name: string, price: number) => void;
  setInvitationSent: (v: boolean) => void;
  setDateRating: (v: number) => void;
  reset: () => void;
}

const initialState = {
  planner: 'A Man',
  occasion: 'Anniversary',
  budget: 150,
  partnerPrefs: {
    food: [],
    activities: [],
    outdoors: [],
    stayHome: [],
    personality: [],
    notAFan: [],
    accessibility: [],
  },
  chatMessages: [],
  selectedDateOption: 0,
  selectedVendors: [],
  vendorTotal: 0,
  invitationSent: false,
  dateRating: 0,
};

const toggleArrayItem = (arr: string[], item: string): string[] => {
  return arr.includes(item) ? arr.filter((x) => x !== item) : [...arr, item];
};

export const useDatefullyStore = create<DatefullyState>((set) => ({
  ...initialState,

  setPlanner: (v) => set({ planner: v }),
  setOccasion: (v) => set({ occasion: v }),
  setBudget: (v) => set({ budget: v }),

  toggleFoodPref: (v) =>
    set((s) => ({
      partnerPrefs: {
        ...s.partnerPrefs,
        food: toggleArrayItem(s.partnerPrefs.food, v),
      },
    })),

  toggleActivityPref: (v) =>
    set((s) => ({
      partnerPrefs: {
        ...s.partnerPrefs,
        activities: toggleArrayItem(s.partnerPrefs.activities, v),
      },
    })),

  toggleOutdoorPref: (v) =>
    set((s) => ({
      partnerPrefs: {
        ...s.partnerPrefs,
        outdoors: toggleArrayItem(s.partnerPrefs.outdoors, v),
      },
    })),

  toggleStayHomePref: (v) =>
    set((s) => ({
      partnerPrefs: {
        ...s.partnerPrefs,
        stayHome: toggleArrayItem(s.partnerPrefs.stayHome, v),
      },
    })),

  togglePersonalityPref: (v) =>
    set((s) => ({
      partnerPrefs: {
        ...s.partnerPrefs,
        personality: toggleArrayItem(s.partnerPrefs.personality, v),
      },
    })),

  toggleNotFanPref: (v) =>
    set((s) => ({
      partnerPrefs: {
        ...s.partnerPrefs,
        notAFan: toggleArrayItem(s.partnerPrefs.notAFan, v),
      },
    })),

  toggleAccessibilityPref: (v) =>
    set((s) => ({
      partnerPrefs: {
        ...s.partnerPrefs,
        accessibility: toggleArrayItem(s.partnerPrefs.accessibility, v),
      },
    })),

  addChatMessage: (msg) =>
    set((s) => ({
      chatMessages: [...s.chatMessages, msg],
    })),

  setSelectedDateOption: (v) => set({ selectedDateOption: v }),

  toggleVendor: (name, price) =>
    set((s) => {
      const isSelected = s.selectedVendors.includes(name);
      const newVendors = isSelected
        ? s.selectedVendors.filter((v) => v !== name)
        : [...s.selectedVendors, name];
      const newTotal = isSelected
        ? s.vendorTotal - price
        : s.vendorTotal + price;
      return {
        selectedVendors: newVendors,
        vendorTotal: Math.max(0, newTotal),
      };
    }),

  setInvitationSent: (v) => set({ invitationSent: v }),
  setDateRating: (v) => set({ dateRating: v }),

  reset: () => set({ ...initialState }),
}));
