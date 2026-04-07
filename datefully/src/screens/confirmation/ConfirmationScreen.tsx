import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  Linking,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

const COLORS = {
  black: '#000000',
  deepRed: '#C0392B',
  gold: '#C9A84C',
  white: '#FFFFFF',
  dark: '#111111',
  darkBorder: '#2A2A2A',
  textMuted: '#888888',
};

const TRANSPORT = [
  { label: 'Walk 🚶', url: null },
  { label: 'Uber 🚗', url: 'uber://' },
  { label: 'Lyft 🚕', url: 'lyft://' },
  { label: 'Taxi 🚖', url: null },
  { label: 'Transit 🚌', url: null },
];

const RATING_MESSAGES: Record<number, string> = {
  5: "Perfect! You're a date planning legend! 💕",
  4: 'Amazing! Keep the spark alive! ✨',
  3: "Not bad! We'll help you top it next time 😊",
  2: "We'll do better. Plan again? 💪",
  1: 'Yikes! Let us redeem ourselves 😅',
};

// 4 sparkle positions (absolute relative to iconWrapper)
const SPARKLE_OFFSETS = [
  { top: -14, left: 16 },
  { top: -14, right: 16 },
  { bottom: -6, left: 10 },
  { bottom: -6, right: 10 },
];

interface Props {
  navigation: any;
  route: any;
}

