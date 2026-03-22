import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Svg, { Rect, Path, Circle, G } from 'react-native-svg';
import { DatefullyStackParamList } from '../../types';
import { Colors } from '../../constants/colors';

const { width } = Dimensions.get('window');

type Nav = NativeStackNavigationProp<DatefullyStackParamList, 'Splash'>;

// ─── Animated Logo ────────────────────────────────────────────────────────────

const AnimatedG = Animated.createAnimatedComponent(G);

function DatefullyLogo() {
  const rockAnim = useRef(new Animated.Value(0)).current;
  const orbitAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Rock animation — gentle back-and-forth rotation
    Animated.loop(
      Animated.sequence([
        Animated.timing(rockAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.timing(rockAnim, { toValue: -1, duration: 600, useNativeDriver: true }),
        Animated.timing(rockAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
        Animated.delay(400),
      ])
    ).start();

    // Orbit animation — full 360 rotation for the dot
    Animated.loop(
      Animated.timing(orbitAnim, { toValue: 1, duration: 2800, useNativeDriver: true })
    ).start();

    // Pulse on the heart
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.18, duration: 700, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const rotate = rockAnim.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: ['-8deg', '0deg', '8deg'],
  });

  // Orbit dot position (circle of radius 52 centered on logo)
  const orbitX = orbitAnim.interpolate({
    inputRange: [0, 0.25, 0.5, 0.75, 1],
    outputRange: [52, 0, -52, 0, 52],
  });
  const orbitY = orbitAnim.interpolate({
    inputRange: [0, 0.25, 0.5, 0.75, 1],
    outputRange: [0, 52, 0, -52, 0],
  });

  const SIZE = 120;
  const cx = SIZE / 2;
  const cy = SIZE / 2;

  return (
    <View style={logoStyles.container}>
      {/* Animated glow behind logo */}
      <Animated.View style={[logoStyles.glow, { transform: [{ scale: pulseAnim }] }]} />

      {/* Rocking calendar */}
      <Animated.View style={{ transform: [{ rotate }] }}>
        <Svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
          {/* Calendar body */}
          <Rect
            x="10"
            y="18"
            width="100"
            height="88"
            rx="12"
            ry="12"
            fill="#111111"
            stroke={Colors.gold}
            strokeWidth="2.5"
          />
          {/* Calendar header bar */}
          <Rect x="10" y="18" width="100" height="28" rx="12" ry="12" fill={Colors.deepRed} />
          <Rect x="10" y="32" width="100" height="14" fill={Colors.deepRed} />
          {/* Ring hooks */}
          <Rect x="34" y="11" width="8" height="16" rx="4" fill={Colors.gold} />
          <Rect x="78" y="11" width="8" height="16" rx="4" fill={Colors.gold} />
          {/* Heart outline inside calendar */}
          <Path
            d="M60 85 C60 85 38 72 38 57 C38 49.3 44.3 43 52 43 C56 43 59.5 45 60 47.5 C60.5 45 64 43 68 43 C75.7 43 82 49.3 82 57 C82 72 60 85 60 85Z"
            fill="none"
            stroke={Colors.gold}
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
        </Svg>
      </Animated.View>

      {/* Orbiting gold dot */}
      <Animated.View
        style={[
          logoStyles.orbitDot,
          {
            transform: [
              { translateX: orbitX },
              { translateY: orbitY },
            ],
          },
        ]}
      />
    </View>
  );
}

// ─── Splash Screen ────────────────────────────────────────────────────────────

export function SplashScreen() {
  const navigation = useNavigation<Nav>();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 900, delay: 300, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 700, delay: 300, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.black} />
      <SafeAreaView style={styles.safe}>
        <Animated.View
          style={[styles.content, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}
        >
          {/* Logo */}
          <DatefullyLogo />

          {/* Brand name */}
          <Text style={styles.brandName}>Datefully</Text>
          <Text style={styles.tagline}>Plan it. Make it unforgettable.</Text>

          {/* Divider */}
          <View style={styles.divider} />

          {/* CTA buttons */}
          <TouchableOpacity
            style={styles.btnPrimary}
            activeOpacity={0.85}
            onPress={() => navigation.navigate('PlannerSetup')}
          >
            <Text style={styles.btnPrimaryText}>Get Started</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.btnSecondary}
            activeOpacity={0.75}
            onPress={() => navigation.navigate('PlannerSetup')}
          >
            <Text style={styles.btnSecondaryText}>Sign In</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Footer tagline */}
        <Text style={styles.footer}>Built for love, designed for memory.</Text>
      </SafeAreaView>
    </View>
  );
}

const logoStyles = StyleSheet.create({
  container: {
    width: 160,
    height: 160,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  glow: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(192,57,43,0.12)',
  },
  orbitDot: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.gold,
    shadowColor: Colors.gold,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 6,
    elevation: 6,
  },
});

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.black,
  },
  safe: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  content: {
    width: '100%',
    alignItems: 'center',
  },
  brandName: {
    fontSize: 48,
    fontWeight: '800',
    color: Colors.gold,
    letterSpacing: -1.5,
    marginTop: 8,
    textShadowColor: 'rgba(201,168,76,0.4)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 12,
  },
  tagline: {
    fontSize: 15,
    color: Colors.textMuted,
    marginTop: 8,
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  divider: {
    width: 48,
    height: 2,
    backgroundColor: Colors.deepRed,
    borderRadius: 2,
    marginVertical: 32,
    opacity: 0.8,
  },
  btnPrimary: {
    width: '100%',
    height: 56,
    backgroundColor: Colors.deepRed,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    shadowColor: Colors.deepRed,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 14,
    elevation: 8,
  },
  btnPrimaryText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.white,
    letterSpacing: 0.5,
  },
  btnSecondary: {
    width: '100%',
    height: 52,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: Colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnSecondaryText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.gold,
    letterSpacing: 0.5,
  },
  footer: {
    position: 'absolute',
    bottom: 32,
    fontSize: 12,
    color: Colors.textDim,
    letterSpacing: 0.3,
  },
});
