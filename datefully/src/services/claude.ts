const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages';
const API_KEY = process.env.EXPO_PUBLIC_CLAUDE_API_KEY || 'DATEFULLY_API_KEY';

export interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ClaudeOptions {
  city: string;
  budget: string | number;
  likes: string[];
  dislikes: string[];
  messages: Message[];
}

export async function askClaude(opts: ClaudeOptions): Promise<string> {
  const system = `You are Datefully AI, a friendly date planning assistant. You know the user is in ${opts.city} with a budget of $${opts.budget}. Their partner loves ${opts.likes.join(', ') || 'a good time'} and is not a fan of ${opts.dislikes.join(', ') || 'nothing in particular'}. Suggest complete dates with real local venue names, estimated costs, and transportation. Keep responses warm, fun, and under 80 words. Always end by asking if they want to book it.`;

  const response = await fetch(CLAUDE_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      system,
      messages: opts.messages,
    }),
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  const data = await response.json();
  return data.content?.[0]?.text ?? "Hmm, I lost my train of thought. Try again? 💕";
}
