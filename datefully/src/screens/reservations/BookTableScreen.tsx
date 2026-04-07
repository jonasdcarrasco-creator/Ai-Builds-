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
import type { Reservation, TimeSlot } from '../../types';
import type { ReservationsStackParamList } from '../../types';

// ─── Screen props ─────────────────────────────────────────────────────────────

type Props = NativeStackScreenProps<ReservationsStackParamList, 'BookTable'>;

// ─── Day-option shape ─────────────────────────────────────────────────────────

interface DayOption {
  /** JS Date object (midnight local time). */
  date: Date;
  /** Three-letter abbreviation, e.g. "Mon". */
  shortDay: string;
  /** Numeric day-of-month string, e.g. "24". */
  dayNumber: string;
  /** ISO 8601 date string "YYYY-MM-DD". */
  iso: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const SHORT_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const LONG_DAYS = [
  'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday',
];
const LONG_MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
const SHORT_MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

const MAX_GUESTS = 10;
const MIN_GUESTS = 1;
const MAX_REQUEST_LENGTH = 400;
/** Slot is considered "scarce" when < 30 % of capacity remains. */
const SCARCITY_THRESHOLD = 0.3;

// ─── Pure helpers ─────────────────────────────────────────────────────────────

/** Builds an array of 7 DayOption objects starting from today. */
function buildWeek(): DayOption[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return {
      date: d,
      shortDay: SHORT_DAYS[d.getDay()],
      dayNumber: String(d.getDate()),
      iso: `${y}-${m}-${day}`,
    };
  });
}

/** Formats a DayOption for the booking summary text. */
function formatSummaryDate(opt: DayOption): string {
  return `${SHORT_DAYS[opt.date.getDay()]}, ${SHORT_MONTHS[opt.date.getMonth()]} ${opt.date.getDate()}`;
}

/** Formats a DayOption for the booking summary card. */
function formatLongDate(opt: DayOption): string {
  return `${LONG_DAYS[opt.date.getDay()]}, ${LONG_MONTHS[opt.date.getMonth()]} ${opt.date.getDate()}`;
}

