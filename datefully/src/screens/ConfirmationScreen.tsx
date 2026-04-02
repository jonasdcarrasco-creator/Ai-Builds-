import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, TransportMode } from '../types';
import { useDateStore } from '../store';
import { openTransportApp } from '../lib/booking';
import { Colors, Typography, Spacing, BorderRadius } from '../constants/theme';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Confirmation'>;
};

const { width } = Dimensions.get('window');

const TRANSPORT_OPTIONS: {
  mode: TransportMode;
  emoji: string;
  label: string;
}[] = [
  { mode: 'walk', emoji: '🚶', label: 'Walk' },
  { mode: 'uber', emoji: '🚗', label: 'Uber' },
  { mode: 'lyft', emoji: '🚙', label: 'Lyft' },
  { mode: 'transit', emoji: '🚌', label: 'Transit' },
  { mode: 'taxi', emoji: '🚕', label: 'Taxi' },
];

function StarRatingUI({ onSubmit }: { onSubmit: (stars: number, review: string) => void }) {
  const [hovered, setHovered] = useState(0);
  const [selected, setSelected] = useState(0);
  const [review, setReview] = useState('');

  return (
    <View style={ratingStyles.container}>
      <Text style={ratingStyles.title}>How was your date? ⭐</Text>
      <View style={ratingStyles.stars}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity
            key={star}
            onPress={() => setSelected(star)}
            activeOpacity={0.8}
          >
            <Text style={[ratingStyles.star, star <= (selected || hovered) && ratingStyles.starFilled]}>
              {star <= (selected || hovered) ? '★' : '☆'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      {selected > 0 && (
        <TouchableOpacity
          style={ratingStyles.submitBtn}
          onPress={() => onSubmit(selected, review)}
          activeOpacity={0.85}
        >
          <Text style={ratingStyles.submitText}>Submit Rating</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const ratingStyles = StyleSheet.create({
  container: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.gold,
    marginBottom: Spacing.lg,
    alignItems: 'center',
    gap: Spacing.md,
  },
  title: {
    fontFamily: Typography.heading,
    fontSize: Typography.lg,
    color: Colors.textPrimary,
  },
  stars: { flexDirection: 'row', gap: Spacing.sm },
  star: { fontSize: 36, color: Colors.cardBorder },
  starFilled: { color: Colors.gold },
  submitBtn: {
    backgroundColor: Colors.red,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.xl,
    alignItems: 'center',
  },
  submitText: { color: Colors.white, fontWeight: Typography.bold, fontSize: Typography.base },
});

export default function ConfirmationScreen({ navigation }: Props) {
  const { selectedDate, bookingTime, userEmail } = useDateStore() as any;
  const [selectedTransport, setSelectedTransport] = useState<TransportMode | null>(null);
  const [showRating, setShowRating] = useState(false);
  const [ratingSubmitted, setRatingSubmitted] = useState(false);

  useEffect(() => {
    if (bookingTime) {
      const elapsed = Date.now() - bookingTime;
      const twentyFourHours = 24 * 60 * 60 * 1000;
      if (elapsed >= twentyFourHours) {
        setShowRating(true);
      }
    }
  }, [bookingTime]);

  if (!selectedDate) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>No booking found.</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Splash')}>
            <Text style={styles.goldLink}>Start over</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const { option, confirmationNumber, bookedAt } = selectedDate;
  const dateStr = bookedAt
    ? new Date(bookedAt).toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
      })
    : 'Upcoming';
  const timeStr = bookedAt
    ? new Date(bookedAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    : '';

  const handleTransport = async (mode: TransportMode) => {
    setSelectedTransport(mode);
    await openTransportApp(mode, option.address || 'Philadelphia, PA');
  };

  const handleAddToCalendar = () => {
    Alert.alert(
      'Add to Calendar',
      `"${option.title}" has been added to your calendar for ${dateStr}.`,
      [{ text: 'OK' }]
    );
  };

  const handleRatingSubmit = (stars: number, _review: string) => {
    setRatingSubmitted(true);
    Alert.alert('Thank you!', `You rated your date ${stars} star${stars !== 1 ? 's' : ''}. We hope it was magical! 💛`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerEmoji}>🎉</Text>
          <Text style={styles.title}>You're All Set!</Text>
          <Text style={styles.subtitle}>Your date is confirmed in Philadelphia</Text>
        </View>

        {/* Summary card */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Date</Text>
            <Text style={styles.summaryValue}>{option.title}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Venues</Text>
            <Text style={styles.summaryValue}>{option.venues.join(', ')}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Date & Time</Text>
            <Text style={styles.summaryValue}>{dateStr}{timeStr ? ` · ${timeStr}` : ''}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Budget</Text>
            <Text style={styles.summaryValue}>{option.estimatedCost}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Confirmation #</Text>
            <Text style={[styles.summaryValue, { color: Colors.gold }]}>{confirmationNumber}</Text>
          </View>
        </View>

        {/* Email confirmation */}
        {userEmail && (
          <View style={styles.emailBox}>
            <Text style={styles.emailIcon}>✉️</Text>
            <Text style={styles.emailText}>Confirmation sent to {userEmail}</Text>
          </View>
        )}

        {/* Transport section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>How are you getting there?</Text>
          <View style={styles.transportGrid}>
            {TRANSPORT_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt.mode}
                style={[
                  styles.transportBtn,
                  selectedTransport === opt.mode && styles.transportBtnSelected,
                ]}
                onPress={() => handleTransport(opt.mode)}
                activeOpacity={0.8}
              >
                <Text style={styles.transportEmoji}>{opt.emoji}</Text>
                <Text
                  style={[
                    styles.transportLabel,
                    selectedTransport === opt.mode && styles.transportLabelSelected,
                  ]}
                >
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Add to Calendar */}
        <TouchableOpacity
          style={styles.calendarBtn}
          onPress={handleAddToCalendar}
          activeOpacity={0.85}
        >
          <Text style={styles.calendarBtnText}>📅  Add to Calendar</Text>
        </TouchableOpacity>

        {/* Rating section */}
        {showRating && !ratingSubmitted ? (
          <StarRatingUI onSubmit={handleRatingSubmit} />
        ) : !showRating ? (
          <View style={styles.ratingLockBanner}>
            <Text style={styles.ratingLockIcon}>🌟</Text>
            <Text style={styles.ratingLockText}>
              Enjoy your date! Rating unlocks in 24 hours
            </Text>
          </View>
        ) : (
          <View style={styles.ratingDone}>
            <Text style={styles.ratingDoneText}>Rating submitted — thanks! 💛</Text>
          </View>
        )}

        {/* Footer */}
        <Text style={styles.footer}>Thank you for using Datefully</Text>
        <Text style={styles.footerSub}>Made with love for Philadelphia</Text>

        {/* Start new date */}
        <TouchableOpacity
          style={styles.newDateBtn}
          onPress={() => navigation.navigate('WhosPlanning')}
          activeOpacity={0.8}
        >
          <Text style={styles.newDateText}>Plan Another Date</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { flex: 1 },
  scrollContent: {
    padding: Spacing.screen,
    paddingBottom: Spacing.xxxl,
  },
  header: {
    alignItems: 'center',
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.xxl,
  },
  headerEmoji: { fontSize: 48, marginBottom: Spacing.sm },
  title: {
    fontFamily: Typography.heading,
    fontSize: Typography.xxxl,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
    textAlign: 'center',
  },
  subtitle: { fontSize: Typography.base, color: Colors.textSecondary, textAlign: 'center' },
  summaryCard: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    padding: Spacing.xl,
    marginBottom: Spacing.lg,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: Spacing.xs,
    gap: Spacing.md,
  },
  summaryLabel: { color: Colors.textMuted, fontSize: Typography.sm, flex: 0.4 },
  summaryValue: { color: Colors.textPrimary, fontSize: Typography.sm, fontWeight: Typography.semibold, flex: 0.6, textAlign: 'right' },
  divider: { height: 1, backgroundColor: Colors.cardBorder, marginVertical: 2 },
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
  section: { marginBottom: Spacing.lg },
  sectionTitle: {
    fontSize: Typography.base,
    color: Colors.textPrimary,
    fontWeight: Typography.semibold,
    marginBottom: Spacing.md,
  },
  transportGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  transportBtn: {
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    alignItems: 'center',
    minWidth: (width - Spacing.screen * 2 - Spacing.sm * 2) / 3 - 2,
    gap: Spacing.xs,
  },
  transportBtnSelected: {
    borderColor: Colors.gold,
    backgroundColor: 'rgba(201,168,76,0.12)',
  },
  transportEmoji: { fontSize: 24 },
  transportLabel: { color: Colors.textSecondary, fontSize: Typography.xs, fontWeight: Typography.medium },
  transportLabelSelected: { color: Colors.gold, fontWeight: Typography.semibold },
  calendarBtn: {
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  calendarBtnText: { color: Colors.textPrimary, fontSize: Typography.base, fontWeight: Typography.semibold },
  ratingLockBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: 'rgba(201,168,76,0.07)',
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(201,168,76,0.2)',
    marginBottom: Spacing.lg,
  },
  ratingLockIcon: { fontSize: 24 },
  ratingLockText: { color: Colors.textSecondary, fontSize: Typography.sm, flex: 1, lineHeight: 20 },
  ratingDone: {
    alignItems: 'center',
    paddingVertical: Spacing.md,
    marginBottom: Spacing.lg,
  },
  ratingDoneText: { color: Colors.gold, fontSize: Typography.base, fontWeight: Typography.semibold },
  footer: {
    textAlign: 'center',
    color: Colors.textMuted,
    fontSize: Typography.sm,
    marginTop: Spacing.xl,
    fontFamily: Typography.heading,
  },
  footerSub: { textAlign: 'center', color: Colors.textMuted, fontSize: Typography.xs, marginTop: 4, marginBottom: Spacing.xl },
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
