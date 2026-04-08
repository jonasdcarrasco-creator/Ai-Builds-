// ─── Datefully — Romantic Tips System ────────────────────────────────────────

export type TipGender = 'him' | 'her' | 'both';
export type TipScreen =
  | 'splash' | 'whosPlanning' | 'budget' | 'partnerProfile'
  | 'weatherChat' | 'dateOptions' | 'confirmation' | 'general';

export interface RomanticTip {
  id: string;
  screen: TipScreen;
  gender: TipGender;
  text: string;
}

export const ROMANTIC_TIPS: RomanticTip[] = [
  // Who's Planning
  { id: 'wp-him-1', screen: 'whosPlanning', gender: 'him', text: 'The best surprises have one clue. Tell her to dress up. Say nothing else.' },
  { id: 'wp-him-2', screen: 'whosPlanning', gender: 'him', text: 'She remembers everything. Plan something she mentioned once in passing.' },
  { id: 'wp-him-3', screen: 'whosPlanning', gender: 'him', text: 'The most romantic thing you can do is be fully present. No phone.' },
  { id: 'wp-her-1', screen: 'whosPlanning', gender: 'her', text: 'Let him plan. Trust the process. Show up with an open heart.' },
  { id: 'wp-her-2', screen: 'whosPlanning', gender: 'her', text: 'The best gift you can give him is your full, undivided attention tonight.' },
  { id: 'wp-her-3', screen: 'whosPlanning', gender: 'her', text: 'Tell him one thing you love about him before the night even begins.' },
  { id: 'wp-both-1', screen: 'whosPlanning', gender: 'both', text: 'Great dates are built on presence, not perfection.' },
  // Budget
  { id: 'bud-1', screen: 'budget', gender: 'both', text: 'The most romantic dates cost nothing. A walk, a sunset, your full attention.' },
  { id: 'bud-2', screen: 'budget', gender: 'him', text: "Don't overspend to impress. The thoughtfulness is what she'll remember." },
  { id: 'bud-3', screen: 'budget', gender: 'her', text: "It's never about how much was spent. It's about how much thought was given." },
  { id: 'bud-4', screen: 'budget', gender: 'both', text: 'A $20 picnic at the right spot beats a $200 dinner with the wrong energy.' },
  // Partner Profile
  { id: 'pp-1', screen: 'partnerProfile', gender: 'both', text: 'Remembering what she hates matters more than knowing what she loves.' },
  { id: 'pp-2', screen: 'partnerProfile', gender: 'him', text: 'The details you remember are the love language she never told you about.' },
  { id: 'pp-3', screen: 'partnerProfile', gender: 'her', text: "Fill this out as if you're showing off how well you know him. Because you do." },
  // Weather + AI Chat
  { id: 'chat-1', screen: 'weatherChat', gender: 'both', text: 'Ask one real question all night and actually listen. People fall in love with people who make them feel heard.' },
  { id: 'chat-2', screen: 'weatherChat', gender: 'him', text: "Ask her about the best meal she's ever had. Then take notes." },
  { id: 'chat-3', screen: 'weatherChat', gender: 'her', text: "Tell him one memory you have together that made you smile. Watch his face." },
  // Date Options
  { id: 'do-1', screen: 'dateOptions', gender: 'both', text: 'Put your phone away the entire night. That one decision will make you unforgettable.' },
  { id: 'do-2', screen: 'dateOptions', gender: 'him', text: 'Pick the option that makes you nervous. That means it matters.' },
  { id: 'do-3', screen: 'dateOptions', gender: 'her', text: 'Go with your gut. The best nights are rarely the safest choices.' },
  // Confirmation
  { id: 'conf-1', screen: 'confirmation', gender: 'him', text: 'Text her one hour before. Just say "I cannot wait to see you." Nothing else.' },
  { id: 'conf-2', screen: 'confirmation', gender: 'her', text: "Send him a voice note before the date. No words needed. Just a smile he can hear." },
  { id: 'conf-3', screen: 'confirmation', gender: 'both', text: 'The anticipation is half the date. Make it count.' },
  // General
  { id: 'gen-1', screen: 'general', gender: 'both', text: 'Be the person tonight that reminds them why they chose you.' },
  { id: 'gen-2', screen: 'general', gender: 'both', text: 'The best relationships are built on small, intentional moments. This is one of them.' },
];

export function getTip(screen: TipScreen, gender: TipGender = 'both'): RomanticTip | null {
  const candidates = ROMANTIC_TIPS.filter(
    (t) => t.screen === screen && (t.gender === gender || t.gender === 'both')
  );
  if (candidates.length === 0) {
    const fallback = ROMANTIC_TIPS.filter((t) => t.screen === 'general');
    return fallback[Math.floor(Math.random() * fallback.length)] || null;
  }
  const sessionSeed = Math.floor(Date.now() / (1000 * 60 * 30));
  return candidates[sessionSeed % candidates.length];
}

export function getPairedTip(screen: TipScreen, gender: TipGender): RomanticTip | null {
  const opposite: TipGender = gender === 'him' ? 'her' : gender === 'her' ? 'him' : 'both';
  const candidates = ROMANTIC_TIPS.filter((t) => t.screen === screen && t.gender === opposite);
  if (candidates.length === 0) return null;
  const sessionSeed = Math.floor(Date.now() / (1000 * 60 * 30));
  return candidates[sessionSeed % candidates.length];
}