/** Generates a confirmation code like "20261225-A3F9QZ". */
function generateConfirmationCode(iso: string): string {
  const datePart = iso.replace(/-/g, '');
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let suffix = '';
  for (let i = 0; i < 6; i++) {
    suffix += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `${datePart}-${suffix}`;
}

/**
 * Returns a label + colour for a time slot based on availability.
 * Returns null when the slot is comfortably available.
 */
function slotAvailabilityMeta(
  slot: TimeSlot,
): { label: string; color: string } | null {
  if (slot.available === 0) {
    return { label: 'Full', color: Colors.error };
  }
  if (slot.available / slot.total < SCARCITY_THRESHOLD) {
    return { label: `${slot.available} left`, color: Colors.warning };
  }
  return null;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

// Day card in the horizontal date picker.
interface DayCardProps {
  option: DayOption;
  isSelected: boolean;
  isToday: boolean;
  onPress: () => void;
}

const DayCard = React.memo(({ option, isSelected, isToday, onPress }: DayCardProps) => (
  <TouchableOpacity
    style={[styles.dayCard, isSelected && styles.dayCardSelected]}
    onPress={onPress}
    activeOpacity={0.75}
    hitSlop={{ top: 4, bottom: 4, left: 2, right: 2 }}
  >
    <Text style={[styles.dayCardLabel, isSelected && styles.dayCardLabelSelected]}>
      {isToday ? 'Today' : option.shortDay}
    </Text>
    <Text style={[styles.dayCardNumber, isSelected && styles.dayCardNumberSelected]}>
      {option.dayNumber}
    </Text>
    {isSelected && <View style={styles.dayCardDot} />}
  </TouchableOpacity>
));

// Simple section heading row with an icon accent.
interface SectionHeadingProps {
  iconName: React.ComponentProps<typeof Ionicons>['name'];
  title: string;
  optional?: boolean;
}

function SectionHeading({ iconName, title, optional }: SectionHeadingProps) {
  return (
    <View style={styles.sectionHeading}>
      <View style={styles.sectionIconBadge}>
        <Ionicons name={iconName} size={15} color={Colors.primary} />
      </View>
      <Text style={styles.sectionTitle}>{title}</Text>
      {optional && (
        <View style={styles.optionalTag}>
          <Text style={styles.optionalTagText}>Optional</Text>
        </View>
      )}
    </View>
  );
}

// ─── Main screen ─────────────────────────────────────────────────────────────

export function BookTableScreen({ route, navigation }: Props) {
  const { restaurant } = route.params;
  const insets = useSafeAreaInsets();
  const addReservation = useAppStore((s) => s.addReservation);

  // ── Stable data ──────────────────────────────────────────────────────────
  const week = useMemo(() => buildWeek(), []);

  // ── State ────────────────────────────────────────────────────────────────
  const [selectedDayIdx, setSelectedDayIdx] = useState<number>(0);
  const [partySize, setPartySize] = useState<number>(2);
  const [selectedSlotTime, setSelectedSlotTime] = useState<string | null>(null);
  const [specialRequests, setSpecialRequests] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const selectedDay = week[selectedDayIdx];

  // ── Derived state ─────────────────────────────────────────────────────────
  const selectedSlot: TimeSlot | undefined = useMemo(
    () => restaurant.availableSlots.find((s) => s.time === selectedSlotTime),
    [restaurant.availableSlots, selectedSlotTime],
  );

  const summaryText = useMemo(() => {
    const datePart = formatSummaryDate(selectedDay);
    const timePart = selectedSlotTime ?? '— select a time —';
    const sizePart = `${partySize} ${partySize === 1 ? 'guest' : 'guests'}`;
    return `${datePart}  ·  ${timePart}  ·  ${sizePart}`;
  }, [selectedDay, selectedSlotTime, partySize]);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleDaySelect = useCallback((idx: number) => {
    setSelectedDayIdx(idx);
    setSelectedSlotTime(null); // reset slot when date changes
  }, []);

  const handleDecrement = useCallback(() => {
    setPartySize((p) => Math.max(MIN_GUESTS, p - 1));
  }, []);

  const handleIncrement = useCallback(() => {
    setPartySize((p) => Math.min(MAX_GUESTS, p + 1));
  }, []);

  const handleSlotSelect = useCallback((time: string) => {
    setSelectedSlotTime(time);
  }, []);

  const handleConfirm = useCallback(() => {
    if (!selectedSlotTime) {
      Alert.alert(
        'Select a Time',
        'Please choose an available time slot before confirming your reservation.',
        [{ text: 'OK' }],
      );
      return;
    }

    setIsSubmitting(true);

    const reservation: Reservation = {
      id: `res_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
      restaurantId: restaurant.id,
      restaurantName: restaurant.name,
      restaurantImage: restaurant.imageUrl,
      date: selectedDay.iso,
      time: selectedSlotTime,
      partySize,
      specialRequests: specialRequests.trim() || undefined,
      status: 'confirmed',
      confirmationCode: generateConfirmationCode(selectedDay.iso),
      createdAt: new Date().toISOString(),
    };

    addReservation(reservation);
    setIsSubmitting(false);
    navigation.navigate('ReservationConfirmation', { reservation });
  }, [
    selectedSlotTime,
    selectedDay,
    partySize,
    specialRequests,
    restaurant,
    addReservation,
    navigation,
  ]);

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* ── Header ── */}
      <View style={[styles.header, { paddingTop: insets.top + Spacing.sm }]}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
          activeOpacity={0.75}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="arrow-back" size={22} color={Colors.textPrimary} />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={styles.headerRestaurantName} numberOfLines={1}>
            {restaurant.name}
          </Text>
          <Text style={styles.headerScreenTitle}>Book a Table</Text>
        </View>

        {/* Invisible element to balance the flex row */}
        <View style={styles.backBtn} />
      </View>

      {/* ── Scrollable body ── */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 128 },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >

        {/* ─── 1. Date selection ─────────────────────────────────────────── */}
        <SectionHeading iconName="calendar-outline" title="Select Date" />

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.dayRowContent}
          style={styles.dayRowScroll}
        >
          {week.map((opt, idx) => (
            <DayCard
              key={opt.iso}
              option={opt}
              isSelected={idx === selectedDayIdx}
              isToday={idx === 0}
              onPress={() => handleDaySelect(idx)}
            />
          ))}
        </ScrollView>

        {/* ─── 2. Party size ─────────────────────────────────────────────── */}
        <SectionHeading iconName="people-outline" title="Party Size" />

        <View style={styles.partySizeCard}>
          <View style={styles.partySizeLeft}>
            <View style={styles.partySizeIconWrap}>
              <Ionicons name="people" size={18} color={Colors.primary} />
            </View>
            <Text style={styles.partySizeLabel}>Number of Guests</Text>
          </View>

          <View style={styles.partySizeControls}>
            <TouchableOpacity
              style={[styles.stepBtn, partySize <= MIN_GUESTS && styles.stepBtnDisabled]}
              onPress={handleDecrement}
              disabled={partySize <= MIN_GUESTS}
              activeOpacity={0.75}
            >
              <Ionicons
                name="remove"
                size={18}
                color={partySize <= MIN_GUESTS ? Colors.gray400 : Colors.primary}
              />
            </TouchableOpacity>

            <View style={styles.partySizeValueWrap}>
              <Text style={styles.partySizeValue}>{partySize}</Text>
            </View>

            <TouchableOpacity
              style={[styles.stepBtn, partySize >= MAX_GUESTS && styles.stepBtnDisabled]}
              onPress={handleIncrement}
              disabled={partySize >= MAX_GUESTS}
              activeOpacity={0.75}
            >
              <Ionicons
                name="add"
                size={18}
                color={partySize >= MAX_GUESTS ? Colors.gray400 : Colors.primary}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* ─── 3. Time slots ─────────────────────────────────────────────── */}
        <SectionHeading iconName="time-outline" title="Available Times" />

        {restaurant.availableSlots.length === 0 ? (
          <View style={styles.emptySlots}>
            <Ionicons name="time-outline" size={40} color={Colors.gray300} />
            <Text style={styles.emptySlotsHeading}>No slots available</Text>
            <Text style={styles.emptySlotsBody}>
              Check back later or try a different date.
            </Text>
          </View>
        ) : (
          <View style={styles.slotsGrid}>
            {restaurant.availableSlots.map((slot, index) => {
              const isDisabled = slot.available === 0;
              const isSelected = slot.time === selectedSlotTime;
              const meta = slotAvailabilityMeta(slot);
              /* Right-column cards get left padding instead of right padding
                 so the gap stays consistent without using a flex gap. */
              const isRightCol = index % 2 === 1;

              return (
                <TouchableOpacity
                  key={slot.time}
                  style={[
                    styles.slotCard,
                    isRightCol && styles.slotCardRight,
                    isSelected && styles.slotCardSelected,
                    isDisabled && styles.slotCardDisabled,
                  ]}
                  onPress={() => !isDisabled && handleSlotSelect(slot.time)}
                  activeOpacity={isDisabled ? 1 : 0.78}
                  disabled={isDisabled}
                >
                  {/* Pink gradient fill for the selected slot */}
                  {isSelected && (
                    <LinearGradient
                      colors={Colors.gradientPink as [string, string]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={StyleSheet.absoluteFill}
                    />
                  )}

                  <Text
                    style={[
                      styles.slotTimeText,
                      isSelected && styles.slotTimeTextSelected,
                      isDisabled && styles.slotTimeTextDisabled,
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
                            ? 'rgba(255,255,255,0.22)'
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

            {/* Ghost card to keep grid alignment when slot count is odd */}
            {restaurant.availableSlots.length % 2 !== 0 && (
              <View style={[styles.slotCard, styles.slotCardRight, styles.slotCardGhost]} />
            )}
          </View>
        )}

        {/* ─── 4. Special requests ───────────────────────────────────────── */}
        <SectionHeading
          iconName="chatbubble-ellipses-outline"
          title="Special Requests"
          optional
        />

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
            maxLength={MAX_REQUEST_LENGTH}
          />
          <Text style={styles.charCount}>
            {specialRequests.length}/{MAX_REQUEST_LENGTH}
          </Text>
        </View>

        {/* ─── 5. Booking summary card (visible once a slot is chosen) ──── */}
        {selectedSlot && (
          <View style={styles.summaryCard}>
            <View style={styles.summaryCardHeader}>
              <Ionicons name="checkmark-circle" size={18} color={Colors.primary} />
              <Text style={styles.summaryCardTitle}>Booking Summary</Text>
            </View>

            <View style={styles.summaryCardDivider} />

            <SummaryRow icon="calendar" label={formatLongDate(selectedDay)} />
            <SummaryRow icon="time" label={selectedSlot.time} />
            <SummaryRow
              icon="people"
              label={`${partySize} ${partySize === 1 ? 'guest' : 'guests'}`}
            />
            <SummaryRow icon="restaurant" label={restaurant.name} muted />
          </View>
        )}

        {/* ─── 6. Policy blurb ───────────────────────────────────────────── */}
        <View style={styles.policyStrip}>
          <Ionicons
            name="information-circle-outline"
            size={15}
            color={Colors.textMuted}
            style={{ marginTop: 1 }}
          />
          <Text style={styles.policyText}>
            Reservations are held for 15 minutes after the booked time. A
            confirmation will be saved to your Datefully account.
          </Text>
        </View>
      </ScrollView>

      {/* ── Bottom bar ── */}
      <View
        style={[styles.bottomBar, { paddingBottom: insets.bottom + Spacing.sm }]}
      >
        <View style={styles.summaryRow}>
          <Ionicons
            name="calendar-outline"
            size={14}
            color={Colors.textSecondary}
            style={{ marginRight: Spacing.xs }}
          />
          <Text style={styles.summaryRowText} numberOfLines={1}>
            {summaryText}
          </Text>
        </View>

        <TouchableOpacity
          onPress={handleConfirm}
          activeOpacity={0.85}
          disabled={isSubmitting}
          style={styles.confirmBtnTouchable}
        >
          <LinearGradient
            colors={Colors.gradientPink as [string, string, ...string[]]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.confirmBtn, isSubmitting && styles.confirmBtnSubmitting]}
          >
            <Ionicons
              name="checkmark-circle-outline"
              size={20}
              color={Colors.white}
              style={{ marginRight: Spacing.sm }}
            />
            <Text style={styles.confirmBtnText}>
              {isSubmitting ? 'Confirming…' : 'Confirm Reservation'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

// ─── Helper sub-component ─────────────────────────────────────────────────────

interface SummaryRowProps {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
  muted?: boolean;
}

function SummaryRow({ icon, label, muted }: SummaryRowProps) {
  return (
    <View style={styles.summaryRowItem}>
      <Ionicons
        name={icon}
        size={15}
        color={muted ? Colors.textMuted : Colors.primary}
        style={{ width: 20 }}
      />
      <Text style={[styles.summaryRowItemText, muted && styles.summaryRowItemTextMuted]}>
        {label}
      </Text>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

/** Half the desired gutter between slot columns (applied as right/left padding). */
const SLOT_GUTTER_HALF = Spacing.xs;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  // ── Header ──────────────────────────────────────────────────────────────────
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.base,
    paddingBottom: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.gray200,
    ...Shadow.sm,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.gray100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
  },
  headerRestaurantName: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.primary,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  headerScreenTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
    letterSpacing: -0.3,
  },

  // ── Scroll body ──────────────────────────────────────────────────────────────
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: Spacing.lg,
    paddingHorizontal: Spacing.base,
  },

  // ── Section heading ──────────────────────────────────────────────────────────
  sectionHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.lg,
    marginBottom: Spacing.md,
  },
  sectionIconBadge: {
    width: 28,
    height: 28,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  sectionTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
    letterSpacing: -0.2,
  },
  optionalTag: {
    backgroundColor: Colors.gray100,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
  },
  optionalTagText: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.textMuted,
    letterSpacing: 0.3,
  },

  // ── Day picker ───────────────────────────────────────────────────────────────
  dayRowScroll: {
    marginHorizontal: -Spacing.base,
  },
  dayRowContent: {
    paddingHorizontal: Spacing.base,
    paddingBottom: Spacing.xs,
  },
  dayCard: {
    width: 62,
    height: 78,
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
  dayCardLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textSecondary,
    letterSpacing: 0.5,
    marginBottom: 3,
    textTransform: 'uppercase',
  },
  dayCardLabelSelected: {
    color: 'rgba(255,255,255,0.85)',
  },
  dayCardNumber: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.textPrimary,
    lineHeight: 28,
    letterSpacing: -0.5,
  },
  dayCardNumberSelected: {
    color: Colors.white,
  },
  dayCardDot: {
    width: 5,
    height: 5,
    borderRadius: BorderRadius.full,
    backgroundColor: 'rgba(255,255,255,0.7)',
    marginTop: 5,
  },

  // ── Party size ───────────────────────────────────────────────────────────────
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
  partySizeIconWrap: {
    width: 34,
    height: 34,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
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
  stepBtn: {
    width: 38,
    height: 38,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surfaceAlt,
    borderWidth: 1.5,
    borderColor: Colors.gray200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepBtnDisabled: {
    backgroundColor: Colors.gray50,
    borderColor: Colors.gray200,
  },
  partySizeValueWrap: {
    width: 46,
    alignItems: 'center',
  },
  partySizeValue: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.textPrimary,
    letterSpacing: -0.5,
  },

  // ── Time slots grid ──────────────────────────────────────────────────────────
  slotsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  slotCard: {
    width: '50%',
    paddingRight: SLOT_GUTTER_HALF,
    marginBottom: SLOT_GUTTER_HALF * 2,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.gray200,
    minHeight: 66,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    ...Shadow.sm,
  },
  slotCardRight: {
    paddingRight: 0,
    paddingLeft: SLOT_GUTTER_HALF,
  },
  slotCardSelected: {
    borderColor: Colors.primary,
    ...Shadow.md,
  },
  slotCardDisabled: {
    backgroundColor: Colors.gray50,
    borderColor: Colors.gray100,
    opacity: 0.55,
  },
  slotCardGhost: {
    backgroundColor: 'transparent',
    borderColor: 'transparent',
    shadowOpacity: 0,
    elevation: 0,
  },
  slotTimeText: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
    letterSpacing: -0.2,
    zIndex: 1,
  },
  slotTimeTextSelected: {
    color: Colors.white,
  },
  slotTimeTextDisabled: {
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
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.3,
  },

  // ── Empty state ──────────────────────────────────────────────────────────────
  emptySlots: {
    alignItems: 'center',
    paddingVertical: Spacing['3xl'],
    gap: Spacing.sm,
  },
  emptySlotsHeading: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginTop: Spacing.xs,
  },
  emptySlotsBody: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
    maxWidth: 200,
    lineHeight: 18,
  },

  // ── Special requests ─────────────────────────────────────────────────────────
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

  // ── Booking summary card ─────────────────────────────────────────────────────
  summaryCard: {
    marginTop: Spacing.lg,
    backgroundColor: Colors.surfaceAlt,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: `${Colors.primary}30`,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    ...Shadow.sm,
  },
  summaryCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  summaryCardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  summaryCardDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: `${Colors.primary}30`,
    marginBottom: Spacing.sm,
  },
  summaryRowItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.xs + 1,
  },
  summaryRowItemText: {
    fontSize: 14,
    color: Colors.textPrimary,
    fontWeight: '500',
    flex: 1,
  },
  summaryRowItemTextMuted: {
    color: Colors.textSecondary,
    fontWeight: '400',
  },

  // ── Policy blurb ─────────────────────────────────────────────────────────────
  policyStrip: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.xs,
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
    backgroundColor: Colors.surfaceAlt,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
  },
  policyText: {
    flex: 1,
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 17,
  },

  // ── Bottom bar ───────────────────────────────────────────────────────────────
  bottomBar: {
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.gray200,
    ...Shadow.lg,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  summaryRowText: {
    flex: 1,
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  confirmBtnTouchable: {
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
  confirmBtnSubmitting: {
    opacity: 0.75,
  },
  confirmBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.white,
    letterSpacing: 0.2,
  },
});
