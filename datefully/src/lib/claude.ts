import Anthropic from '@anthropic-ai/sdk';
import { ChatMessage, DateOption, DateStop, PartnerProfile, WeatherData, TimeOfDay } from '../types';

const client = new Anthropic({ apiKey: process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY || '' });
const MODEL = 'claude-sonnet-4-6';

function timeOfDayLabel(t: TimeOfDay): string {
  const map = { morning: 'Morning (6am-12pm)', afternoon: 'Afternoon (12-5pm)', evening: 'Evening (5-10pm)', late_night: 'Late Night (10pm+)' };
  return map[t];
}

function buildSystemPrompt(
  userName: string, city: string, budget: number, timeOfDay: TimeOfDay,
  partnerProfile: PartnerProfile, weather: WeatherData | null
): string {
  const dietaryHardFilters = partnerProfile.dietaryNeeds?.length
    ? `DIETARY HARD FILTERS (only suggest venues that accommodate): ${partnerProfile.dietaryNeeds.join(', ')}`
    : 'No dietary restrictions.';
  const cuisinePrefs = partnerProfile.cuisinePreferences?.length
    ? `Cuisine preferences: ${partnerProfile.cuisinePreferences.join(', ')}`
    : '';
  const activities = partnerProfile.activities?.length
    ? `Activities they enjoy: ${partnerProfile.activities.join(', ')}`
    : '';
  const accessibility = partnerProfile.accessibility?.length
    ? `Accessibility needs: ${partnerProfile.accessibility.join(', ')}`
    : '';
  const avoid = partnerProfile.avoid?.length
    ? `Must avoid: ${partnerProfile.avoid.join(', ')}`
    : '';
  const weatherNote = weather
    ? `Current weather: ${weather.description}. ${weather.isRainy ? 'IMPORTANT: Rain detected — swap any outdoor plans for indoor alternatives.' : ''}`
    : '';

  return `You are Datefully's AI date concierge for ${userName || 'a couple'} in ${city}.
Budget: $${budget} total.
Time of day: ${timeOfDayLabel(timeOfDay)}.
${dietaryHardFilters}
${cuisinePrefs}
${activities}
${accessibility}
${avoid}
${weatherNote}

Plan dates with a clear START → MIDDLE → END arc. Use real ${city} venue names.
Be warm, concise (2-3 sentences max unless planning). Never suggest venues that conflict with dietary hard filters.
When asked for a full plan, structure it as three distinct stops.`;
}

export async function streamChatMessage(
  messages: ChatMessage[], userName: string, city: string, budget: number,
  timeOfDay: TimeOfDay, partnerProfile: PartnerProfile, weather: WeatherData | null,
  onChunk: (chunk: string) => void,
  onComplete: (fullText: string) => void,
  onError: (error: Error) => void
): Promise<void> {
  try {
    const system = buildSystemPrompt(userName, city, budget, timeOfDay, partnerProfile, weather);
    const formatted = messages.map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content }));
    const stream = await client.messages.stream({ model: MODEL, max_tokens: 1024, system, messages: formatted });
    let full = '';
    for await (const chunk of stream) {
      if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
        full += chunk.delta.text;
        onChunk(chunk.delta.text);
      }
    }
    onComplete(full);
  } catch (err) {
    onError(err instanceof Error ? err : new Error('Unknown error'));
  }
}

export async function generateDateOptions(
  userName: string, city: string, budget: number, timeOfDay: TimeOfDay,
  occasion: string, coupleType: string, partnerProfile: PartnerProfile, weather: WeatherData | null
): Promise<DateOption[]> {
  const system = buildSystemPrompt(userName, city, budget, timeOfDay, partnerProfile, weather);
  const dietaryNote = partnerProfile.dietaryNeeds?.length
    ? `HARD FILTER: All venues must accommodate ${partnerProfile.dietaryNeeds.join(', ')}.`
    : '';

  const prompt = `Generate exactly 3 date plan options for a ${coupleType} in ${city}, $${budget} budget, ${occasion} occasion, ${timeOfDayLabel(timeOfDay)}.
${dietaryNote}
${weather?.isRainy ? 'Rain is happening — ALL stops must be indoors.' : ''}

Return ONLY a valid JSON array with exactly 3 objects. Each object:
- id: "opt1"|"opt2"|"opt3"
- type: "best_match"|"chill"|"splurge"
- typeLabel: "Best Match"|"Chill Vibes"|"Splurge"
- typeEmoji: "⭐"|"😌"|"💎"
- title: creative date name
- stops: array of 3 objects with:
    - label: "START"|"MIDDLE"|"END"
    - venueName: real ${city} venue name
    - venueType: e.g. "Restaurant", "Bar", "Park"
    - estimatedCost: "$XX–$XX per person"
    - duration: "1.5 hrs"
    - time: "7:00 PM"
    - dietaryVerified: null or "Halal Verified" or "Vegan Friendly"
    - rating: 4.2 (number)
    - reviewCount: 340 (number)
- venues: flat array of venue names (from stops)
- estimatedCost: total range string
- totalCost: numeric midpoint
- description: 1-2 sentences
- dressCode: "Casual"|"Smart Casual"|"Formal"
- dietaryBadge: null or "Halal Verified" or "Vegan Friendly"

Option 1 type = "best_match", Option 2 = "chill", Option 3 = "splurge".
Return ONLY the raw JSON array.`;

  const response = await client.messages.create({ model: MODEL, max_tokens: 2000, system, messages: [{ role: 'user', content: prompt }] });
  const text = response.content[0].type === 'text' ? response.content[0].text : '';
  const cleaned = text.replace(/```json?\n?/g, '').replace(/```/g, '').trim();

  try {
    return JSON.parse(cleaned) as DateOption[];
  } catch {
    return getFallbackOptions(budget, occasion, city, partnerProfile.dietaryNeeds);
  }
}

