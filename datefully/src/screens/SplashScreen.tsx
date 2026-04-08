import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Dimensions } from 'react-native';
import * as Location from 'expo-location';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { useDateStore } from '../store';
import { Colors, Typography, Spacing, BorderRadius } from '../constants/theme';
import ScreenContainer from '../components/common/ScreenContainer';

const { width } = Dimensions.get('window');

type Props = { navigation: NativeStackNavigationProp<RootStackParamList, 'Splash'> };

const INCLUSIVE_BADGES = [
  { emoji: '🌱', label: 'Vegan Friendly' },
  { emoji: '🌙', label: 'Halal Options' },
  { emoji: '♿', label: 'Accessible' },
];

export default function SplashScreen({ navigation }: Props) {
  const { setUserCity, setUserCoords } = useDateStore();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;
  const badgeFade = useRef(new Animated.Value(0)).current;
  const [city, setCity] = useState('Philadelphia, PA');

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 900, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: 0, duration: 800, useNativeDriver: true }),
      ]),
      Animated.timing(badgeFade, { toValue: 1, duration: 600, useNativeDriver: true }),
    ]).start();

    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
          setUserCoords({ lat: loc.coords.latitude, lon: loc.coords.longitude });
          const [geo] = await Location.reverseGeocodeAsync(loc.coords);
          if (geo?.city) {
            const detected = geo.region ? `${geo.city}, ${geo.region}` : geo.city;
            setCity(detected);
            setUserCity(detected);
          }
        }
      } catch { /* default city stays */ }
    })();
  }, []);

  return (
    <ScreenContainer>
      {/* Beta badge */}
      <View style={styles.betaBadge}>
        <Text style={styles.betaText}>Beta · Invite Only</Text>
      </View>

      {/* Center content */}
      <Animated.View style={[styles.center, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
        <View style={styles.logoWrap}>
          <Text style={styles.logo}>Datefully</Text>
          <View style={styles.logoLine} />
        </View>

        <Text style={styles.tagline}>
          The only app that plans your entire date,{'\n'}
          from budget to transportation,{'\n'}
          so you can focus on the moment.
        </Text>

        <TouchableOpacity
          style={styles.cityRow}
          onPress={() => navigation.navigate('CityPicker')}
          activeOpacity={0.8}
        >
          <Text style={styles.cityPin}>📍</Text>
          <Text style={styles.cityText}>{city}</Text>
          <Text style={styles.cityChevron}>›</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Inclusive badges */}
      <Animated.View style={[styles.badgesRow, { opacity: badgeFade }]}>
        {INCLUSIVE_BADGES.map((b) => (
          <View key={b.label} style={styles.badge}>
            <Text style={styles.badgeEmoji}>{b.emoji}</Text>
            <Text style={styles.badgeLabel}>{b.label}</Text>
          </View>
        ))}
      </Animated.View>

      {/* Actions */}
      <Animated.View style={[styles.actions, { opacity: fadeAnim }]}>
        <TouchableOpacity
          style={styles.getStartedBtn}
          onPress={() => navigation.navigate('WhosPlanning')}
          activeOpacity={0.88}
        >
          <Text style={styles.getStartedText}>Get Started</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.signInLink}
          onPress={() => navigation.navigate('Login')}
          activeOpacity={0.7}
        >
          <Text style={styles.signInText}>Sign In</Text>
        </TouchableOpacity>
      </Animated.View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  betaBadge: {
    position: 'absolute', top: 16, right: Spacing.screen,
    borderWidth: 1, borderColor: Colors.gold, borderRadius: BorderRadius.pill,
    paddingHorizontal: 10, paddingVertical: 4, zIndex: 10,
  },
  betaText: { color: Colors.gold, fontSize: Typography.xs, fontWeight: Typography.semibold, letterSpacing: 0.5 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: Spacing.screen },
  logoWrap: { alignItems: 'center', marginBottom: Spacing.xl },
  logo: { fontFamily: Typography.heading, fontSize: Typography.display, color: Colors.gold, fontStyle: 'italic', letterSpacing: 1 },
  logoLine: { width: 70, height: 2, backgroundColor: Colors.gold, marginTop: 6, opacity: 0.5 },
  tagline: { color: Colors.textSecondary, fontSize: Typography.base, textAlign: 'center', lineHeight: 24, marginBottom: Spacing.xl },
  cityRow: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: Colors.cardAlt, borderWidth: 1, borderColor: Colors.cardBorder,
    borderRadius: BorderRadius.pill, paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs,
  },
  cityPin: { fontSize: 13 },
  cityText: { color: Colors.textSecondary, fontSize: Typography.sm, fontWeight: Typography.medium },
  cityChevron: { color: Colors.gold, fontSize: 18, marginLeft: 4 },
  badgesRow: {
    flexDirection: 'row', justifyContent: 'center', gap: Spacing.sm,
    paddingHorizontal: Spacing.screen, marginBottom: Spacing.xl,
  },
  badge: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: 'rgba(201,168,76,0.08)', borderWidth: 1,
    borderColor: 'rgba(201,168,76,0.2)', borderRadius: BorderRadius.pill,
    paddingHorizontal: Spacing.sm, paddingVertical: 6,
  },
  badgeEmoji: { fontSize: 13 },
  badgeLabel: { color: Colors.textSecondary, fontSize: 11, fontWeight: Typography.medium },
  actions: { paddingHorizontal: Spacing.screen, paddingBottom: Spacing.lg, gap: Spacing.md },
  getStartedBtn: {
    backgroundColor: Colors.red, borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.lg, alignItems: 'center',
  },
  getStartedText: { color: Colors.white, fontSize: Typography.md, fontWeight: Typography.bold, letterSpacing: 0.5 },
  signInLink: { alignItems: 'center', paddingVertical: Spacing.sm },
  signInText: { color: Colors.gold, fontSize: Typography.base, fontWeight: Typography.semibold },
});
