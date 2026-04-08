import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  Animated, ActivityIndicator, Dimensions,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, DateOption, DateStop, SelectedDate } from '../types';
import { useDateStore } from '../store';
import { generateDateOptions } from '../lib/claude';
import { Colors, Typography, Spacing, BorderRadius } from '../constants/theme';
import ScreenContainer from '../components/common/ScreenContainer';
import RomanticTipCard from '../components/common/RomanticTip';
import { getTip } from '../data/romanticTips';

type Props = { navigation: NativeStackNavigationProp<RootStackParamList, 'DateOptions'> };
const { width, height } = Dimensions.get('window');
const HEART_COUNT = 18;

// ── Heart rain ────────────────────────────────────────────────────────────────
function HeartRain({ visible, onDone }: { visible: boolean; onDone: () => void }) {
  const hearts = useRef(
    Array.from({ length: HEART_COUNT }, () => ({
      anim: new Animated.Value(0),
      x: (Math.random() - 0.5) * width * 0.7,
      delay: Math.random() * 500,
      scale: 0.7 + Math.random() * 0.8,
    }))
  ).current;

  useEffect(() => {
    if (!visible) return;
    Animated.parallel(
      hearts.map((h) =>
        Animated.sequence([
          Animated.delay(h.delay),
          Animated.timing(h.anim, { toValue: 1, duration: 1400, useNativeDriver: true }),
        ])
      )
    ).start(() => {
      hearts.forEach((h) => h.anim.setValue(0));
      onDone();
    });
  }, [visible]);

  if (!visible) return null;
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {hearts.map((h, i) => (
        <Animated.Text
          key={i}
          style={{
            position: 'absolute', left: width / 2 + h.x, fontSize: 24,
            transform: [
              { translateY: h.anim.interpolate({ inputRange: [0, 1], outputRange: [height * 0.7, height * 0.1] }) },
              { scale: h.scale },
            ],
            opacity: h.anim.interpolate({ inputRange: [0, 0.75, 1], outputRange: [1, 1, 0] }),
          }}
        >❤️</Animated.Text>
      ))}
    </View>
  );
}

