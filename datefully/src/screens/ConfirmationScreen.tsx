// ─── Screen 10 — Confirmation ─────────────────────────────────────────────────
import React, { useEffect, useState, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  Alert, Dimensions, Animated,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, TransportMode, DateStop } from '../types';
import { useDateStore } from '../store';
import { openTransportApp } from '../lib/booking';
import { Colors, Typography, Spacing, BorderRadius } from '../constants/theme';
import ScreenContainer from '../components/common/ScreenContainer';

type Props = { navigation: NativeStackNavigationProp<RootStackParamList, 'Confirmation'> };

const { width } = Dimensions.get('window');

// ─── Transport options (incl. limo) ──────────────────────────────────────────
const TRANSPORT_OPTIONS: { mode: TransportMode; emoji: string; label: string; premium?: boolean }[] = [
  { mode: 'walk', emoji: '🚶', label: 'Walk' },
  { mode: 'uber', emoji: '🚗', label: 'Uber' },
  { mode: 'lyft', emoji: '🚙', label: 'Lyft' },
  { mode: 'transit', emoji: '🚌', label: 'Transit' },
  { mode: 'taxi', emoji: '🚕', label: 'Taxi' },
  { mode: 'limo', emoji: '🚐', label: 'Limo', premium: true },
];

// ─── Countdown hook ───────────────────────────────────────────────────────────
function useCountdown(targetMs: number | null) {
  const [diff, setDiff] = useState(0);
  useEffect(() => {
    if (!targetMs) return;
    const tick = () => setDiff(Math.max(0, targetMs - Date.now()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [targetMs]);

  const days = Math.floor(diff / 86_400_000);
  const hours = Math.floor((diff % 86_400_000) / 3_600_000);
  const mins = Math.floor((diff % 3_600_000) / 60_000);
  const secs = Math.floor((diff % 60_000) / 1000);
  return { days, hours, mins, secs, diff };
}

// ─── Star rating component ────────────────────────────────────────────────────
function StarRatingUI({ onSubmit }: { onSubmit: (stars: number) => void }) {
  const [selected, setSelected] = useState(0);
  return (
    <View style={rStyles.wrap}>
      <Text style={rStyles.title}>How was your date? ⭐</Text>
      <View style={rStyles.stars}>
        {[1, 2, 3, 4, 5].map((s) => (
          <TouchableOpacity key={s} onPress={() => setSelected(s)} activeOpacity={0.8}>
            <Text style={[rStyles.star, s <= selected && rStyles.starOn]}>
              {s <= selected ? '★' : '☆'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      {selected > 0 && (
        <TouchableOpacity style={rStyles.btn} onPress={() => onSubmit(selected)} activeOpacity={0.85}>
          <Text style={rStyles.btnText}>Submit Rating</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
const rStyles = StyleSheet.create({
  wrap: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.gold,
    marginBottom: Spacing.lg,
    alignItems: 'center',
    gap: Spacing.md,
  },
  title: { fontFamily: Typography.heading, fontSize: Typography.lg, color: Colors.textPrimary },
  stars: { flexDirection: 'row', gap: Spacing.sm },
  star: { fontSize: 36, color: Colors.cardBorder },
  starOn: { color: Colors.gold },
  btn: {
    backgroundColor: Colors.red,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.xl,
  },
  btnText: { color: Colors.white, fontWeight: Typography.bold, fontSize: Typography.base },
});

// ─── Main screen ──────────────────────────────────────────────────────────────
export default function ConfirmationScreen({ navigation }: Props) {
  const { selectedDate, userEmail, userCity } = useDateStore() as any;
  const [selectedTransport, setSelectedTransport] = useState<TransportMode | null>(null);
  const [ratingSubmitted, setRatingSubmitted] = useState(false);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Target = the booked date (default to 3 days from now for demo)
  const targetMs = selectedDate?.bookedAt
    ? new Date(selectedDate.bookedAt).getTime() + 3 * 24 * 3600 * 1000 // 3 days after booking
    : Date.now() + 3 * 24 * 3600 * 1000;
  const { days, hours, mins, secs, diff } = useCountdown(targetMs);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.05, duration: 800, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      ]),
    ).start();
  }, []);

  if (!selectedDate) {
    return (
      <ScreenContainer>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>No booking found.</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Splash')}>
            <Text style={styles.goldLink}>Start over</Text>
          </TouchableOpacity>
        </View>
      </ScreenContainer>
    );
  }

  const { option, confirmationNumber, bookedAt } = selectedDate;
  const stops: DateStop[] = option.stops ?? [];
  const hasStops = stops.length > 0;

  const dateStr = bookedAt
    ? new Date(bookedAt).toLocaleDateString('en-US', {
        weekday: 'long', month: 'long', day: 'numeric',
      })
    : 'Upcoming';
  const timeStr = bookedAt
    ? new Date(bookedAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    : '';

  // First venue parking info
  const firstStop = stops[0];
  const parkingInfo = option.stops?.[0]?.venueName
    ? `Parking near ${firstStop.venueName}: check Google Maps for nearby garages or street parking.`
    : null;

  async function handleTransport(mode: TransportMode) {
    if (mode === 'limo') {
      Alert.alert(
        '🚐 Limo Service',
        'Book a luxury limo through our partners for a truly unforgettable arrival. Feature coming soon!',
        [{ text: 'Got it' }],
      );
      setSelectedTransport(mode);
      return;
    }
    setSelectedTransport(mode);
    await openTransportApp(mode, option.address || userCity || 'Philadelphia, PA');
  }

  function handleAddToCalendar() {
    Alert.alert(
      'Add to Calendar',
      `"${option.title}" added for ${dateStr}.`,
      [{ text: 'OK' }],
    );
  }

  function handleRating(stars: number) {
    setRatingSubmitted(true);
    Alert.alert('Thank you!', `You rated your date ${stars} star${stars !== 1 ? 's' : ''}. We hope it was magical! 💛`);
  }

  // Parse cost string to number helper
  function parseCost(s?: string): number {
    if (!s) return 0;
    const match = s.replace(/[$,]/g, '').match(/[\d.]+/);
    return match ? parseFloat(match[0]) : 0;
  }

  const stopTotal = hasStops
    ? stops.reduce((sum, s) => sum + parseCost(s.estimatedCost), 0)
    : parseCost(option.estimatedCost);

  return (
    <ScreenContainer>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {/* Header */}
        <View style={styles.header}>
          <Animated.Text style={[styles.headerEmoji, { transform: [{ scale: pulseAnim }] }]}>
            🎉
          </Animated.Text>
          <Text style={styles.title}>You're All Set!</Text>
          <Text style={styles.subtitle}>
            Your date is confirmed{userCity ? ` in ${userCity}` : ''}
          </Text>
        </View>

        {/* Confirmation number */}
        <View style={styles.confNumRow}>
          <Text style={styles.confLabel}>Confirmation</Text>
          <Text style={styles.confNum}>{confirmationNumber ?? 'DTF-000000'}</Text>
        </View>

        {/* ── Countdown timer ── */}
        {diff > 0 && (
          <View style={styles.countdownCard}>
            <Text style={styles.countdownTitle}>Date starts in</Text>
            <View style={styles.countdownRow}>
              {[
                { val: days, unit: 'days' },
                { val: hours, unit: 'hrs' },
                { val: mins, unit: 'min' },
                { val: secs, unit: 'sec' },
              ].map(({ val, unit }) => (
                <View key={unit} style={styles.countdownCell}>
                  <Text style={styles.countdownNum}>{String(val).padStart(2, '0')}</Text>
                  <Text style={styles.countdownUnit}>{unit}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* ── Full cost breakdown ── */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Cost Breakdown</Text>
          {hasStops ? (
            stops.map((stop, i) => (
              <View key={i} style={styles.costRow}>
                <View style={styles.costLeft}>
                  <Text style={styles.stopLabel}>{stop.label}</Text>
                  <Text style={styles.stopName}>{stop.venueName}</Text>
                  <Text style={styles.stopMeta}>{stop.venueType} · {stop.duration}</Text>
                </View>
                <Text style={styles.costAmount}>{stop.estimatedCost}</Text>
              </View>
            ))
          ) : (
            <View style={styles.costRow}>
              <Text style={styles.stopName}>{option.title}</Text>
              <Text style={styles.costAmount}>{option.estimatedCost}</Text>
            </View>
          )}
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalAmount}>${stopTotal.toFixed(0)}</Text>
          </View>
        </View>

        {/* ── Date details ── */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Date Details</Text>
          {[
            { label: 'Date', value: `${dateStr}${timeStr ? ` · ${timeStr}` : ''}` },
            { label: 'Dress Code', value: option.dressCode ?? 'Smart Casual' },
            { label: 'Confirmation #', value: confirmationNumber ?? 'DTF-000000', gold: true },
          ].map(({ label, value, gold }) => (
            <View key={label} style={styles.detailRow}>
              <Text style={styles.detailLabel}>{label}</Text>
              <Text style={[styles.detailValue, gold && { color: Colors.gold }]}>{value}</Text>
            </View>
          ))}
        </View>

        {/* ── Parking info ── */}
        {(parkingInfo || firstStop) && (
          <View style={styles.parkingCard}>
            <Text style={styles.parkingTitle}>🅿️ Parking Info</Text>
            <Text style={styles.parkingText}>
              {parkingInfo ?? `Check Google Maps for parking near ${firstStop?.venueName}.`}
            </Text>
          </View>
        )}

        {/* Email confirmation */}
        {userEmail ? (
          <View style={styles.emailBox}>
            <Text style={styles.emailIcon}>✉️</Text>
            <Text style={styles.emailText}>Confirmation sent to {userEmail}</Text>
          </View>
        ) : null}

        {/* ── Transport ── */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Getting There</Text>
          <View style={styles.transportGrid}>
            {TRANSPORT_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt.mode}
                style={[
                  styles.transportBtn,
                  selectedTransport === opt.mode && styles.transportBtnActive,
                  opt.premium && styles.transportBtnPremium,
                ]}
                onPress={() => handleTransport(opt.mode)}
                activeOpacity={0.8}
              >
                <Text style={styles.transportEmoji}>{opt.emoji}</Text>
                <Text
                  style={[
                    styles.transportLabel,
                    selectedTransport === opt.mode && styles.transportLabelActive,
                    opt.premium && styles.transportLabelPremium,
                  ]}
                >
                  {opt.label}
                </Text>
                {opt.premium && <Text style={styles.premiumTag}>✦</Text>}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Add to calendar */}
        <TouchableOpacity style={styles.calBtn} onPress={handleAddToCalendar} activeOpacity={0.85}>
          <Text style={styles.calBtnText}>📅  Add to Calendar</Text>
        </TouchableOpacity>

        {/* Rating */}
        {!ratingSubmitted ? (
          <StarRatingUI onSubmit={handleRating} />
        ) : (
          <View style={styles.ratingDone}>
            <Text style={styles.ratingDoneText}>Rating submitted — thanks! 💛</Text>
          </View>
        )}

        {/* Footer */}
        <Text style={styles.footerTitle}>Thank you for using Datefully</Text>
        <Text style={styles.footerSub}>Made with love for {userCity ?? 'Philadelphia'}</Text>

        <TouchableOpacity
          style={styles.newDateBtn}
          onPress={() => navigation.navigate('WhosPlanning')}
          activeOpacity={0.8}
        >
          <Text style={styles.newDateText}>Plan Another Date</Text>
        </TouchableOpacity>

        <View style={{ height: 32 }} />
      </ScrollView>
    </ScreenContainer>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  scroll: { padding: Spacing.screen, paddingBottom: Spacing.xxxl },

  header: { alignItems: 'center', paddingTop: Spacing.lg, paddingBottom: Spacing.xl },
  headerEmoji: { fontSize: 52, marginBottom: Spacing.sm },
  title: {
    fontFamily: Typography.heading,
    fontSize: Typography.xxxl,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
    textAlign: 'center',
  },
  subtitle: { fontSize: Typography.base, color: Colors.textSecondary, textAlign: 'center' },

  confNumRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.gold,
  },
  confLabel: { fontSize: Typography.sm, color: Colors.textMuted },
  confNum: { fontSize: Typography.base, color: Colors.gold, fontWeight: Typography.bold },

  // Countdown
  countdownCard: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    marginBottom: Spacing.lg,
    alignItems: 'center',
    gap: Spacing.sm,
  },
  countdownTitle: { fontSize: Typography.sm, color: Colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5 },
  countdownRow: { flexDirection: 'row', gap: Spacing.md },
  countdownCell: { alignItems: 'center', minWidth: 52 },
  countdownNum: {
    fontFamily: Typography.heading,
    fontSize: Typography.xxl,
    color: Colors.gold,
    lineHeight: 32,
  },
  countdownUnit: { fontSize: Typography.xs, color: Colors.textMuted },

  // Section card
  sectionCard: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    padding: Spacing.xl,
    marginBottom: Spacing.lg,
    gap: Spacing.sm,
  },
  sectionTitle: {
    fontFamily: Typography.heading,
    fontSize: Typography.md,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },

  // Cost breakdown
  costRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: Spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: Colors.cardBorder,
  },
  costLeft: { flex: 1 },
  stopLabel: {
    fontSize: 9,
    color: Colors.gold,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  stopName: { fontSize: Typography.sm, color: Colors.textPrimary, fontWeight: Typography.semibold },
  stopMeta: { fontSize: Typography.xs, color: Colors.textMuted, marginTop: 2 },
  costAmount: { fontSize: Typography.sm, color: Colors.textPrimary, fontWeight: Typography.semibold },

  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: Spacing.sm,
    marginTop: Spacing.xs,
  },
  totalLabel: {
    fontFamily: Typography.heading,
    fontSize: Typography.base,
    color: Colors.textPrimary,
  },
  totalAmount: {
    fontFamily: Typography.heading,
    fontSize: Typography.lg,
    color: Colors.gold,
  },

  // Details
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: Spacing.md,
    paddingVertical: 4,
  },
  detailLabel: { fontSize: Typography.sm, color: Colors.textMuted, flex: 0.4 },
  detailValue: {
    fontSize: Typography.sm,
    color: Colors.textPrimary,
    fontWeight: Typography.semibold,
    flex: 0.6,
    textAlign: 'right',
  },

  // Parking
  parkingCard: {
    backgroundColor: 'rgba(201,168,76,0.06)',
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: 'rgba(201,168,76,0.2)',
    padding: Spacing.md,
    marginBottom: Spacing.lg,
    gap: 6,
  },
  parkingTitle: { fontSize: Typography.sm, color: Colors.gold, fontWeight: Typography.semibold },
  parkingText: { fontSize: Typography.sm, color: Colors.textSecondary, lineHeight: 20 },

  emailBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.cardAlt,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
  },
  emailIcon: { fontSize: 18 },
  emailText: { color: Colors.textSecondary, fontSize: Typography.sm, flex: 1 },

  // Transport
  transportGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  transportBtn: {
    backgroundColor: Colors.cardAlt,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    alignItems: 'center',
    minWidth: (width - Spacing.screen * 2 - Spacing.xl * 2 - Spacing.sm * 2) / 3 - 2,
    gap: 4,
  },
  transportBtnActive: {
    borderColor: Colors.gold,
    backgroundColor: 'rgba(201,168,76,0.12)',
  },
  transportBtnPremium: {
    borderColor: '#7C3AED',
    backgroundColor: 'rgba(124,58,237,0.08)',
  },
  transportEmoji: { fontSize: 22 },
  transportLabel: { fontSize: Typography.xs, color: Colors.textSecondary, fontWeight: Typography.medium },
  transportLabelActive: { color: Colors.gold, fontWeight: Typography.semibold },
  transportLabelPremium: { color: '#A78BFA' },
  premiumTag: { fontSize: 10, color: '#A78BFA' },

  calBtn: {
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  calBtnText: { color: Colors.textPrimary, fontSize: Typography.base, fontWeight: Typography.semibold },

  ratingDone: { alignItems: 'center', paddingVertical: Spacing.md, marginBottom: Spacing.lg },
  ratingDoneText: { color: Colors.gold, fontSize: Typography.base, fontWeight: Typography.semibold },

  footerTitle: {
    textAlign: 'center',
    color: Colors.textMuted,
    fontSize: Typography.sm,
    marginTop: Spacing.xl,
    fontFamily: Typography.heading,
  },
  footerSub: {
    textAlign: 'center',
    color: Colors.textMuted,
    fontSize: Typography.xs,
    marginTop: 4,
    marginBottom: Spacing.xl,
  },
  newDateBtn: {
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.md,
    alignItems: 'center',
  },
  newDateText: { color: Colors.textSecondary, fontSize: Typography.base },

  errorContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.md },
  errorText: { color: Colors.textSecondary, fontSize: Typography.base },
  goldLink: { color: Colors.gold, fontSize: Typography.base, fontWeight: Typography.semibold },
});
