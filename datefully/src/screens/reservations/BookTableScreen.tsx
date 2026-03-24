import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { Colors, Spacing, BorderRadius, Shadow } from '../../constants';
import { useAppStore } from '../../store';
import type { Reservation, Restaurant } from '../../types';
import type { ReservationsStackParamList } from '../../types';

// ─── Types ──────────────────────────────────────────────────────────────────

type Props = NativeStackScreenProps<ReservationsStackParamList, 'BookTable'>;

// ─── Helpers ─────────────────────────────────────────────────────────────────

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_LABELS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

/** Returns today + the next 6 days as Date objects (7 total). */
function buildNextSevenDays(): Date[] {
  const days: Date[] = [];
  const base = new Date();
  base.setHours(0, 0, 0, 0);
  for (let i = 0; i < 7; i++) {
    const d = new Date(base);
    d.setDate(base.getDate() + i);
    days.push(d);
  }
  return days;
}

/** Formats a Date as "YYYY-MM-DD". */
function toISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** Formats a Date as a human-readable string for the summary bar. */
function toDisplayDate(d: Date): string {
  return `${DAY_LABELS[d.getDay()]}, ${MONTH_LABELS[d.getMonth()]} ${d.getDate()}`;
}

/** Generates a confirmation code like "20241225-A3F9QZ". */
function generateConfirmationCode(date: Date): string {
  const dateStr = toISODate(date).replace(/-/g, '');
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let suffix = '';
  for (let i = 0; i < 6; i++) {
    suffix += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `${dateStr}-${suffix}`;
}

/** Returns availability label and colour for a slot. */
function availabilityMeta(
  available: number,
  total: number,
): { label: string; color: string } | null {
  if (available === 0) return { label: 'Full', color: Colors.error };
  const ratio = available / total;
  if (ratio < 0.3) {
    return { label: `${available} left`, color: Colors.warning };
  }
  return null;
}

// ─── Sub-components ──────────────────────────────────────────────────────────

interface DayCardProps {
  date: Date;
  isSelected: boolean;
  isToday: boolean;
  onPress: () => void;
}

const DayCard = React.memo(({ date, isSelected, isToday, onPress }: DayCardProps) => (
  <TouchableOpacity
    style={[styles.dayCard, isSelected && styles.dayCardSelected]}
    onPress={onPress}
    activeOpacity={0.75}
  >
    <Text style={[styles.dayLabel, isSelected && styles.dayLabelSelected]}>
      {isToday ? 'Today' : DAY_LABELS[date.getDay()]}
    </Text>
    <Text style={[styles.dayNumber, isSelected && styles.dayNumberSelected]}>
      {date.getDate()}
    </Text>
    {isSelected && <View style={styles.dayDot} />}
  </TouchableOpacity>
));

// ─── Main Screen ─────────────────────────────────────────────────────────────

export function BookTableScreen({ route, navigation }: Props) {
  const { restaurant } = route.params;
  const insets = useSafeAreaInsets();
  const addReservation = useAppStore((s) => s.addReservation);

  // ── State ────────────────────────────────────────────────────────────────
  const days = useMemo(() => buildNextSevenDays(), []);
  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(0);
  const [partySize, setPartySize] = useState<number>(2);
  const [selectedSlotTime, setSelectedSlotTime] = useState<string | null>(null);
  const [specialRequests, setSpecialRequests] = useState<string>('');

  const selectedDate = days[selectedDayIndex];

  // ── Derived ──────────────────────────────────────────────────────────────
  const summaryText = useMemo(() => {
    const datePart = toDisplayDate(selectedDate);
    const timePart = selectedSlotTime ?? '—';
    const sizePart = `${partySize} ${partySize === 1 ? 'guest' : 'guests'}`;
    return `${datePart}  ·  ${timePart}  ·  ${sizePart}`;
  }, [selectedDate, selectedSlotTime, partySize]);

  // ── Handlers ─────────────────────────────────────────────────────────────
  const decrementParty = useCallback(() => {
    setPartySize((prev) => Math.max(1, prev - 1));
  }, []);

  const incrementParty = useCallback(() => {
    setPartySize((prev) => Math.min(10, prev + 1));
  }, []);

  const handleConfirm = useCallback(() => {
    if (!selectedSlotTime) {
      Alert.alert('Select a Time', 'Please choose an available time slot to continue.');
      return;
    }

    const reservation: Reservation = {
      id: `res_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
      restaurantId: restaurant.id,
      restaurantName: restaurant.name,
      restaurantImage: restaurant.imageUrl,
      date: toISODate(selectedDate),
      time: selectedSlotTime,
      partySize,
      specialRequests: specialRequests.trim() || undefined,
      status: 'confirmed',
      confirmationCode: generateConfirmationCode(selectedDate),
      createdAt: new Date().toISOString(),
    };

    addReservation(reservation);
    navigation.navigate('ReservationConfirmation', { reservation });
  }, [
    selectedSlotTime,
    selectedDate,
    partySize,
    specialRequests,
    restaurant,
    addReservation,
    navigation,
  ]);

  // ── Layout ───────────────────────────────────────────────────────────────
  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={0}
    >
      {/* ── Header ── */}
      <View style={[styles.header, { paddingTop: insets.top + Spacing.sm }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.75}>
          <Ionicons name="arrow-back" size={22} color={Colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerRestaurant} numberOfLines={1}>
            {restaurant.name}
          </Text>
          <Text style={styles.headerTitle}>Book a Table</Text>
        </View>
        {/* Spacer to balance back button */}
        <View style={styles.backBtn} />
      </View>

      {/* ── Scrollable body ── */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 120 },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* ── Section: Date ── */}
        <Text style={styles.sectionTitle}>Select Date</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.daysRow}
        >
          {days.map((date, idx) => (
            <DayCard
              key={toISODate(date)}
              date={date}
              isSelected={idx === selectedDayIndex}
              isToday={idx === 0}
              onPress={() => setSelectedDayIndex(idx)}
            />
          ))}
        </ScrollView>

        {/* ── Section: Party Size ── */}
        <Text style={styles.sectionTitle}>Party Size</Text>
        <View style={styles.partySizeCard}>
          <View style={styles.partySizeLeft}>
            <Ionicons name="people" size={20} color={Colors.primary} />
            <Text style={styles.partySizeLabel}>Number of Guests</Text>
          </View>
          <View style={styles.partySizeControls}>
            <TouchableOpacity
              style={[styles.partyBtn, partySize <= 1 && styles.partyBtnDisabled]}
              onPress={decrementParty}
              disabled={partySize <= 1}
              activeOpacity={0.75}
            >
              <Ionicons
                name="remove"
                size={18}
                color={partySize <= 1 ? Colors.gray400 : Colors.primary}
              />
            </TouchableOpacity>
            <View style={styles.partyCountWrap}>
              <Text style={styles.partyCount}>{partySize}</Text>
            </View>
            <TouchableOpacity
              style={[styles.partyBtn, partySize >= 10 && styles.partyBtnDisabled]}
              onPress={incrementParty}
              disabled={partySize >= 10}
              activeOpacity={0.75}
            >
              <Ionicons
                name="add"
                size={18}
                color={partySize >= 10 ? Colors.gray400 : Colors.primary}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Section: Time Slots ── */}
        <Text style={styles.sectionTitle}>Available Times</Text>
        {restaurant.availableSlots.length === 0 ? (
          <View style={styles.emptySlots}>
            <Ionicons name="time-outline" size={36} color={Colors.gray400} />
            <Text style={styles.emptySlotsText}>No time slots available for this restaurant.</Text>
          </View>
        ) : (
          <View style={styles.slotsGrid}>
            {restaurant.availableSlots.map((slot, index) => {
              const isDisabled = slot.available === 0;
              const isSelected = slot.time === selectedSlotTime;
              const meta = availabilityMeta(slot.available, slot.total);
              const isRightColumn = index % 2 === 1;

              return (
                <TouchableOpacity
                  key={slot.time}
                  style={[
                    styles.slotCard,
                    isRightColumn && styles.slotCardRight,
                    isSelected && styles.slotCardSelected,
                    isDisabled && styles.slotCardDisabled,
                  ]}
                  onPress={() => !isDisabled && setSelectedSlotTime(slot.time)}
                  activeOpacity={isDisabled ? 1 : 0.75}
                  disabled={isDisabled}
                >
                  {isSelected ? (
                    <LinearGradient
                      colors={Colors.gradientPink as [string, string]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={StyleSheet.absoluteFill}
                    />
                  ) : null}
                  <Text
                    style={[
                      styles.slotTime,
                      isSelected && styles.slotTimeSelected,
                      isDisabled && styles.slotTextDisabled,
                    ]}
                  >
                    {slot.time}
                  </Text>
                  {meta && (
                    <View
                      style={[
                        styles.slotBadge,
                        {
                          backgroundColor: isSelected
                            ? 'rgba(255,255,255,0.25)'
                            : `${meta.color}1A`,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.slotBadgeText,
                          { color: isSelected ? Colors.white : meta.color },
                        ]}
                      >
                        {meta.label}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
            {/* Pad odd-length grid to keep left alignment */}
            {restaurant.availableSlots.length % 2 !== 0 && (
              <View style={[styles.slotCard, styles.slotCardRight, styles.slotCardGhost]} />
            )}
          </View>
        )}

        {/* ── Section: Special Requests ── */}
        <Text style={styles.sectionTitle}>Special Requests</Text>
        <View style={styles.textAreaWrap}>
          <TextInput
            style={styles.textArea}
            placeholder="Any dietary needs, allergies, or special occasions?"
            placeholderTextColor={Colors.inputPlaceholder}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            value={specialRequests}
            onChangeText={setSpecialRequests}
            maxLength={400}
          />
          <Text style={styles.charCount}>{specialRequests.length}/400</Text>
        </View>

        {/* ── Info strip ── */}
        <View style={styles.infoStrip}>
          <Ionicons name="information-circle-outline" size={16} color={Colors.textSecondary} />
          <Text style={styles.infoText}>
            Reservations are held for 15 minutes after the selected time. A confirmation will be sent to your account.
          </Text>
        </View>
      </ScrollView>

      {/* ── Bottom Bar ── */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + Spacing.md }]}>
        <View style={styles.summaryRow}>
          <Ionicons name="calendar-outline" size={15} color={Colors.textSecondary} style={{ marginRight: Spacing.xs }} />
          <Text style={styles.summaryText} numberOfLines={1}>
            {summaryText}
          </Text>
        </View>
        <TouchableOpacity onPress={handleConfirm} activeOpacity={0.85} style={styles.confirmBtnOuter}>
          <LinearGradient
            colors={Colors.gradientPink as [string, string, ...string[]]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.confirmBtn}
          >
            <Ionicons name="checkmark-circle-outline" size={20} color={Colors.white} style={{ marginRight: Spacing.sm }} />
            <Text style={styles.confirmBtnText}>Confirm Reservation</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const SLOT_GAP = Spacing.sm;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  // ── Header ──
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.base,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray100,
    ...Shadow.sm,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.gray100,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
  },
  headerRestaurant: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.primary,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
    letterSpacing: -0.3,
  },

  // ── Scroll ──
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: Spacing.lg,
    paddingHorizontal: Spacing.base,
  },

  // ── Section heading ──
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
    letterSpacing: -0.2,
    marginBottom: Spacing.md,
    marginTop: Spacing.lg,
  },

  // ── Day picker ──
  daysRow: {
    paddingBottom: Spacing.xs,
    paddingRight: Spacing.base,
  },
  dayCard: {
    width: 60,
    height: 76,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
    borderWidth: 1.5,
    borderColor: Colors.gray200,
    ...Shadow.sm,
  },
  dayCardSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
    ...Shadow.md,
  },
  dayLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: 4,
    letterSpacing: 0.3,
  },
  dayLabelSelected: {
    color: 'rgba(255,255,255,0.85)',
  },
  dayNumber: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.textPrimary,
    lineHeight: 26,
  },
  dayNumberSelected: {
    color: Colors.white,
  },
  dayDot: {
    width: 5,
    height: 5,
    borderRadius: BorderRadius.full,
    backgroundColor: 'rgba(255,255,255,0.7)',
    marginTop: 5,
  },

  // ── Party size ──
  partySizeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.gray200,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    ...Shadow.sm,
  },
  partySizeLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  partySizeLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  partySizeControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  partyBtn: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surfaceAlt,
    borderWidth: 1.5,
    borderColor: Colors.gray200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  partyBtnDisabled: {
    backgroundColor: Colors.gray100,
    borderColor: Colors.gray200,
  },
  partyCountWrap: {
    width: 44,
    alignItems: 'center',
  },
  partyCount: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.textPrimary,
    letterSpacing: -0.5,
  },

  // ── Time slots ──
  slotsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  slotCard: {
    width: '50%',
    paddingRight: SLOT_GAP,
    marginBottom: SLOT_GAP,
    // Inner card styling applied via inner view; here we use overflow+border
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.gray200,
    minHeight: 64,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    ...Shadow.sm,
  },
  slotCardRight: {
    paddingRight: 0,
    paddingLeft: SLOT_GAP,
  },
  slotCardSelected: {
    borderColor: Colors.primary,
    ...Shadow.md,
  },
  slotCardDisabled: {
    backgroundColor: Colors.gray50,
    borderColor: Colors.gray200,
    opacity: 0.6,
  },
  slotCardGhost: {
    backgroundColor: 'transparent',
    borderColor: 'transparent',
    elevation: 0,
    shadowOpacity: 0,
  },
  slotTime: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
    letterSpacing: -0.2,
    zIndex: 1,
  },
  slotTimeSelected: {
    color: Colors.white,
  },
  slotTextDisabled: {
    color: Colors.gray400,
  },
  slotBadge: {
    marginTop: 5,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
    zIndex: 1,
  },
  slotBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.2,
  },

  // ── Empty slots ──
  emptySlots: {
    alignItems: 'center',
    paddingVertical: Spacing['3xl'],
    gap: Spacing.sm,
  },
  emptySlotsText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    maxWidth: 220,
  },

  // ── Special requests ──
  textAreaWrap: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    borderWidth: 1.5,
    borderColor: Colors.inputBorder,
    overflow: 'hidden',
    ...Shadow.sm,
  },
  textArea: {
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
    fontSize: 14,
    color: Colors.textPrimary,
    minHeight: 100,
    lineHeight: 20,
  },
  charCount: {
    fontSize: 11,
    color: Colors.textMuted,
    textAlign: 'right',
    paddingRight: Spacing.base,
    paddingBottom: Spacing.sm,
  },

  // ── Info strip ──
  infoStrip: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: Spacing.base,
    backgroundColor: Colors.surfaceAlt,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    gap: Spacing.xs,
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 17,
  },

  // ── Bottom bar ──
  bottomBar: {
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.gray100,
    ...Shadow.lg,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  summaryText: {
    flex: 1,
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  confirmBtnOuter: {
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    ...Shadow.md,
  },
  confirmBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.base,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.xl,
  },
  confirmBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.white,
    letterSpacing: 0.2,
  },
});
