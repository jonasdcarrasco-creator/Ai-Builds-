import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { DatefullyStackParamList } from '../../navigation/DatefullyNavigator';

type NavProp = NativeStackNavigationProp<DatefullyStackParamList, 'Splash'>;

const NavDots = ({ total, current }: { total: number; current: number }) => (
  <View style={styles.navDotsContainer}>
    {Array.from({ length: total }).map((_, i) => (
      <View
        key={i}
        style={[
          styles.dot,
          {
            width: i === current ? 16 : 6,
            backgroundColor: i === current ? '#c0392b' : '#333',
          },
        ]}
      />
    ))}
  </View>
);

export default function SplashScreen() {
  const navigation = useNavigation<NavProp>();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      <View style={styles.inner}>
        {/* Logo Area */}
        <View style={styles.logoContainer}>
          <Text style={styles.calendarEmoji}>📅</Text>
          <View style={styles.heartOutline}>
            <Text style={styles.heartText}>❤️</Text>
          </View>
        </View>

        {/* Title */}
        <View style={styles.titleRow}>
          <Text style={styles.titleGold}>Date</Text>
          <Text style={styles.titleWhite}>fully</Text>
        </View>

        {/* Tagline */}
        <Text style={styles.tagline}>Plan it. Make it unforgettable.</Text>

        {/* Location Pill */}
        <View style={styles.locationPill}>
          <Text style={styles.locationText}>📍 Philadelphia, PA</Text>
        </View>

        {/* Spacer */}
        <View style={styles.spacer} />

        {/* Get Started Button */}
        <TouchableOpacity
          style={styles.getStartedButton}
          onPress={() => navigation.navigate('WhoPlanning')}
          activeOpacity={0.85}
        >
          <Text style={styles.getStartedText}>Get Started — It's Free</Text>
        </TouchableOpacity>

        {/* Sign In Row */}
        <View style={styles.signInRow}>
          <Text style={styles.signInWhite}>Already have an account? </Text>
          <TouchableOpacity activeOpacity={0.7}>
            <Text style={styles.signInGold}>Sign In</Text>
          </TouchableOpacity>
        </View>

        {/* Beta Badge */}
        <View style={styles.betaBadge}>
          <Text style={styles.betaText}>Beta Version • Invite Only</Text>
        </View>

        {/* Nav Dots */}
        <NavDots total={9} current={0} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  inner: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 60,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 8,
  },
  calendarEmoji: {
    fontSize: 72,
    textAlign: 'center',
  },
  heartOutline: {
    marginTop: 4,
    borderWidth: 1.5,
    borderColor: '#c9a84c',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  heartText: {
    fontSize: 20,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 20,
  },
  titleGold: {
    fontSize: 52,
    fontWeight: '800',
    color: '#c9a84c',
    letterSpacing: -1,
  },
  titleWhite: {
    fontSize: 52,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: -1,
  },
  tagline: {
    fontSize: 16,
    color: '#c9a84c',
    fontStyle: 'italic',
    marginTop: 8,
    textAlign: 'center',
  },
  locationPill: {
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#c9a84c',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  locationText: {
    color: '#c9a84c',
    fontSize: 13,
    fontWeight: '500',
  },
  spacer: {
    flex: 1,
  },
  getStartedButton: {
    backgroundColor: '#c0392b',
    width: '100%',
    height: 56,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  getStartedText: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  signInRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  signInWhite: {
    color: '#ffffff',
    fontSize: 14,
  },
  signInGold: {
    color: '#c9a84c',
    fontSize: 14,
    fontWeight: '600',
  },
  betaBadge: {
    borderWidth: 1,
    borderColor: '#c9a84c',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 5,
    marginBottom: 16,
  },
  betaText: {
    color: '#c9a84c',
    fontSize: 11,
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  navDotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    paddingBottom: 20,
  },
  dot: {
    height: 6,
    borderRadius: 3,
  },
});
