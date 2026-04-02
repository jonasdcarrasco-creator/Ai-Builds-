import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as Location from 'expo-location';
import { RootStackParamList } from '../types';
import { Colors, Typography, Spacing, BorderRadius } from '../constants/theme';

const { width } = Dimensions.get('window');

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Splash'>;
};

export default function SplashScreen({ navigation }: Props) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const [city, setCity] = useState<string>('Philadelphia, PA');

  useEffect(() => {
    // Fade in animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 900,
        useNativeDriver: true,
      }),
    ]).start();

    // Location detection
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const location = await Location.getCurrentPositionAsync({});
          const [geo] = await Location.reverseGeocodeAsync(location.coords);
          if (geo?.city && geo?.region) {
            setCity(`${geo.city}, ${geo.region}`);
          }
        }
      } catch {
        // default to Philadelphia
      }
    })();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />

      {/* Beta badge */}
      <View style={styles.betaBadge}>
        <Text style={styles.betaText}>Beta — Invite Only</Text>
      </View>

      <Animated.View
        style={[
          styles.content,
          { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
        ]}
      >
        {/* Logo */}
        <View style={styles.logoContainer}>
          <Text style={styles.logoText}>Datefully</Text>
          <View style={styles.logoUnderline} />
        </View>

        {/* Tagline */}
        <Text style={styles.tagline}>
          The only app that plans your entire date,{'\n'}
          from budget to transportation,{'\n'}
          so you can focus on the moment.
        </Text>

        {/* City indicator */}
        <View style={styles.cityRow}>
          <Text style={styles.cityPin}>📍</Text>
          <Text style={styles.cityText}>Planning dates in {city}</Text>
        </View>
      </Animated.View>

      <Animated.View style={[styles.actions, { opacity: fadeAnim }]}>
        {/* Get Started button */}
        <TouchableOpacity
          style={styles.getStartedButton}
          activeOpacity={0.85}
          onPress={() => navigation.navigate('WhosPlanning')}
        >
          <Text style={styles.getStartedText}>Get Started</Text>
        </TouchableOpacity>

        {/* Sign In link */}
        <TouchableOpacity
          style={styles.signInLink}
          activeOpacity={0.7}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.signInText}>Sign In</Text>
        </TouchableOpacity>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingHorizontal: Spacing.screen,
  },
  betaBadge: {
    position: 'absolute',
    top: 56,
    right: Spacing.screen,
    borderWidth: 1,
    borderColor: Colors.gold,
    borderRadius: BorderRadius.pill,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    zIndex: 10,
  },
  betaText: {
    color: Colors.gold,
    fontSize: Typography.xs,
    fontWeight: Typography.semibold,
    letterSpacing: 0.5,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: Spacing.xxxl,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  logoText: {
    fontFamily: Typography.heading,
    fontSize: Typography.display,
    color: Colors.gold,
    fontStyle: 'italic',
    letterSpacing: 1,
  },
  logoUnderline: {
    width: 80,
    height: 2,
    backgroundColor: Colors.gold,
    marginTop: Spacing.xs,
    opacity: 0.6,
  },
  tagline: {
    color: Colors.textSecondary,
    fontSize: Typography.base,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.xl,
  },
  cityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.cardAlt,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.pill,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  cityPin: {
    fontSize: 14,
  },
  cityText: {
    color: Colors.textSecondary,
    fontSize: Typography.sm,
    fontWeight: Typography.medium,
  },
  actions: {
    paddingBottom: Spacing.xxxl,
    gap: Spacing.md,
  },
  getStartedButton: {
    backgroundColor: Colors.red,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.lg,
    alignItems: 'center',
    width: width - Spacing.screen * 2,
  },
  getStartedText: {
    color: Colors.white,
    fontSize: Typography.md,
    fontWeight: Typography.bold,
    letterSpacing: 0.5,
  },
  signInLink: {
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  signInText: {
    color: Colors.gold,
    fontSize: Typography.base,
    fontWeight: Typography.semibold,
  },
});
