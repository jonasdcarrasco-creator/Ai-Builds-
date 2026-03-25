import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const COLORS = {
  black: '#000000',
  deepRed: '#C0392B',
  gold: '#C9A84C',
  white: '#FFFFFF',
  darkSurface: '#111111',
};

interface Props {
  navigation: any;
}

export default function SplashScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();

  // Animation values
  const calendarRock = useRef(new Animated.Value(0)).current;
  const heartScale = useRef(new Animated.Value(0.9)).current;
  const orbitRotation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Calendar rock: -8deg to +8deg, 2s loop
    Animated.loop(
      Animated.sequence([
        Animated.timing(calendarRock, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(calendarRock, {
          toValue: -1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Heart pulse: scale 0.9 to 1.1, 2s loop
    Animated.loop(
      Animated.sequence([
        Animated.timing(heartScale, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(heartScale, {
          toValue: 0.9,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Orbit dot: full 360 rotation, 3s loop
    Animated.loop(
      Animated.timing(orbitRotation, {
        toValue: 1,
        duration: 3000,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const calendarRotate = calendarRock.interpolate({
    inputRange: [-1, 1],
    outputRange: ['-8deg', '8deg'],
  });

  const orbitRotate = orbitRotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const ORBIT_RADIUS = 38;

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      {/* Centered logo area */}
      <View style={styles.centerContent}>
        {/* Animated logo */}
        <View style={styles.logoWrapper}>
          {/* Orbit dot */}
          <Animated.View
            style={[
              styles.orbitContainer,
              { transform: [{ rotate: orbitRotate }] },
            ]}
          >
            <View
              style={[
                styles.orbitDot,
                { transform: [{ translateX: ORBIT_RADIUS }] },
              ]}
            />
          </Animated.View>

          {/* Calendar + Heart */}
          <Animated.View
            style={[
              styles.iconStack,
              { transform: [{ rotate: calendarRotate }] },
            ]}
          >
            <Ionicons name="calendar" size={72} color={COLORS.deepRed} />
            <Animated.View
              style={[
                styles.heartOverlay,
                { transform: [{ scale: heartScale }] },
              ]}
            >
              <Ionicons name="heart-outline" size={30} color={COLORS.gold} />
            </Animated.View>
          </Animated.View>
        </View>

        {/* App name */}
        <View style={styles.appNameRow}>
          <Text style={styles.appNameGold}>Date</Text>
          <Text style={styles.appNameWhite}>fully</Text>
        </View>

        {/* Tagline */}
        <Text style={styles.tagline}>
          The only app that plans your entire date — from budget to transportation — so you can focus on the moment.
        </Text>

        {/* Location pill */}
        <View style={styles.locationPill}>
          <View style={styles.locationDot} />
          <Text style={styles.locationText}>Philadelphia, PA detected</Text>
        </View>
      </View>

      {/* Bottom section */}
      <View style={styles.bottomSection}>
        {/* Progress dots */}
        <View style={styles.progressDots}>
          {Array.from({ length: 9 }).map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                i === 0 ? styles.dotActive : styles.dotInactive,
              ]}
            />
          ))}
        </View>

        {/* CTA button */}
        <TouchableOpacity
          style={styles.ctaButton}
          activeOpacity={0.85}
          onPress={() => navigation.navigate('WhoPlanning')}
        >
          <Text style={styles.ctaText}>Get Started — It's Free</Text>
        </TouchableOpacity>

        {/* Sign in link */}
        <TouchableOpacity
          style={styles.signInRow}
          onPress={() => navigation.navigate('Login')}
          activeOpacity={0.7}
        >
          <Text style={styles.signInBase}>Already have an account? </Text>
          <Text style={styles.signInGold}>Sign In</Text>
        </TouchableOpacity>

        {/* Beta badge */}
        <View style={styles.betaBadge}>
          <Text style={styles.betaText}>🚀  DATEFULLY BETA — INVITE ONLY</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.black,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  logoWrapper: {
    width: 100,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  orbitContainer: {
    position: 'absolute',
    width: 100,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  orbitDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.gold,
  },
  iconStack: {
    width: 72,
    height: 72,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heartOverlay: {
    position: 'absolute',
    bottom: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  appNameRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 12,
  },
  appNameGold: {
    fontSize: 38,
    fontWeight: 'bold',
    color: COLORS.gold,
    letterSpacing: 0.5,
  },
  appNameWhite: {
    fontSize: 38,
    fontWeight: '400',
    color: COLORS.white,
    letterSpacing: 0.5,
  },
  tagline: {
    fontSize: 11,
    color: COLORS.gold,
    textAlign: 'center',
    maxWidth: 260,
    lineHeight: 17,
    marginBottom: 18,
    opacity: 0.85,
  },
  locationPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    borderWidth: 1,
    borderColor: '#2A2A2A',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 7,
    gap: 7,
  },
  locationDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: COLORS.deepRed,
  },
  locationText: {
    fontSize: 12,
    color: COLORS.white,
    fontWeight: '500',
  },
  bottomSection: {
    width: '100%',
    paddingHorizontal: 24,
    paddingBottom: 16,
    alignItems: 'center',
    gap: 14,
  },
  progressDots: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 4,
  },
  dot: {
    height: 6,
    borderRadius: 3,
  },
  dotActive: {
    width: 20,
    backgroundColor: COLORS.gold,
  },
  dotInactive: {
    width: 6,
    backgroundColor: '#333',
  },
  ctaButton: {
    width: width - 48,
    backgroundColor: COLORS.deepRed,
    borderRadius: 28,
    paddingVertical: 17,
    alignItems: 'center',
  },
  ctaText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 0.3,
  },
  signInRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  signInBase: {
    fontSize: 14,
    color: '#888',
  },
  signInGold: {
    fontSize: 14,
    color: COLORS.gold,
    fontWeight: 'bold',
  },
  betaBadge: {
    backgroundColor: '#111',
    borderWidth: 1,
    borderColor: '#2A2A2A',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  betaText: {
    fontSize: 10,
    color: COLORS.gold,
    fontWeight: '600',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
});
