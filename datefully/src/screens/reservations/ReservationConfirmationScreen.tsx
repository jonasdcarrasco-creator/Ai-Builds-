import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  Share,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Spacing, BorderRadius, Shadow } from '../../constants';
import type { Reservation } from '../../types';

const { width } = Dimensions.get('window');

interface Props {
  navigation: any;
  route: { params: { reservation: Reservation } };
}

const STATUS_ICONS: Record<string, { name: string; color: string; bg: string[] }> = {
  confirmed: { name: 'checkmark-circle', color: Colors.success, bg: ['#2ECC71', '#27AE60'] },
  pending: { name: 'time', color: Colors.warning, bg: ['#F39C12', '#E67E22'] },
};

export const ReservationConfirmationScreen: React.FC<Props> = ({ navigation, route }) => {
  const { reservation } = route.params;
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;

  const statusInfo = STATUS_ICONS[reservation.status] ?? STATUS_ICONS.confirmed;

  useEffect(() => {
    Animated.sequence([
      Animated.spring(scaleAnim, {
        toValue: 1,
        damping: 12,
        stiffness: 150,
        useNativeDriver: true,
      }),
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 350, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: 0, duration: 350, useNativeDriver: true }),
      ]),
    ]).start();
  }, []);

  const handleShare = async () => {
    try {
      await Share.share({
        message: `I just booked a table at ${reservation.restaurantName}!\n📅 ${reservation.date} at ${reservation.time}\n👥 Party of ${reservation.partySize}\nConfirmation: ${reservation.confirmationCode}`,
      });
    } catch (_) {}
  };

  const handleViewBookings = () => {
    navigation.navigate('ReservationsScreen');
  };

  const handleDone = () => {
    navigation.navigate('MainTabs');
  };

  const DETAIL_ROWS = [
    { icon: 'restaurant-outline', label: 'Restaurant', value: reservation.restaurantName },
    { icon: 'calendar-outline', label: 'Date', value: reservation.date },
    { icon: 'time-outline', label: 'Time', value: reservation.time },
    { icon: 'people-outline', label: 'Party Size', value: `${reservation.partySize} ${reservation.partySize === 1 ? 'guest' : 'guests'}` },
    { icon: 'receipt-outline', label: 'Confirmation', value: reservation.confirmationCode, highlight: true },
  ];

  if (reservation.specialRequests) {
    DETAIL_ROWS.push({ icon: 'chatbubble-outline', label: 'Special Requests', value: reservation.specialRequests, highlight: false });
  }

  return (
    <View style={styles.container}>
      {/* Gradient Background */}
      <LinearGradient
        colors={['#FFF0F6', '#FFFFFF', '#FFFFFF']}
        style={StyleSheet.absoluteFillObject}
      />

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Success Icon */}
        <Animated.View style={[styles.iconWrap, { transform: [{ scale: scaleAnim }] }]}>
          <LinearGradient
            colors={statusInfo.bg as any}
            style={styles.iconCircle}
          >
            <Ionicons name={statusInfo.name as any} size={52} color={Colors.white} />
          </LinearGradient>

          {/* Confetti rings */}
          <View style={[styles.ring, styles.ring1]} />
          <View style={[styles.ring, styles.ring2]} />
        </Animated.View>

        {/* Title */}
        <Animated.View style={[styles.titleBlock, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <Text style={styles.heading}>You're all set!</Text>
          <Text style={styles.subheading}>
            Your table at{' '}
            <Text style={styles.highlight}>{reservation.restaurantName}</Text>{' '}
            is {reservation.status === 'confirmed' ? 'confirmed' : 'pending confirmation'}.
          </Text>
        </Animated.View>

        {/* Booking Card */}
        <Animated.View style={[styles.card, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <View style={styles.cardHeader}>
            <Ionicons name="ticket-outline" size={16} color={Colors.primary} />
            <Text style={styles.cardHeaderText}>Booking Details</Text>
          </View>

          {DETAIL_ROWS.map((row, i) => (
            <View key={i} style={[styles.detailRow, i < DETAIL_ROWS.length - 1 && styles.detailBorder]}>
              <View style={styles.detailLeft}>
                <Ionicons name={row.icon as any} size={16} color={Colors.textMuted} />
                <Text style={styles.detailLabel}>{row.label}</Text>
              </View>
              <Text style={[styles.detailValue, (row as any).highlight && styles.confirmCode]}>
                {row.value}
              </Text>
            </View>
          ))}
        </Animated.View>

        {/* Status Banner */}
        <Animated.View style={[styles.statusBanner, { opacity: fadeAnim }]}>
          <Ionicons name="information-circle-outline" size={16} color={Colors.info} />
          <Text style={styles.statusText}>
            {reservation.status === 'confirmed'
              ? 'A confirmation has been sent to your email. We'll remind you 2 hours before your reservation.'
              : 'The restaurant will confirm your booking shortly. You'll be notified when it's confirmed.'}
          </Text>
        </Animated.View>

        {/* Action Buttons */}
        <Animated.View style={[styles.actions, { opacity: fadeAnim }]}>
          <TouchableOpacity style={styles.shareBtn} onPress={handleShare}>
            <Ionicons name="share-outline" size={18} color={Colors.primary} />
            <Text style={styles.shareBtnText}>Share</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.viewBtn} onPress={handleViewBookings}>
            <Text style={styles.viewBtnText}>View My Bookings</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Done */}
        <Animated.View style={{ opacity: fadeAnim, width: '100%' }}>
          <TouchableOpacity style={styles.doneBtn} onPress={handleDone} activeOpacity={0.85}>
            <LinearGradient
              colors={['#FF6B9D', '#E85585']}
              style={styles.doneBtnGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.doneBtnText}>Back to Home</Text>
              <Ionicons name="home-outline" size={18} color={Colors.white} />
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: {
    flexGrow: 1,
    alignItems: 'center',
    paddingHorizontal: Spacing.base,
    paddingTop: 80,
    paddingBottom: 48,
  },
  iconWrap: {
    marginBottom: 28,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  iconCircle: {
    width: 110,
    height: 110,
    borderRadius: 55,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.lg,
  },
  ring: {
    position: 'absolute',
    borderRadius: 999,
    borderWidth: 2,
    borderColor: Colors.primary + '25',
  },
  ring1: { width: 140, height: 140 },
  ring2: { width: 170, height: 170, borderColor: Colors.primary + '12' },
  titleBlock: { alignItems: 'center', marginBottom: 24 },
  heading: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  subheading: {
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 16,
  },
  highlight: { color: Colors.primary, fontWeight: '700' },
  card: {
    width: '100%',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    marginBottom: 16,
    ...Shadow.md,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 14,
    paddingHorizontal: 16,
    backgroundColor: Colors.surfaceAlt,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray100,
  },
  cardHeaderText: { fontSize: 13, fontWeight: '700', color: Colors.primary },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 13,
    paddingHorizontal: 16,
  },
  detailBorder: { borderBottomWidth: 1, borderBottomColor: Colors.gray100 },
  detailLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  detailLabel: { fontSize: 13, color: Colors.textSecondary, fontWeight: '500' },
  detailValue: { fontSize: 14, color: Colors.textPrimary, fontWeight: '600', maxWidth: '55%', textAlign: 'right' },
  confirmCode: {
    color: Colors.primary,
    fontWeight: '800',
    letterSpacing: 1.5,
    fontVariant: ['tabular-nums'],
  },
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: Colors.info + '15',
    borderRadius: BorderRadius.lg,
    padding: 14,
    width: '100%',
    marginBottom: 24,
    borderLeftWidth: 3,
    borderLeftColor: Colors.info,
  },
  statusText: { flex: 1, fontSize: 13, color: Colors.textSecondary, lineHeight: 19 },
  actions: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
    marginBottom: 16,
  },
  shareBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 2,
    borderColor: Colors.primary,
    borderRadius: BorderRadius.xl,
    paddingVertical: 13,
  },
  shareBtnText: { color: Colors.primary, fontSize: 15, fontWeight: '700' },
  viewBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.gray100,
    borderRadius: BorderRadius.xl,
    paddingVertical: 13,
  },
  viewBtnText: { color: Colors.textPrimary, fontSize: 15, fontWeight: '700' },
  doneBtn: { width: '100%', borderRadius: BorderRadius.xl, overflow: 'hidden' },
  doneBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 16,
  },
  doneBtnText: { color: Colors.white, fontSize: 16, fontWeight: '700' },
});