export default function ConfirmationScreen({ navigation, route }: Props) {
  const vendors = route?.params?.vendors;
  const hasVendors = vendors && vendors.length > 0;

  // Build checklist dynamically so indices align with animation array
  const checklistItems = [
    'Confirmation email sent',
    'Added to calendar',
    'Invitation card sent',
    ...(hasVendors ? ['Vendor extras confirmed'] : []),
  ];

  // --- Animations ---
  const floatY = useRef(new Animated.Value(0)).current;

  const sparkleAnims = useRef(
    SPARKLE_OFFSETS.map(() => new Animated.Value(0))
  ).current;

  const checkAnims = useRef(
    checklistItems.map(() => ({
      translateX: new Animated.Value(-20),
      opacity: new Animated.Value(0),
    }))
  ).current;

  const [rating, setRating] = useState(0);

  useEffect(() => {
    // Float loop
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatY, {
          toValue: -8,
          duration: 950,
          useNativeDriver: true,
        }),
        Animated.timing(floatY, {
          toValue: 0,
          duration: 950,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Sparkle individual rotation loops
    sparkleAnims.forEach((anim, i) => {
      const spin = () => {
        anim.setValue(0);
        Animated.timing(anim, {
          toValue: 1,
          duration: 2200 + i * 350,
          useNativeDriver: true,
        }).start(({ finished }) => {
          if (finished) spin();
        });
      };
      setTimeout(() => spin(), i * 280);
    });

    // Checklist stagger
    checkAnims.forEach((a, i) => {
      Animated.parallel([
        Animated.timing(a.translateX, {
          toValue: 0,
          duration: 320,
          delay: 400 + i * 150,
          useNativeDriver: true,
        }),
        Animated.timing(a.opacity, {
          toValue: 1,
          duration: 320,
          delay: 400 + i * 150,
          useNativeDriver: true,
        }),
      ]).start();
    });
  }, []);

  const renderProgressDots = () => (
    <View style={styles.progressRow}>
      {Array.from({ length: 9 }, (_, i) => (
        <View
          key={i}
          style={[styles.dot, i === 8 ? styles.dotActive : styles.dotInactive]}
        />
      ))}
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.black} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Progress dots — dot 9 active */}
        <View style={styles.dotsRow}>{renderProgressDots()}</View>

        {/* Animated icon with sparkles */}
        <View style={styles.iconSection}>
          <Animated.View
            style={[styles.iconWrapper, { transform: [{ translateY: floatY }] }]}
          >
            {/* Orbiting sparkle stars */}
            {sparkleAnims.map((anim, i) => {
              const rotate = anim.interpolate({
                inputRange: [0, 1],
                outputRange: ['0deg', '360deg'],
              });
              return (
                <Animated.Text
                  key={i}
                  style={[
                    styles.sparkle,
                    SPARKLE_OFFSETS[i] as any,
                    { transform: [{ rotate }] },
                  ]}
                >
                  ⭐
                </Animated.Text>
              );
            })}

            {/* Icon stack */}
            <View style={styles.iconStack}>
              <Ionicons name="location" size={56} color={COLORS.deepRed} />
              <View style={styles.heartOverlay}>
                <Ionicons name="heart" size={22} color={COLORS.gold} />
              </View>
            </View>
          </Animated.View>
        </View>

        {/* Heading */}
        <Text style={styles.heading}>You're all set 🎉</Text>

        {/* Date summary card */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>The Perfect Night Out</Text>
          <View style={styles.summaryRow}>
            <Ionicons
              name="calendar"
              size={16}
              color={COLORS.gold}
              style={styles.rowIcon}
            />
            <Text style={styles.summaryWhite}>Saturday, March 28th · 7:00 PM</Text>
          </View>
          <View style={styles.summaryRow}>
            <Ionicons
              name="location-outline"
              size={16}
              color={COLORS.gold}
              style={styles.rowIcon}
            />
            <Text style={styles.summaryMuted}>Philadelphia, PA</Text>
          </View>
        </View>

        {/* Checklist */}
        <View style={styles.checklistCard}>
          {checklistItems.map((label, i) => (
            <Animated.View
              key={label}
              style={[
                styles.checklistRow,
                i < checklistItems.length - 1 && styles.checklistRowBorder,
                {
                  transform: [{ translateX: checkAnims[i].translateX }],
                  opacity: checkAnims[i].opacity,
                },
              ]}
            >
              <Ionicons
                name="checkmark-circle"
                size={18}
                color={COLORS.gold}
                style={styles.checkIcon}
              />
              <Text style={styles.checkText}>{label}</Text>
            </Animated.View>
          ))}
        </View>

        {/* Tagline */}
        <Text style={styles.tagline}>We got you — focus on the moment.</Text>

        {/* GET THERE */}
        <Text style={styles.sectionLabel}>GET THERE</Text>
        <View style={styles.transportRow}>
          {TRANSPORT.map(t => (
            <TouchableOpacity
              key={t.label}
              style={styles.transportBtn}
              onPress={() => t.url && Linking.openURL(t.url).catch(() => {})}
              activeOpacity={t.url ? 0.75 : 1}
            >
              <Text style={styles.transportText}>{t.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* RATE YOUR DATE */}
        <Text style={styles.rateHeading}>Rate Your Date</Text>
        <View style={styles.starsRow}>
          {[1, 2, 3, 4, 5].map(star => (
            <TouchableOpacity
              key={star}
              onPress={() => setRating(star)}
              activeOpacity={0.75}
              style={styles.starBtn}
            >
              <Ionicons
                name={star <= rating ? 'star' : 'star-outline'}
                size={36}
                color={COLORS.gold}
              />
            </TouchableOpacity>
          ))}
        </View>
        {rating > 0 && (
          <Text style={styles.ratingMessage}>{RATING_MESSAGES[rating]}</Text>
        )}

        {/* Plan another date */}
        <TouchableOpacity
          style={styles.planAgainBtn}
          onPress={() => navigation.navigate('WhoPlanning')}
          activeOpacity={0.7}
        >
          <Text style={styles.planAgainText}>Plan another date →</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.black,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 48,
  },
  dotsRow: {
    alignItems: 'center',
    paddingTop: 16,
    paddingBottom: 8,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dotActive: {
    backgroundColor: COLORS.deepRed,
    width: 20,
    borderRadius: 4,
  },
  dotInactive: {
    backgroundColor: COLORS.darkBorder,
  },
  iconSection: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 28,
    paddingBottom: 44,
  },
  iconWrapper: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    width: 90,
    height: 90,
  },
  iconStack: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  heartOverlay: {
    position: 'absolute',
    bottom: 4,
    right: -8,
  },
  sparkle: {
    position: 'absolute',
    fontSize: 13,
  },
  heading: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: 28,
    textAlign: 'center',
    marginBottom: 24,
  },
  summaryCard: {
    backgroundColor: COLORS.dark,
    borderWidth: 1,
    borderColor: COLORS.gold,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    gap: 10,
  },
  summaryTitle: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 4,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowIcon: {
    marginRight: 8,
  },
  summaryWhite: {
    color: COLORS.white,
    fontSize: 14,
  },
  summaryMuted: {
    color: COLORS.textMuted,
    fontSize: 13,
  },
  checklistCard: {
    backgroundColor: COLORS.dark,
    borderRadius: 12,
    padding: 20,
    marginBottom: 8,
  },
  checklistRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  checklistRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.darkBorder,
  },
  checkIcon: {
    marginRight: 12,
  },
  checkText: {
    color: COLORS.white,
    fontSize: 14,
  },
  tagline: {
    color: COLORS.gold,
    fontStyle: 'italic',
    fontSize: 14,
    textAlign: 'center',
    marginVertical: 16,
  },
  sectionLabel: {
    color: COLORS.gold,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 12,
    marginTop: 8,
  },
  transportRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 32,
  },
  transportBtn: {
    flex: 1,
    backgroundColor: COLORS.dark,
    borderWidth: 1,
    borderColor: COLORS.darkBorder,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  transportText: {
    color: COLORS.white,
    fontSize: 11,
    textAlign: 'center',
  },
  rateHeading: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 14,
  },
  starsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  starBtn: {
    padding: 4,
  },
  ratingMessage: {
    color: COLORS.gold,
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
    marginTop: 4,
  },
  planAgainBtn: {
    alignItems: 'center',
    paddingVertical: 20,
    marginTop: 8,
  },
  planAgainText: {
    color: COLORS.gold,
    fontSize: 15,
    fontWeight: '600',
  },
});
