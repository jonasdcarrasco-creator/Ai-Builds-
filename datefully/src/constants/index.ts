export * from './colors';
export * from './typography';
export * from './spacing';

export const APP_NAME = 'Datefully';
export const APP_TAGLINE = 'Plan. Connect. Remember.';

export const DATE_CATEGORIES = [
  { id: 'romantic', label: 'Romantic', emoji: '💕', color: '#FF6B9D' },
  { id: 'adventure', label: 'Adventure', emoji: '🏔️', color: '#E67E22' },
  { id: 'foodie', label: 'Foodie', emoji: '🍽️', color: '#E74C3C' },
  { id: 'cultural', label: 'Cultural', emoji: '🎭', color: '#9B59B6' },
  { id: 'outdoor', label: 'Outdoor', emoji: '🌿', color: '#27AE60' },
  { id: 'nightlife', label: 'Night Out', emoji: '🌙', color: '#2C3E50' },
  { id: 'cozy', label: 'Stay In', emoji: '🏠', color: '#E91E63' },
  { id: 'active', label: 'Active', emoji: '🏋️', color: '#1ABC9C' },
];

export const MOOD_OPTIONS = [
  { id: 'spontaneous', label: 'Spontaneous', emoji: '⚡' },
  { id: 'planned', label: 'Planned', emoji: '📅' },
  { id: 'budget', label: 'Budget Friendly', emoji: '💰' },
  { id: 'luxury', label: 'Luxury', emoji: '✨' },
  { id: 'outdoor', label: 'Outdoor', emoji: '🌤️' },
  { id: 'indoor', label: 'Indoor', emoji: '🏠' },
];

export const BUDGET_RANGES = [
  { id: 'free', label: 'Free', range: '$0', icon: '🆓' },
  { id: 'budget', label: 'Budget', range: '$10–$30', icon: '💵' },
  { id: 'moderate', label: 'Moderate', range: '$30–$75', icon: '💳' },
  { id: 'upscale', label: 'Upscale', range: '$75–$150', icon: '💎' },
  { id: 'luxury', label: 'Luxury', range: '$150+', icon: '👑' },
];

export const RELATIONSHIP_TYPES = [
  { id: 'single', label: 'Flying Solo', emoji: '🦋' },
  { id: 'dating', label: 'Dating', emoji: '💑' },
  { id: 'married', label: 'Married', emoji: '💍' },
  { id: 'friends', label: 'Friends', emoji: '👫' },
];
