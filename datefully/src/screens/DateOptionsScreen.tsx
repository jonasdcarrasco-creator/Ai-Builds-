import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  Dimensions,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, DateOption, SelectedDate } from '../types';
import { useDateStore } from '../store';
import { generateDateOptions } from '../lib/claude';
import { Colors, Typography, Spacing, BorderRadius } from '../constants/theme';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'DateOptions'>;
};

const { width, height } = Dimensions.get('window');
const HEART_COUNT = 18;

function generateConfirmationNumber() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

// Heart Rain animation component
function HeartRain({ visible, onComplete }: { visible: boolean; onComplete: () => void }) {
  const hearts = useRef(
    Array.from({ length: HEART_COUNT }, () => ({
      anim: new Animated.Value(0),
      x: Math.random() * width * 0.6 - width * 0.3,
      delay: Math.random() * 600,
      scale: 0.8 + Math.random() * 0.8,
    }))
  ).current;

  useEffect(() => {
    if (!visible) return;
    const anims = hearts.map((h) =>
      Animated.sequence([
        Animated.delay(h.delay),
        Animated.timing(h.anim, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
      ])
    );
    Animated.parallel(anims).start(() => {
      hearts.forEach((h) => h.anim.setValue(0));
      onComplete();
    });
  }, [visible]);

  if (!visible) return null;

  return (
    <View style={heartStyles.overlay} pointerEvents="none">
      {hearts.map((h, i) => (
        <Animated.Text
          key={i}
          style={[
            heartStyles.heart,
            {
              left: width / 2 + h.x,
              transform: [
                {
                  translateY: h.anim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [height * 0.6, height * 0.1],
                  }),
                },
                { scale: h.scale },
              ],
              opacity: h.anim.interpolate({
                inputRange: [0, 0.7, 1],
                outputRange: [1, 1, 0],
              }),
            },
          ]}
        >
          ❤️
        </Animated.Text>
      ))}
    </View>
  );
}

const heartStyles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 999,
    pointerEvents: 'none',
  },
  heart: {
    position: 'absolute',
    fontSize: 24,
  },
});

function DateCard({
  option,
  onBook,
}: {
  option: DateOption;
  onBook: (opt: DateOption) => void;
}) {
  const borderColor =
    option.type === 'splurge'
      ? Colors.gold
      : option.type === 'chill'
      ? Colors.success
      : Colors.red;

  return (
    <View style={[cardStyles.card, { borderTopColor: borderColor }]}>
      {/* Badge */}
      <View style={[cardStyles.badge, { backgroundColor: borderColor + '22', borderColor }]}>
        <Text style={cardStyles.badgeEmoji}>{option.typeEmoji || '⭐'}</Text>
        <Text style={[cardStyles.badgeText, { color: borderColor }]}>
          {option.typeLabel || option.type.replace('_', ' ')}
        </Text>
      </View>

      {/* Title */}
      <Text style={cardStyles.title}>{option.title}</Text>

      {/* Venues */}
      <View style={cardStyles.venueList}>
        {option.venues.map((v, i) => (
          <View key={i} style={cardStyles.venueRow}>
            <Text style={cardStyles.venueDot}>•</Text>
            <Text style={cardStyles.venue}>{v}</Text>
          </View>
        ))}
      </View>

      {/* Cost */}
      <Text style={cardStyles.cost}>{option.estimatedCost}</Text>

      {/* Description */}
      <Text style={cardStyles.description}>{option.description}</Text>

      {/* Book button */}
      <TouchableOpacity
        style={cardStyles.bookBtn}
        onPress={() => onBook(option)}
        activeOpacity={0.85}
      >
        <Text style={cardStyles.bookBtnText}>Book it 🎯</Text>
      </TouchableOpacity>
    </View>
  );
}