function getFallbackOptions(budget: number, occasion: string, city: string, dietaryNeeds: string[]): DateOption[] {
  const halal = dietaryNeeds.includes('Halal');
  const vegan = dietaryNeeds.includes('Vegan');
  const badge = halal ? 'Halal Verified' : vegan ? 'Vegan Friendly' : null;

  const makeStop = (label: 'START' | 'MIDDLE' | 'END', venue: string, type: string, cost: string, time: string): DateStop => ({
    label, venueName: venue, venueType: type, estimatedCost: cost, duration: '1.5 hrs', time, dietaryVerified: badge, rating: 4.5, reviewCount: 300,
  });

  return [
    {
      id: 'opt1', type: 'best_match', typeLabel: 'Best Match', typeEmoji: '⭐',
      title: 'Rittenhouse Romance',
      stops: [
        makeStop('START', 'Parc Brasserie', 'Restaurant', `$${Math.round(budget * 0.4)}–$${Math.round(budget * 0.5)}`, '6:30 PM'),
        makeStop('MIDDLE', 'Rittenhouse Square', 'Park', '$0', '8:00 PM'),
        makeStop('END', 'Franklin Fountain', 'Dessert', '$15–$25', '9:30 PM'),
      ],
      venues: ['Parc Brasserie', 'Rittenhouse Square', 'Franklin Fountain'],
      estimatedCost: `$${Math.round(budget * 0.8)}–$${budget}`, totalCost: budget, description: `A perfect ${occasion} evening through the heart of Philadelphia.`, dressCode: 'Smart Casual', dietaryBadge: badge,
    },
    {
      id: 'opt2', type: 'chill', typeLabel: 'Chill Vibes', typeEmoji: '😌',
      title: 'East Passyunk Stroll',
      stops: [
        makeStop('START', "Geno's Steaks", 'Casual Dining', '$15–$25', '6:00 PM'),
        makeStop('MIDDLE', 'Garage Philadelphia', 'Bar & Games', '$20–$40', '7:30 PM'),
        makeStop('END', 'The Sidecar Bar', 'Cocktail Bar', '$15–$30', '9:00 PM'),
      ],
      venues: ["Geno's Steaks", 'Garage Philadelphia', 'The Sidecar Bar'],
      estimatedCost: `$${Math.round(budget * 0.4)}–$${Math.round(budget * 0.6)}`, totalCost: Math.round(budget * 0.5), description: 'Laid-back evening on one of Philly\'s most vibrant corridors.', dressCode: 'Casual', dietaryBadge: badge,
    },
    {
      id: 'opt3', type: 'splurge', typeLabel: 'Splurge', typeEmoji: '💎',
      title: 'Old City Luxury',
      stops: [
        makeStop('START', 'Zahav', 'Fine Dining', `$${Math.round(budget * 0.6)}–$${Math.round(budget * 0.8)}`, '7:00 PM'),
        makeStop('MIDDLE', 'Philadelphia Museum of Art Steps', 'Landmark', '$0', '9:00 PM'),
        makeStop('END', 'Ranstead Room', 'Speakeasy Bar', '$30–$50', '10:00 PM'),
      ],
      venues: ['Zahav', 'Philadelphia Museum of Art Steps', 'Ranstead Room'],
      estimatedCost: `$${Math.round(budget * 1.2)}–$${Math.round(budget * 1.5)}`, totalCost: Math.round(budget * 1.3), description: 'An elevated experience starting at Philly\'s most acclaimed restaurant.', dressCode: 'Formal', dietaryBadge: badge,
    },
  ];
}
