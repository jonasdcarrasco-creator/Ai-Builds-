import * as Location from 'expo-location';

export async function detectCity(): Promise<string> {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') return 'your city';

    const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
    const [geo] = await Location.reverseGeocodeAsync({
      latitude: loc.coords.latitude,
      longitude: loc.coords.longitude,
    });

    if (geo?.city && geo?.region) {
      const abbr = getStateAbbr(geo.region);
      return `${geo.city}, ${abbr}`;
    }
    return geo?.city ?? 'your city';
  } catch {
    return 'Philadelphia, PA';
  }
}

function getStateAbbr(state: string): string {
  const map: Record<string, string> = {
    'Pennsylvania': 'PA', 'New York': 'NY', 'California': 'CA',
    'Texas': 'TX', 'Florida': 'FL', 'Illinois': 'IL',
    'New Jersey': 'NJ', 'Georgia': 'GA', 'Ohio': 'OH',
    'North Carolina': 'NC', 'Michigan': 'MI', 'Virginia': 'VA',
    'Washington': 'WA', 'Arizona': 'AZ', 'Massachusetts': 'MA',
    'Maryland': 'MD', 'Colorado': 'CO', 'Tennessee': 'TN',
  };
  return map[state] ?? state.slice(0, 2).toUpperCase();
}