const cardStyles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.xl,
    borderTopWidth: 3,
    padding: Spacing.xl,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderWidth: 1,
    borderRadius: BorderRadius.pill,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    alignSelf: 'flex-start',
    marginBottom: Spacing.md,
  },
  badgeEmoji: { fontSize: 13 },
  badgeText: { fontSize: Typography.xs, fontWeight: Typography.bold, letterSpacing: 0.5, textTransform: 'uppercase' },
  title: {
    fontFamily: Typography.heading,
    fontSize: Typography.xl,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  venueList: { marginBottom: Spacing.sm, gap: 3 },
  venueRow: { flexDirection: 'row', gap: 6 },
  venueDot: { color: Colors.gold, fontSize: Typography.base },
  venue: { color: Colors.textSecondary, fontSize: Typography.base, flex: 1 },
  cost: {
    fontSize: Typography.lg,
    color: Colors.gold,
    fontWeight: Typography.bold,
    marginBottom: Spacing.sm,
  },
  description: {
    color: Colors.textSecondary,
    fontSize: Typography.sm,
    lineHeight: 20,
    marginBottom: Spacing.lg,
  },
  bookBtn: {
    backgroundColor: Colors.red,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
    alignItems: 'center',
  },
  bookBtnText: {
    color: Colors.white,
    fontSize: Typography.base,
    fontWeight: Typography.bold,
  },
});

export default function DateOptionsScreen({ navigation }: Props) {
  const { userName, budget, occasion, planningFor, partnerProfile, dateOptions, setDateOptions, setSelectedDate, setBookingTime } =
    useDateStore();

  const [loading, setLoading] = useState(dateOptions.length === 0);
  const [heartVisible, setHeartVisible] = useState(false);

  useEffect(() => {
    if (dateOptions.length === 0) {
      loadOptions();
    }
  }, []);

  const loadOptions = async () => {
    setLoading(true);
    try {
      const options = await generateDateOptions(
        userName || 'User',
        budget,
        occasion || 'Just Because',
        planningFor || 'couple',
        partnerProfile
      );
      setDateOptions(options);
    } catch {
      // fallback is handled in generateDateOptions
    } finally {
      setLoading(false);
    }
  };

  const handleBook = (option: DateOption) => {
    const selected: SelectedDate = {
      option,
      bookedAt: new Date(),
      confirmationNumber: generateConfirmationNumber(),
    };
    setSelectedDate(selected);
    setBookingTime(Date.now());
    setHeartVisible(true);
  };

  const handleHeartComplete = () => {
    setHeartVisible(false);
    navigation.navigate('InvitationCard');
  };

  return (
    <SafeAreaView style={styles.container}>
      <HeartRain visible={heartVisible} onComplete={handleHeartComplete} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Your Date Plans</Text>
        <Text style={styles.subtitle}>Three options, all planned for you</Text>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.gold} />
          <Text style={styles.loadingText}>Crafting your perfect dates...</Text>
          <Text style={styles.loadingSubtext}>This takes a moment ✨</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {dateOptions.map((option: DateOption) => (
            <DateCard key={option.id} option={option} onBook={handleBook} />
          ))}

          {/* Vendor marketplace link */}
          <TouchableOpacity
            style={styles.vendorLink}
            onPress={() => navigation.navigate('VendorMarketplace')}
            activeOpacity={0.8}
          >
            <Text style={styles.vendorLinkText}>Browse Date-Night Partners →</Text>
          </TouchableOpacity>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    paddingHorizontal: Spacing.screen,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.cardBorder,
  },
  backBtn: { marginBottom: Spacing.md },
  backText: { color: Colors.gold, fontSize: Typography.base },
  title: {
    fontFamily: Typography.heading,
    fontSize: Typography.xxl,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  subtitle: { fontSize: Typography.sm, color: Colors.textSecondary },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.md,
  },
  loadingText: {
    color: Colors.textPrimary,
    fontSize: Typography.lg,
    fontFamily: Typography.heading,
  },
  loadingSubtext: { color: Colors.textMuted, fontSize: Typography.sm },
  scroll: { flex: 1 },
  scrollContent: {
    padding: Spacing.screen,
    paddingBottom: Spacing.xxxl,
  },
  vendorLink: {
    alignItems: 'center',
    paddingVertical: Spacing.lg,
  },
  vendorLinkText: {
    color: Colors.gold,
    fontSize: Typography.base,
    fontWeight: Typography.semibold,
  },
});
