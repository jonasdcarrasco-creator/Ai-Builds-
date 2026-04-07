import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  Dimensions,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Brand colors
const BLACK = '#000000';
const DEEP_RED = '#C0392B';
const GOLD = '#C9A84C';
const WHITE = '#FFFFFF';
const DARK_SURFACE = '#111111';
const DARK_BORDER = '#2A2A2A';
const TEXT_MUTED = '#888888';
const GREEN = '#27AE60';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const HEART_COUNT = 20;

type HeartAnim = {
  id: number;
  x: number;
  translateY: Animated.Value;
  opacity: Animated.Value;
  emoji: string;
};

type Props = {
  navigation: any;
  route: any;
};

function HeartRain({ hearts }: { hearts: HeartAnim[] }) {
  return (
    <View style={heartStyles.overlay} pointerEvents="none">
      {hearts.map(heart => (
        <Animated.Text
          key={heart.id}
          style={[
            heartStyles.heart,
            {
              left: heart.x,
              transform: [{ translateY: heart.translateY }],
              opacity: heart.opacity,
            },
          ]}
        >
          {heart.emoji}
        </Animated.Text>
      ))}
    </View>
  );
}

const heartStyles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 999,
  },
  heart: {
    position: 'absolute',
    top: -40,
    fontSize: 28,
  },
});

