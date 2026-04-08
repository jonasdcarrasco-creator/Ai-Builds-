// ─── Screen 7 — City / Location Picker ───────────────────────────────────────
import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  FlatList, ActivityIndicator, Animated, Platform,
} from 'react-native';
import * as Location from 'expo-location';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import ScreenContainer from '../components/common/ScreenContainer';
import { Colors, Typography } from '../constants/theme';
import { useDateStore } from '../store/dateStore';

// Local aliases
const Fonts = { heading: Typography.heading };
const C = {
  text: Colors.textPrimary,
  muted: Colors.textMuted,
  surface: Colors.card,
  border: Colors.cardBorder,
  gold: Colors.gold,
  bg: Colors.background,
  error: Colors.error,
};

type Nav = NativeStackNavigationProp<RootStackParamList, 'CityPicker'>;

// ─── City data ───────────────────────────────────────────────────────────────
interface CityEntry {
  name: string;
  state: string;
  status: 'live' | 'coming_soon';
  emoji: string;
  defaultLat: number;
  defaultLon: number;
}

const CITIES: CityEntry[] = [
  { name: 'Philadelphia', state: 'PA', status: 'live', emoji: '🔔', defaultLat: 39.9526, defaultLon: -75.1652 },
  { name: 'New York', state: 'NY', status: 'coming_soon', emoji: '🗽', defaultLat: 40.7128, defaultLon: -74.006 },
  { name: 'Washington', state: 'DC', status: 'coming_soon', emoji: '🏛️', defaultLat: 38.9072, defaultLon: -77.0369 },
  { name: 'Chicago', state: 'IL', status: 'coming_soon', emoji: '🏙️', defaultLat: 41.8781, defaultLon: -87.6298 },
  { name: 'Atlanta', state: 'GA', status: 'coming_soon', emoji: '🍑', defaultLat: 33.749, defaultLon: -84.388 },
  { name: 'Houston', state: 'TX', status: 'coming_soon', emoji: '🌵', defaultLat: 29.7604, defaultLon: -95.3698 },
  { name: 'Los Angeles', state: 'CA', status: 'coming_soon', emoji: '🎬', defaultLat: 34.0522, defaultLon: -118.2437 },
  { name: 'Miami', state: 'FL', status: 'coming_soon', emoji: '🌴', defaultLat: 25.7617, defaultLon: -80.1918 },
];

