import { create } from 'zustand';
import { DateOption } from '../types';

interface DatePlannerState {
  // Screen 2 — Who's planning + Occasion
  plannerType: string | null;
  occasion: string | null;

  // Screen 3 — Budget
  budget: number;

  // Screen 4 — Partner profile
  loveChips: string[];
  dislikeChips: string[];
  vibeChips: string[];

  // Screen 5 → 6 — Selected date
  selectedDate: DateOption | null;

  // Actions
  setPlannerType: (type: string) => void;
  setOccasion: (occasion: string) => void;
  setBudget: (amount: number) => void;
  toggleLoveChip: (chip: string) => void;
  toggleDislikeChip: (chip: string) => void;
  toggleVibeChip: (chip: string) => void;
  setSelectedDate: (date: DateOption) => void;
  reset: () => void;
}

const defaultState = {
  plannerType: null,
  occasion: null,
  budget: 100,
  loveChips: [],
  dislikeChips: [],
  vibeChips: [],
  selectedDate: null,
};

export const useDatePlannerStore = create<DatePlannerState>((set) => ({
  ...defaultState,

  setPlannerType: (type) => set({ plannerType: type }),
  setOccasion: (occasion) => set({ occasion }),
  setBudget: (amount) => set({ budget: amount }),

  toggleLoveChip: (chip) =>
    set((state) => ({
      loveChips: state.loveChips.includes(chip)
        ? state.loveChips.filter((c) => c !== chip)
        : [...state.loveChips, chip],
    })),

  toggleDislikeChip: (chip) =>
    set((state) => ({
      dislikeChips: state.dislikeChips.includes(chip)
        ? state.dislikeChips.filter((c) => c !== chip)
        : [...state.dislikeChips, chip],
    })),

  toggleVibeChip: (chip) =>
    set((state) => ({
      vibeChips: state.vibeChips.includes(chip)
        ? state.vibeChips.filter((c) => c !== chip)
        : [...state.vibeChips, chip],
    })),

  setSelectedDate: (date) => set({ selectedDate: date }),

  reset: () => set(defaultState),
}));

// ─── Mock date ideas generator ────────────────────────────────────────────────

export const DATE_OPTIONS: DateOption[] = [
  {
    id: '1',
    name: 'Rooftop Candlelight Dinner',
    description:
      'An elevated evening under the stars. Savor a 5-course tasting menu on a private rooftop with city views and candlelit ambiance.',
    estimatedCost: 140,
    isPaid: true,
    category: 'Fine Dining',
    openTableUrl: 'https://www.opentable.com',
    emoji: '🕯️',
  },
  {
    id: '2',
    name: 'Sunset Picnic & Jazz',
    description:
      'Pack artisan cheeses, wine, and a cozy blanket. Catch a free outdoor jazz performance at the park while the sky turns gold.',
    estimatedCost: 35,
    isPaid: false,
    category: 'Outdoors',
    openTableUrl: null,
    emoji: '🌅',
  },
  {
    id: '3',
    name: 'Couples Spa & Wine Night',
    description:
      'Side-by-side massages followed by a private wine tasting in the spa lounge. Pure bliss, no phones allowed.',
    estimatedCost: 210,
    isPaid: true,
    category: 'Spa & Wellness',
    openTableUrl: null,
    emoji: '🍷',
  },
  {
    id: '4',
    name: 'Art Gallery Crawl',
    description:
      'Wander through 3 local galleries, sip complimentary champagne at openings, and pick your favorite piece to argue about.',
    estimatedCost: 20,
    isPaid: false,
    category: 'Art & Culture',
    openTableUrl: null,
    emoji: '🎨',
  },
  {
    id: '5',
    name: 'Private Chef Experience',
    description:
      'A personal chef comes to you. Watch, help, and enjoy a custom 4-course meal crafted around your favorite flavors.',
    estimatedCost: 180,
    isPaid: true,
    category: 'Fine Dining',
    openTableUrl: null,
    emoji: '👨‍🍳',
  },
  {
    id: '6',
    name: 'Cozy Movie Marathon',
    description:
      'Build the ultimate blanket fort, order your go-to takeout, and binge a trilogy together. Simple. Perfect.',
    estimatedCost: 30,
    isPaid: false,
    category: 'Cozy Nights',
    openTableUrl: null,
    emoji: '🎬',
  },
];

export function getDateOptionsForBudget(budget: number): DateOption[] {
  const eligible = DATE_OPTIONS.filter((d) => d.estimatedCost <= budget + 20);
  if (eligible.length >= 3) return eligible.slice(0, 3);
  // Pad with free options if budget is very low
  const free = DATE_OPTIONS.filter((d) => !d.isPaid);
  const combined = [...new Set([...eligible, ...free])].slice(0, 3);
  return combined.length > 0 ? combined : DATE_OPTIONS.slice(0, 3);
}