export default function DateOptionsScreen({ navigation, route }: Props) {
  const params = route?.params ?? {};
  const city: string = params.city ?? 'Philadelphia, PA';
  const budget: string = params.budget ?? '$50–$150';

  const [hearts, setHearts] = useState<HeartAnim[]>([]);

  const triggerHeartRain = (onComplete: () => void) => {
    const newHearts: HeartAnim[] = Array.from({ length: HEART_COUNT }).map((_, i) => ({
      id: i,
      x: Math.random() * (SCREEN_WIDTH - 40),
      translateY: new Animated.Value(0),
      opacity: new Animated.Value(1),
      emoji: i % 2 === 0 ? '❤️' : '💛',
    }));

    setHearts(newHearts);

    const animations = newHearts.map(heart =>
      Animated.parallel([
        Animated.timing(heart.translateY, {
          toValue: SCREEN_HEIGHT + 60,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.sequence([
          Animated.delay(1200),
          Animated.timing(heart.opacity, {
            toValue: 0,
            duration: 800,
            useNativeDriver: true,
          }),
        ]),
      ]),
    );

    Animated.parallel(animations).start(() => {
      setHearts([]);
      onComplete();
    });
  };

  const handleBookIt = () => {
    triggerHeartRain(() => {
      navigation.navigate('VendorMarketplace');
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={BLACK} />
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={WHITE} />
          </TouchableOpacity>
        </View>

        {/* Progress Dots */}
        <View style={styles.dotsRow}>
          {Array.from({ length: 9 }).map((_, i) => (
            <View
              key={i}
              style={[styles.dot, i === 5 ? styles.dotActive : styles.dotInactive]}
            />
          ))}
        </View>

        {/* Heading */}
        <Text style={styles.heading}>Your perfect 3 dates</Text>

        {/* Location + budget badge */}
        <Text style={styles.locationBadge}>
          📍 {city} · {budget}
        </Text>

        {/* Cards */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Card 1 — Best Match */}
          <View style={styles.card1}>
            <View style={styles.cardTopRow}>
              <Text style={styles.card1Title}>The Perfect Night Out</Text>
              <View style={styles.topPickBadge}>
                <Text style={styles.topPickText}>TOP PICK</Text>
              </View>
            </View>
            <Text style={styles.venueNames}>
              Vernick Food & Drink • Reading Terminal Market • Spruce Street Harbor Park
            </Text>
            <Text style={styles.cardDescription}>
              A curated evening starting with craft cocktails and small plates, followed by a scenic stroll along the waterfront with city lights.
            </Text>
            <Text style={styles.estCostWhite}>Est. cost: $65 per person</Text>
            <TouchableOpacity style={styles.bookGoldButton} onPress={handleBookIt} activeOpacity={0.8}>
              <Text style={styles.bookGoldText}>Book it 💕</Text>
            </TouchableOpacity>
          </View>

          {/* Card 2 — Chill at Home */}
          <View style={styles.card2}>
            <View style={styles.cardTopRow}>
              <Text style={styles.cardTitle}>Netflix & Homemade Charcuterie</Text>
              <View style={styles.cozyPickBadge}>
                <Text style={styles.cozyPickText}>COZY PICK</Text>
              </View>
            </View>
            <Text style={styles.cardDescription}>
              Build a beautiful charcuterie board together, pick your comfort show, and let the night melt away at home.
            </Text>
            <View style={styles.freeBadge}>
              <Text style={styles.freeBadgeText}>FREE</Text>
            </View>
            <Text style={styles.estCostMuted}>Est. cost: $20–$30</Text>
            <TouchableOpacity style={styles.bookRedButton} onPress={handleBookIt} activeOpacity={0.8}>
              <Text style={styles.bookRedText}>Book it 💕</Text>
            </TouchableOpacity>
          </View>

          {/* Card 3 — Splurge */}
          <View style={styles.card3}>
            <View style={styles.cardTopRow}>
              <Text style={styles.cardTitle}>The Elevated Experience</Text>
              <View style={styles.splurgeBadge}>
                <Text style={styles.splurgeText}>SPLURGE</Text>
              </View>
            </View>
            <Text style={styles.venueNamesMuted}>
              Zahav • The Rooftop Bar at The Bok • Franklin Fountain
            </Text>
            <Text style={styles.cardDescription}>
              Pull out all the stops — a Michelin-starred dinner, rooftop cocktails under the stars, and artisan ice cream to end the night.
            </Text>
            <Text style={styles.estCostWhite}>Est. cost: $140–$180 per person</Text>
            <TouchableOpacity style={styles.bookGreyButton} onPress={handleBookIt} activeOpacity={0.8}>
              <Text style={styles.bookGreyText}>Book it 💕</Text>
            </TouchableOpacity>
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>

        {/* Heart Rain Overlay */}
        {hearts.length > 0 && <HeartRain hearts={hearts} />}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: BLACK,
  },
  container: {
    flex: 1,
    backgroundColor: BLACK,
    paddingTop: 12,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  backButton: {
    padding: 4,
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    gap: 6,
  },
  dot: {
    height: 6,
    borderRadius: 3,
  },
  dotActive: {
    width: 20,
    backgroundColor: GOLD,
  },
  dotInactive: {
    width: 6,
    backgroundColor: '#444',
  },
  heading: {
    color: WHITE,
    fontSize: 26,
    fontWeight: 'bold',
    paddingHorizontal: 20,
    marginBottom: 6,
  },
  locationBadge: {
    color: TEXT_MUTED,
    fontSize: 13,
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },

  // Card 1 — Gold
  card1: {
    backgroundColor: DARK_SURFACE,
    borderWidth: 1.5,
    borderColor: GOLD,
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 8,
    gap: 8,
  },
  card1Title: {
    color: WHITE,
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
  },
  cardTitle: {
    color: WHITE,
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
  },
  topPickBadge: {
    backgroundColor: GOLD,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  topPickText: {
    color: BLACK,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  venueNames: {
    color: GOLD,
    fontSize: 13,
    marginBottom: 8,
    lineHeight: 18,
  },
  venueNamesMuted: {
    color: TEXT_MUTED,
    fontSize: 13,
    marginBottom: 8,
    lineHeight: 18,
  },
  cardDescription: {
    color: TEXT_MUTED,
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 12,
  },
  estCostWhite: {
    color: WHITE,
    fontSize: 12,
    marginBottom: 14,
  },
  estCostMuted: {
    color: TEXT_MUTED,
    fontSize: 12,
    marginBottom: 14,
  },
  bookGoldButton: {
    borderWidth: 1.5,
    borderColor: GOLD,
    borderRadius: 24,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  bookGoldText: {
    color: GOLD,
    fontSize: 14,
    fontWeight: '600',
  },

  // Card 2 — Red
  card2: {
    backgroundColor: DARK_SURFACE,
    borderWidth: 1.5,
    borderColor: DEEP_RED,
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
  },
  cozyPickBadge: {
    backgroundColor: DEEP_RED,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  cozyPickText: {
    color: WHITE,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  freeBadge: {
    backgroundColor: GREEN,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 3,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  freeBadgeText: {
    color: WHITE,
    fontSize: 11,
    fontWeight: '700',
  },
  bookRedButton: {
    borderWidth: 1.5,
    borderColor: DEEP_RED,
    borderRadius: 24,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  bookRedText: {
    color: DEEP_RED,
    fontSize: 14,
    fontWeight: '600',
  },

  // Card 3 — Grey/Dark
  card3: {
    backgroundColor: DARK_SURFACE,
    borderWidth: 1.5,
    borderColor: DARK_BORDER,
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
  },
  splurgeBadge: {
    backgroundColor: DARK_BORDER,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  splurgeText: {
    color: TEXT_MUTED,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  bookGreyButton: {
    borderWidth: 1.5,
    borderColor: DARK_BORDER,
    borderRadius: 24,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  bookGreyText: {
    color: WHITE,
    fontSize: 14,
    fontWeight: '600',
  },
});
