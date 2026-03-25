import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const BLACK = '#000000';
const DEEP_RED = '#C0392B';
const GOLD = '#C9A84C';
const WHITE = '#FFFFFF';
const DARK = '#111111';
const BORDER = '#2A2A2A';
const MUTED = '#888888';

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

interface Props {
  navigation: any;
  route: any;
}

export default function ConfirmationScreen({ navigation, route }: Props) {
  const insets = useSafeAreaInsets();
  const params = route?.params || {};
  const hasVendors = params.vendors && params.vendors.length > 0;

  const floatY = useRef(new Animated.Value(0)).current;
  const sparkleRot = useRef(new Animated.Value(0)).current;
  const checkAnims = useRef([0, 1, 2, 3].map(() => ({
    x: new Animated.Value(-20),
    opacity: new Animated.Value(0),
  }))).current;

  const [rating, setRating] = useState(0);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatY, { toValue: -8, duration: 1200, useNativeDriver: true }),
        Animated.timing(floatY, { toValue: 0, duration: 1200, useNativeDriver: true }),
      ])
    ).start();

    Animated.loop(
      Animated.timing(sparkleRot, { toValue: 1, duration: 4000, useNativeDriver: true })
    ).start();

    checkAnims.forEach((a, i) => {
      Animated.parallel([
        Animated.timing(a.x, { toValue: 0, duration: 300, delay: 300 + i * 150, useNativeDriver: true }),
        Animated.timing(a.opacity, { toValue: 1, duration: 300, delay: 300 + i * 150, useNativeDriver: true }),
      ]).start();
    });
  }, []);

  const sparkleRotInterp = sparkleRot.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  const checklist = [
    { label: 'Confirmation email sent', show: true },
    { label: 'Added to calendar', show: true },
    { label: 'Invitation card sent', show: true },
    { label: 'Vendor extras confirmed', show: hasVendors },
  ];

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={[styles.scroll, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 40 }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Progress dots */}
      <View style={styles.dots}>
        {Array.from({ length: 9 }).map((_, i) => (
          <View key={i} style={[styles.dot, i === 8 ? styles.dotActive : styles.dotInactive]} />
        ))}
      </View>

      {/* Floating icon */}
      <Animated.View style={[styles.iconWrap, { transform: [{ translateY: floatY }] }]}>
        <View style={styles.iconStack}>
          <Ionicons name="location" size={52} color={DEEP_RED} />
          <View style={styles.heartBadge}>
            <Ionicons name="heart" size={20} color={GOLD} />
          </View>
        </View>
        {['✨', '⭐', '✨', '💫'].map((s, i) => {
          const angle = (i / 4) * Math.PI * 2;
          return (
            <Animated.Text
              key={i}
              style={[
                styles.sparkle,
                {
                  transform: [
                    { rotate: sparkleRotInterp },
                    { translateX: Math.cos(angle) * 42 },
                    { translateY: Math.sin(angle) * 42 },
                  ],
                },
              ]}
            >
              {s}
            </Animated.Text>
          );
        })}
      </Animated.View>

      <Text style={styles.heading}>You're all set 🎉</Text>

      {/* Summary card */}
      <View style={styles.summaryCard}>
        <Text style={styles.dateName}>The Perfect Night Out</Text>
        <View style={styles.row}>
          <Ionicons name="calendar-outline" size={16} color={GOLD} />
          <Text style={styles.summaryText}>  Saturday, March 28th · 7:00 PM</Text>
        </View>
        <View style={styles.row}>
          <Ionicons name="location-outline" size={16} color={GOLD} />
          <Text style={[styles.summaryText, { color: MUTED }]}>  Philadelphia, PA</Text>
        </View>
      </View>

      {/* Checklist */}
      <View style={styles.checklist}>
        {checklist.map((item, i) => {
          if (!item.show) return null;
          return (
            <Animated.View
              key={item.label}
              style={[
                styles.checkRow,
                {
                  transform: [{ translateX: checkAnims[i].x }],
                  opacity: checkAnims[i].opacity,
                },
              ]}
            >
              <Ionicons name="checkmark-circle" size={20} color={GOLD} />
              <Text style={styles.checkText}>{item.label}</Text>
            </Animated.View>
          );
        })}
      </View>

      <Text style={styles.tagline}>We got you — focus on the moment.</Text>

      {/* GET THERE */}
      <Text style={styles.sectionLabel}>GET THERE</Text>
      <View style={styles.transportRow}>
        {TRANSPORT.map((t) => (
          <TouchableOpacity
            key={t.label}
            style={styles.transportBtn}
            onPress={() => t.url && Linking.openURL(t.url).catch(() => {})}
            activeOpacity={0.8}
          >
            <Text style={styles.transportText}>{t.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* RATE */}
      <Text style={styles.rateHeading}>Rate Your Date</Text>
      <View style={styles.starsRow}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity key={star} onPress={() => setRating(star)} activeOpacity={0.7}>
            <Ionicons name={star <= rating ? 'star' : 'star-outline'} size={38} color={star <= rating ? GOLD : BORDER} />
          </TouchableOpacity>
        ))}
      </View>
      {rating > 0 && (
        <Text style={styles.ratingMsg}>{RATING_MESSAGES[rating]}</Text>
      )}

      <TouchableOpacity style={styles.planAgain} onPress={() => navigation.navigate('WhoPlanning')}>
        <Text style={styles.planAgainText}>Plan another date →</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: BLACK },
  scroll: { paddingHorizontal: 20, alignItems: 'center' },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 5, marginBottom: 24 },
  dot: { height: 6, borderRadius: 3 },
  dotActive: { width: 20, backgroundColor: GOLD },
  dotInactive: { width: 6, backgroundColor: '#333' },
  iconWrap: { alignItems: 'center', justifyContent: 'center', width: 120, height: 120, marginBottom: 16 },
  iconStack: { position: 'relative', alignItems: 'center', justifyContent: 'center' },
  heartBadge: { position: 'absolute', bottom: -4, right: -8 },
  sparkle: { position: 'absolute', fontSize: 14 },
  heading: { color: WHITE, fontSize: 28, fontWeight: 'bold', textAlign: 'center', marginBottom: 24 },
  summaryCard: {
    width: '100%', backgroundColor: DARK, borderRadius: 16,
    borderWidth: 1.5, borderColor: GOLD, padding: 20, marginBottom: 16, gap: 10,
  },
  dateName: { color: WHITE, fontSize: 18, fontWeight: 'bold', marginBottom: 4 },
  row: { flexDirection: 'row', alignItems: 'center' },
  summaryText: { color: WHITE, fontSize: 14 },
  checklist: {
    width: '100%', backgroundColor: DARK, borderRadius: 12,
    padding: 20, marginBottom: 16, gap: 14,
  },
  checkRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  checkText: { color: WHITE, fontSize: 14 },
  tagline: { color: GOLD, fontSize: 14, fontStyle: 'italic', textAlign: 'center', marginVertical: 16 },
  sectionLabel: {
    color: GOLD, fontSize: 11, fontWeight: '700', letterSpacing: 2,
    textTransform: 'uppercase', alignSelf: 'flex-start', marginBottom: 12,
  },
  transportRow: { flexDirection: 'row', gap: 6, width: '100%', marginBottom: 32 },
  transportBtn: {
    flex: 1, backgroundColor: DARK, borderWidth: 1, borderColor: BORDER,
    borderRadius: 12, paddingVertical: 12, alignItems: 'center',
  },
  transportText: { color: WHITE, fontSize: 10, textAlign: 'center' },
  rateHeading: { color: WHITE, fontSize: 18, fontWeight: 'bold', marginBottom: 14, alignSelf: 'flex-start' },
  starsRow: { flexDirection: 'row', gap: 8, marginBottom: 12, alignSelf: 'flex-start' },
  ratingMsg: { color: GOLD, fontSize: 14, textAlign: 'center', marginBottom: 16 },
  planAgain: { marginTop: 8, paddingVertical: 16 },
  planAgainText: { color: GOLD, fontSize: 15, fontWeight: '600' },
});
