import Anthropic from '@anthropic-ai/sdk';
import { ChatMessage, DateOption, PartnerProfile } from '../types';

const client = new Anthropic({
  apiKey: process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY || '',
});

const MODEL = 'claude-sonnet-4-6';

function buildSystemPrompt(
  userName: string,
  budget: number,
  partnerProfile: PartnerProfile
): string {
  const prefs = [
    partnerProfile.foodDrinks.length > 0 ? `Food & Drinks: ${partnerProfile.foodDrinks.join(', ')}` : '',
    partnerProfile.activities.length > 0 ? `Activities: ${partnerProfile.activities.join(', ')}` : '',
    partnerProfile.outdoors.length > 0 ? `Outdoors: ${partnerProfile.outdoors.join(', ')}` : '',
    partnerProfile.stayHome.length > 0 ? `Stay Home: ${partnerProfile.stayHome.join(', ')}` : '',
    partnerProfile.personality.length > 0 ? `Personality: ${partnerProfile.personality.join(', ')}` : '',
    partnerProfile.notFanOf.length > 0 ? `Not a fan of: ${partnerProfile.notFanOf.join(', ')}` : '',
    partnerProfile.accessibility.length > 0 ? `Accessibility needs: ${partnerProfile.accessibility.join(', ')}` : '',
  ]
    .filter(Boolean)
    .join('\n');

  return `You are Datefully's AI date concierge for ${userName || 'there'} in Philadelphia, PA.
Their budget is $${budget}. Their partner's preferences:
${prefs || 'No specific preferences set yet.'}

Your job is to suggest romantic, fun, memorable date experiences in Philadelphia.
Be warm, personal, and enthusiastic. Keep responses concise (2-3 sentences max unless planning).
When asked to plan a date, provide specific Philadelphia venue names.
Always stay within the stated budget. Reference the partner's preferences naturally.`;
}

// Streaming chat function
export async function streamChatMessage(
  messages: ChatMessage[],
  userName: string,
  budget: number,
  partnerProfile: PartnerProfile,
  onChunk: (chunk: string) => void,
  onComplete: (fullText: string) => void,
  onError: (error: Error) => void
): Promise<void> {
  try {
    const systemPrompt = buildSystemPrompt(userName, budget, partnerProfile);

    const formattedMessages = messages.map((m) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    }));

    const stream = await client.messages.stream({
      model: MODEL,
      max_tokens: 1024,
      system: systemPrompt,
      messages: formattedMessages,
    });

    let fullText = '';
    for await (const chunk of stream) {
      if (
        chunk.type === 'content_block_delta' &&
        chunk.delta.type === 'text_delta'
      ) {
        fullText += chunk.delta.text;
        onChunk(chunk.delta.text);
      }
    }
    onComplete(fullText);
  } catch (err) {
    onError(err instanceof Error ? err : new Error('Unknown error'));
  }
}

// Generate 3 date plan options
export async function generateDateOptions(
  userName: string,
  budget: number,
  occasion: string,
  coupleType: string,
  partnerProfile: PartnerProfile
): Promise<DateOption[]> {
  const systemPrompt = buildSystemPrompt(userName, budget, partnerProfile);

  const prompt = `Generate exactly 3 date plan options for a ${coupleType} in Philadelphia, PA with a $${budget} budget for a ${occasion} occasion.

Return a valid JSON array with exactly 3 objects. Each object must have:
- id: unique string like "opt1", "opt2", "opt3"
- type: one of "best_match", "chill", "splurge"
- typeLabel: "Best Match" | "Chill Vibes" | "Splurge"
- typeEmoji: "⭐" | "😌" | "💎"
- title: creative date name (string)
- venues: array of 2-3 specific Philadelphia venue names (strings)
- estimatedCost: cost range like "$80–$120" (string)
- description: 1-2 sentence description (string)
- dressCode: "Casual" | "Smart Casual" | "Formal" (string)

Option 1 type must be "best_match" (aligns best with partner preferences)
Option 2 type must be "chill" (relaxed, low-key)
Option 3 type must be "splurge" (elevated/luxury, can exceed budget slightly)

IMPORTANT: Return ONLY the raw JSON array, no markdown, no code blocks, no explanation.`;

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 1500,
    system: systemPrompt,
    messages: [{ role: 'user', content: prompt }],
  });

  const text = response.content[0].type === 'text' ? response.content[0].text : '';

  // Strip any possible markdown code fences
  const cleaned = text.replace(/```json?\n?/g, '').replace(/```/g, '').trim();

  try {
    const parsed = JSON.parse(cleaned);
    return parsed as DateOption[];
  } catch {
    // Fallback options if parsing fails
    return getFallbackDateOptions(budget, occasion);
  }
}

function getFallbackDateOptions(budget: number, occasion: string): DateOption[] {
  return [
    {
      id: 'opt1',
      type: 'best_match',
      typeLabel: 'Best Match',
      typeEmoji: '⭐',
      title: 'Rittenhouse Romance',
      venues: ['Parc Brasserie', 'Rittenhouse Square', 'Franklin Fountain'],
      estimatedCost: `$${Math.round(budget * 0.8)}–$${budget}`,
      description:
        `A perfect ${occasion} evening starting with French bistro classics at Parc, ` +
        'a romantic stroll through Rittenhouse Square, then artisan ice cream to finish.',
      dressCode: 'Smart Casual',
    },
    {
      id: 'opt2',
      type: 'chill',
      typeLabel: 'Chill Vibes',
      typeEmoji: '😌',
      title: 'East Passyunk Hangout',
      venues: ['Garage Philadelphia', "Geno's Steaks", 'The Sidecar Bar'],
      estimatedCost: `$${Math.round(budget * 0.4)}–$${Math.round(budget * 0.6)}`,
      description:
        'A laid-back evening exploring the vibrant East Passyunk corridor — craft burgers, ' +
        'Philly staples, and a cozy neighborhood bar.',
      dressCode: 'Casual',
    },
    {
      id: 'opt3',
      type: 'splurge',
      typeLabel: 'Splurge',
      typeEmoji: '💎',
      title: 'Old City Luxury Night',
      venues: ['Zahav', 'Philadelphia Museum of Art', 'Ranstead Room'],
      estimatedCost: `$${Math.round(budget * 1.2)}–$${Math.round(budget * 1.5)}`,
      description:
        'An elevated experience beginning at the world-renowned Zahav for Israeli fine dining, ' +
        'followed by drinks at a hidden speakeasy in Old City.',
      dressCode: 'Formal',
    },
  ];
}