// ── Stop arrow row ────────────────────────────────────────────────────────────
function StopRow({ stop, accent }: { stop: DateStop; accent: string }) {
  const dietaryColor = stop.dietaryVerified?.includes('Halal') ? '#27ae60' : stop.dietaryVerified?.includes('Vegan') ? '#2ecc71' : null;
  return (
    <View style={stopS.container}>
      <View style={[stopS.labelBadge, { backgroundColor: accent + '22', borderColor: accent }]}>
        <Text style={[stopS.labelText, { color: accent }]}>{stop.label}</Text>
      </View>
      <View style={stopS.details}>
        <Text style={stopS.venueName}>{stop.venueName}</Text>
        <View style={stopS.metaRow}>
          <Text style={stopS.meta}>{stop.venueType}</Text>
          {stop.time && <Text style={stopS.meta}>· {stop.time}</Text>}
          <Text style={stopS.meta}>· {stop.duration}</Text>
        </View>
        <View style={stopS.metaRow}>
          <Text style={stopS.cost}>{stop.estimatedCost}</Text>
          {stop.rating && <Text style={stopS.stars}>⭐ {stop.rating} ({stop.reviewCount})</Text>}
        </View>
        {dietaryColor && (
          <View style={[stopS.dietBadge, { borderColor: dietaryColor }]}>
            <Text style={[stopS.dietText, { color: dietaryColor }]}>✓ {stop.dietaryVerified}</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const stopS = StyleSheet.create({
  container: { flexDirection: 'row', gap: Spacing.sm, alignItems: 'flex-start', marginBottom: Spacing.sm },
  labelBadge: { borderWidth: 1, borderRadius: BorderRadius.sm, paddingHorizontal: 6, paddingVertical: 3, alignSelf: 'flex-start', marginTop: 2 },
  labelText: { fontSize: 9, fontWeight: Typography.bold, letterSpacing: 0.5 },
  details: { flex: 1 },
  venueName: { color: Colors.textPrimary, fontSize: Typography.base, fontWeight: Typography.semibold, marginBottom: 3 },
  metaRow: { flexDirection: 'row', gap: 5, flexWrap: 'wrap', marginBottom: 2 },
  meta: { color: Colors.textMuted, fontSize: Typography.xs },
  cost: { color: Colors.gold, fontSize: Typography.sm, fontWeight: Typography.semibold },
  stars: { color: Colors.textSecondary, fontSize: Typography.xs, marginLeft: 6 },
  dietBadge: { borderWidth: 1, borderRadius: BorderRadius.sm, paddingHorizontal: 6, paddingVertical: 2, alignSelf: 'flex-start', marginTop: 4 },
  dietText: { fontSize: Typography.xs, fontWeight: Typography.semibold },
});

// ── Date card ─────────────────────────────────────────────────────────────────
function DateCard({ option, onBook }: { option: DateOption; onBook: (o: DateOption) => void }) {
  const accent = option.type === 'splurge' ? Colors.gold : option.type === 'chill' ? Colors.success : Colors.red;
  return (
    <View style={[card.container, { borderTopColor: accent }]}>
      <View style={[card.badge, { backgroundColor: accent + '20', borderColor: accent }]}>
        <Text style={card.badgeEmoji}>{option.typeEmoji}</Text>
        <Text style={[card.badgeText, { color: accent }]}>{option.typeLabel}</Text>
      </View>

      <Text style={card.title}>{option.title}</Text>
      <Text style={card.desc}>{option.description}</Text>

      {/* Full arc */}
      <View style={card.arc}>
        {option.stops?.map((stop, i) => (
          <React.Fragment key={stop.label}>
            <StopRow stop={stop} accent={accent} />
            {i < (option.stops?.length ?? 0) - 1 && (
              <View style={card.arrow}><Text style={[card.arrowText, { color: accent }]}>↓</Text></View>
            )}
          </React.Fragment>
        ))}
      </View>

      <View style={card.footer}>
        <View>
          <Text style={card.totalLabel}>Total Est.</Text>
          <Text style={card.totalCost}>{option.estimatedCost}</Text>
        </View>
        {option.dietaryBadge && (
          <View style={card.dietaryBadge}>
            <Text style={card.dietaryBadgeText}>✓ {option.dietaryBadge}</Text>
          </View>
        )}
        <TouchableOpacity style={[card.bookBtn, { backgroundColor: accent === Colors.gold ? Colors.red : accent }]} onPress={() => onBook(option)} activeOpacity={0.85}>
          <Text style={card.bookBtnText}>Book it 🎯</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const card = StyleSheet.create({
  container: { backgroundColor: Colors.card, borderRadius: BorderRadius.xl, borderTopWidth: 3, borderWidth: 1, borderColor: Colors.cardBorder, padding: Spacing.xl, marginBottom: Spacing.lg },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 5, borderWidth: 1, borderRadius: BorderRadius.pill, paddingHorizontal: Spacing.sm, paddingVertical: 4, alignSelf: 'flex-start', marginBottom: Spacing.md },
  badgeEmoji: { fontSize: 13 },
  badgeText: { fontSize: Typography.xs, fontWeight: Typography.bold, textTransform: 'uppercase', letterSpacing: 0.5 },
  title: { fontFamily: Typography.heading, fontSize: Typography.xl, color: Colors.textPrimary, marginBottom: Spacing.xs },
  desc: { color: Colors.textSecondary, fontSize: Typography.sm, lineHeight: 20, marginBottom: Spacing.lg },
  arc: { marginBottom: Spacing.md },
  arrow: { alignItems: 'center', marginVertical: 2 },
  arrowText: { fontSize: 18, fontWeight: Typography.bold },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: Spacing.sm, borderTopWidth: 1, borderTopColor: Colors.cardBorder, paddingTop: Spacing.md },
  totalLabel: { color: Colors.textMuted, fontSize: Typography.xs },
  totalCost: { color: Colors.gold, fontSize: Typography.lg, fontWeight: Typography.bold },
  dietaryBadge: { backgroundColor: 'rgba(39,174,96,0.1)', borderWidth: 1, borderColor: '#27ae60', borderRadius: BorderRadius.pill, paddingHorizontal: Spacing.sm, paddingVertical: 4 },
  dietaryBadgeText: { color: '#27ae60', fontSize: Typography.xs, fontWeight: Typography.semibold },
  bookBtn: { borderRadius: BorderRadius.md, paddingVertical: Spacing.sm, paddingHorizontal: Spacing.lg, alignItems: 'center' },
  bookBtnText: { color: Colors.white, fontSize: Typography.sm, fontWeight: Typography.bold },
});

// ── Main screen ───────────────────────────────────────────────────────────────
function randConfNum() { return String(Math.floor(100000 + Math.random() * 900000)); }

export default function DateOptionsScreen({ navigation }: Props) {
  const { userName, userCity, budget, timeOfDay, occasion, planningFor, partnerProfile, weatherData, dateOptions, setDateOptions, setSelectedDate, setBookingTime } = useDateStore();
  const [loading, setLoading] = useState(dateOptions.length === 0);
  const [heartVisible, setHeartVisible] = useState(false);
  const tip = getTip('dateOptions', planningFor === 'two_men' ? 'him' : planningFor === 'two_women' ? 'her' : 'both');

  useEffect(() => { if (dateOptions.length === 0) load(); }, []);

  const load = async () => {
    setLoading(true);
    try {
      const opts = await generateDateOptions(userName, userCity, budget, timeOfDay, occasion || 'Just Because', planningFor, partnerProfile, weatherData);
      setDateOptions(opts);
    } catch { /* fallback already returned from generateDateOptions */ }
    finally { setLoading(false); }
  };

  const handleBook = (opt: DateOption) => {
    const sel: SelectedDate = { option: opt, bookedAt: new Date(), confirmationNumber: randConfNum() };
    setSelectedDate(sel);
    setBookingTime(Date.now());
    setHeartVisible(true);
  };

  return (
    <ScreenContainer>
      <HeartRain visible={heartVisible} onDone={() => { setHeartVisible(false); navigation.navigate('InvitationCard'); }} />
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Text style={s.back}>← Back</Text></TouchableOpacity>
        <Text style={s.title}>Your Date Plans</Text>
        <Text style={s.sub}>Three options, fully planned for you</Text>
      </View>

      {loading ? (
        <View style={s.loading}>
          <ActivityIndicator size="large" color={Colors.gold} />
          <Text style={s.loadingText}>Crafting your perfect dates...</Text>
          <Text style={s.loadingSub}>This takes a moment ✨</Text>
        </View>
      ) : (
        <ScrollView style={{ flex: 1 }} contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
          {dateOptions.map((opt) => <DateCard key={opt.id} option={opt} onBook={handleBook} />)}
          <TouchableOpacity style={s.replanBtn} onPress={load} activeOpacity={0.8}>
            <Text style={s.replanText}>🔄  None of these — try again</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.vendorLink} onPress={() => navigation.navigate('VendorMarketplace')} activeOpacity={0.8}>
            <Text style={s.vendorLinkText}>Browse Date-Night Partners →</Text>
          </TouchableOpacity>
          <RomanticTipCard tip={tip} />
        </ScrollView>
      )}
    </ScreenContainer>
  );
}

const s = StyleSheet.create({
  header: { paddingHorizontal: Spacing.screen, paddingTop: Spacing.md, paddingBottom: Spacing.lg, borderBottomWidth: 1, borderBottomColor: Colors.cardBorder },
  back: { color: Colors.gold, fontSize: Typography.base, marginBottom: Spacing.sm },
  title: { fontFamily: Typography.heading, fontSize: Typography.xxl, color: Colors.textPrimary, marginBottom: 4 },
  sub: { color: Colors.textSecondary, fontSize: Typography.sm },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.md },
  loadingText: { color: Colors.textPrimary, fontSize: Typography.lg, fontFamily: Typography.heading },
  loadingSub: { color: Colors.textMuted, fontSize: Typography.sm },
  scroll: { padding: Spacing.screen, paddingBottom: Spacing.xxxl },
  replanBtn: { alignItems: 'center', padding: Spacing.lg, backgroundColor: Colors.card, borderRadius: BorderRadius.lg, borderWidth: 1, borderColor: Colors.cardBorder, marginBottom: Spacing.md },
  replanText: { color: Colors.textSecondary, fontSize: Typography.base, fontWeight: Typography.semibold },
  vendorLink: { alignItems: 'center', paddingVertical: Spacing.md, marginBottom: Spacing.md },
  vendorLinkText: { color: Colors.gold, fontSize: Typography.base, fontWeight: Typography.semibold },
});
