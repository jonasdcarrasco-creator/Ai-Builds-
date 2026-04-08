// ─── Datefully — Weather Service (Open-Meteo, free, no API key) ──────────────

export interface WeatherData {
  city: string;
  temperature: number;   // Fahrenheit
  condition: string;     // 'clear' | 'cloudy' | 'rainy' | 'snowy' | 'windy'
  description: string;   // human-readable e.g. "Partly Cloudy, 72°F"
  isRainy: boolean;
  emoji: string;
  windSpeed: number;     // mph
  humidity: number;      // %
}

// WMO Weather code → condition mapping
function wmoToCondition(code: number): { condition: string; emoji: string; isRainy: boolean } {
  if (code === 0) return { condition: 'clear', emoji: '☀️', isRainy: false };
  if (code <= 2) return { condition: 'clear', emoji: '🌤️', isRainy: false };
  if (code === 3) return { condition: 'cloudy', emoji: '☁️', isRainy: false };
  if (code <= 49) return { condition: 'foggy', emoji: '🌫️', isRainy: false };
  if (code <= 57) return { condition: 'rainy', emoji: '🌧️', isRainy: true };  // drizzle
  if (code <= 67) return { condition: 'rainy', emoji: '🌧️', isRainy: true };  // rain
  if (code <= 77) return { condition: 'snowy', emoji: '❄️', isRainy: false }; // snow
  if (code <= 82) return { condition: 'rainy', emoji: '🌧️', isRainy: true };  // showers
  if (code <= 86) return { condition: 'snowy', emoji: '🌨️', isRainy: false }; // snow showers
  if (code <= 99) return { condition: 'stormy', emoji: '⛈️', isRainy: true }; // thunderstorm
  return { condition: 'cloudy', emoji: '☁️', isRainy: false };
}

function celsiusToF(c: number): number {
  return Math.round((c * 9) / 5 + 32);
}

function msToMph(ms: number): number {
  return Math.round(ms * 2.237);
}

export async function fetchWeather(
  lat: number,
  lon: number,
  cityName: string
): Promise<WeatherData> {
  const url =
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
    `&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code` +
    `&temperature_unit=celsius&wind_speed_unit=ms&forecast_days=1`;

  const response = await fetch(url);
  if (!response.ok) throw new Error(`Weather fetch failed: ${response.status}`);
  const data = await response.json();

  const current = data.current;
  const code: number = current.weather_code;
  const tempF = celsiusToF(current.temperature_2m);
  const windMph = msToMph(current.wind_speed_10m);
  const humidity: number = current.relative_humidity_2m;

  const { condition, emoji, isRainy } = wmoToCondition(code);

  let description = `${emoji} ${tempF}°F`;
  if (isRainy) description += ' · Rain — switching to indoor plans';
  else if (condition === 'snowy') description += ' · Snow in the forecast';
  else if (condition === 'clear') description += ' · Perfect evening ahead';
  else if (condition === 'cloudy') description += ' · Overcast but cozy';

  return {
    city: cityName,
    temperature: tempF,
    condition,
    description,
    isRainy,
    emoji,
    windSpeed: windMph,
    humidity,
  };
}

// Fallback weather for when location not available
export function getDefaultWeather(city: string): WeatherData {
  return {
    city,
    temperature: 68,
    condition: 'clear',
    description: '☀️ 68°F · Perfect evening ahead',
    isRainy: false,
    emoji: '☀️',
    windSpeed: 5,
    humidity: 50,
  };
}