export default function CityPickerScreen() {
  const navigation = useNavigation<Nav>();
  const { setUserCity, setUserCoords } = useDateStore();

  const [search, setSearch] = useState('');
  const [locating, setLocating] = useState(false);
  const [locError, setLocError] = useState('');
  const glowAnim = useRef(new Animated.Value(0)).current;

  const filtered = CITIES.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.state.toLowerCase().includes(search.toLowerCase()),
  );

  // ── GPS detect ──────────────────────────────────────────────────────────
  async function handleGPS() {
    setLocating(true);
    setLocError('');
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLocError('Location permission denied. Please pick a city below.');
        setLocating(false);
        return;
      }
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const { latitude: lat, longitude: lon } = loc.coords;
      setUserCoords({ lat, lon });

      // Reverse geocode to get city
      const [geo] = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lon });
      const city = geo?.city || geo?.subregion || 'your city';
      const region = geo?.region || '';
      const cityLabel = region ? `${city}, ${region}` : city;
      setUserCity(cityLabel);

      pulseGlow();
      setTimeout(() => navigation.replace('WhosPlanning'), 600);
    } catch {
      setLocError('Could not detect location. Choose a city below.');
    } finally {
      setLocating(false);
    }
  }

  function pulseGlow() {
    Animated.sequence([
      Animated.timing(glowAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.timing(glowAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start();
  }

  function selectCity(city: CityEntry) {
    if (city.status === 'coming_soon') return;
    setUserCity(`${city.name}, ${city.state}`);
    setUserCoords({ lat: city.defaultLat, lon: city.defaultLon });
    navigation.replace('WhosPlanning');
  }

  const glowOpacity = glowAnim.interpolate({ inputRange: [0, 1], outputRange: [0.3, 1] });

  return (
    <ScreenContainer>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Where are you{'\n'}planning your date?</Text>
        <Text style={styles.subtitle}>We'll find the best spots near you.</Text>
      </View>

      {/* GPS button */}
      <Animated.View style={[styles.gpsCard, { opacity: locating ? glowOpacity : 1 }]}>
        <TouchableOpacity style={styles.gpsBtn} onPress={handleGPS} disabled={locating} activeOpacity={0.8}>
          {locating ? (
            <ActivityIndicator color={Colors.background} size="small" />
          ) : (
            <Text style={styles.gpsIcon}>📍</Text>
          )}
          <View>
            <Text style={styles.gpsPrimary}>Use my current location</Text>
            <Text style={styles.gpsSecondary}>Auto-detect via GPS</Text>
          </View>
        </TouchableOpacity>
      </Animated.View>

      {locError ? <Text style={styles.locError}>{locError}</Text> : null}

      {/* Divider */}
      <View style={styles.dividerRow}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>or choose a city</Text>
        <View style={styles.dividerLine} />
      </View>

      {/* Search */}
      <View style={styles.searchRow}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search city..."
          placeholderTextColor={C.muted}
          value={search}
          onChangeText={setSearch}
          autoCorrect={false}
          returnKeyType="search"
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Text style={styles.clearBtn}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* City list */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.name}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.cityRow, item.status === 'coming_soon' && styles.cityRowDim]}
            onPress={() => selectCity(item)}
            activeOpacity={item.status === 'live' ? 0.75 : 1}
            disabled={item.status === 'coming_soon'}
          >
            <Text style={styles.cityEmoji}>{item.emoji}</Text>
            <View style={styles.cityInfo}>
              <Text style={[styles.cityName, item.status === 'coming_soon' && styles.cityNameDim]}>
                {item.name}, {item.state}
              </Text>
              {item.status === 'coming_soon' && (
                <Text style={styles.comingSoon}>Coming soon</Text>
              )}
            </View>
            {item.status === 'live' ? (
              <View style={styles.liveBadge}>
                <Text style={styles.liveBadgeText}>LIVE</Text>
              </View>
            ) : (
              <Text style={styles.chevron}>›</Text>
            )}
          </TouchableOpacity>
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />

      {/* Footer note */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Want your city next?{' '}
          <Text style={styles.footerLink}>Request it →</Text>
        </Text>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 16,
  },
  title: {
    fontFamily: Fonts.heading,
    fontSize: 30,
    color: C.text,
    lineHeight: 38,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: C.muted,
  },

  // GPS
  gpsCard: {
    marginHorizontal: 24,
    marginBottom: 8,
    borderRadius: 14,
    backgroundColor: Colors.gold,
    overflow: 'hidden',
  },
  gpsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 20,
    paddingVertical: 18,
  },
  gpsIcon: { fontSize: 26 },
  gpsPrimary: {
    fontFamily: Fonts.heading,
    fontSize: 16,
    color: Colors.background,
  },
  gpsSecondary: {
    fontSize: 12,
    color: Colors.background,
    opacity: 0.7,
    marginTop: 2,
  },
  locError: {
    marginHorizontal: 24,
    marginTop: 6,
    fontSize: 13,
    color: Colors.error,
    textAlign: 'center',
  },

  // Divider
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 24,
    marginVertical: 16,
    gap: 10,
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: C.border },
  dividerText: { fontSize: 13, color: C.muted },

  // Search
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 24,
    marginBottom: 12,
    backgroundColor: C.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: C.border,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === 'ios' ? 12 : 8,
  },
  searchIcon: { fontSize: 16, marginRight: 8 },
  searchInput: {
    flex: 1,
    color: C.text,
    fontSize: 15,
    padding: 0,
  },
  clearBtn: { fontSize: 16, color: C.muted, paddingLeft: 8 },

  // List
  listContent: { paddingHorizontal: 24, paddingBottom: 16 },
  cityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    gap: 14,
  },
  cityRowDim: { opacity: 0.45 },
  cityEmoji: { fontSize: 24, width: 32, textAlign: 'center' },
  cityInfo: { flex: 1 },
  cityName: {
    fontSize: 16,
    color: C.text,
    fontWeight: '600',
  },
  cityNameDim: { color: C.muted },
  comingSoon: {
    fontSize: 12,
    color: C.muted,
    marginTop: 2,
  },
  liveBadge: {
    backgroundColor: Colors.gold,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  liveBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.background,
    letterSpacing: 0.5,
  },
  chevron: { fontSize: 20, color: C.border },
  separator: { height: 1, backgroundColor: C.border },

  // Footer
  footer: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  footerText: { fontSize: 13, color: C.muted },
  footerLink: { color: Colors.gold },
});
