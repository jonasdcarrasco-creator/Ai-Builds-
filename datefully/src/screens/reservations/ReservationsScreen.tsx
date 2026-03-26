import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Spacing, BorderRadius } from '../../constants';
import { useAppStore } from '../../store';
import { MOCK_RESTAURANTS } from '../../constants/mockData';
import { Restaurant, Reservation } from '../../types';

interface ReservationsScreenProps {
  navigation: any;
}

type TabType = 'restaurants' | 'bookings';

const STATUS_STYLE: Record<string, { bg: string; text: string }> = {
  confirmed: { bg: 'rgba(46,204,113,0.15)', text: '#2ECC71' },
  pending: { bg: 'rgba(212,175,55,0.15)', text: '#D4AF37' },
  cancelled: { bg: 'rgba(231,76,60,0.15)', text: '#E74C3C' },
  completed: { bg: 'rgba(100,100,100,0.15)', text: '#888888' },
};

export const ReservationsScreen: React.FC<ReservationsScreenProps> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { reservations, addReservation, cancelReservation } = useAppStore();
  const [activeTab, setActiveTab] = useState<TabType>('restaurants');
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [partySize, setPartySize] = useState(2);
  const [selectedTime, setSelectedTime] = useState('');
  const [specialRequests, setSpecialRequests] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [confirmCode, setConfirmCode] = useState('');

  const upcoming = reservations.filter(
    (r) => r.status === 'confirmed' || r.status === 'pending'
  );
  const past = reservations.filter(
    (r) => r.status === 'completed' || r.status === 'cancelled'
  );

  const handleBook = () => {
    if (!selectedTime) {
      Alert.alert('Select Time', 'Please select a time slot to continue.');
      return;
    }
    if (!selectedRestaurant) return;
    const code = 'DFY-' + Math.random().toString(36).substring(2, 8).toUpperCase();
    setConfirmCode(code);
    addReservation({
      id: Date.now().toString(),
      restaurantId: selectedRestaurant.id,
      restaurantName: selectedRestaurant.name,
      restaurantImage: selectedRestaurant.imageUrl,
      date: new Date().toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      }),
      time: selectedTime,
      partySize,
      specialRequests: specialRequests || undefined,
      status: 'confirmed',
      confirmationCode: code,
      createdAt: new Date().toISOString(),
    });
    setBookingSuccess(true);
  };

  const closeModal = () => {
    setSelectedRestaurant(null);
    setPartySize(2);
    setSelectedTime('');
    setSpecialRequests('');
    setBookingSuccess(false);
    setConfirmCode('');
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <LinearGradient
        colors={['#0A0A0A', '#1C0000', '#0A0A0A']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Reservations</Text>
        <Text style={styles.headerSub}>Book the best spots for your date night</Text>

        {/* Tabs */}
        <View style={styles.tabs}>
          {(['restaurants', 'bookings'] as TabType[]).map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, activeTab === tab && styles.tabActive]}
              onPress={() => setActiveTab(tab)}
            >
              {activeTab === tab ? (
                <LinearGradient
                  colors={['#8B0000', '#D4AF37']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.tabGrad}
                >
                  <Text style={styles.tabTextActive}>
                    {tab === 'restaurants' ? 'Restaurants' : `My Bookings (${reservations.length})`}
                  </Text>
                </LinearGradient>
              ) : (
                <Text style={styles.tabText}>
                  {tab === 'restaurants' ? 'Restaurants' : `My Bookings (${reservations.length})`}
                </Text>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </LinearGradient>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
      >
        {activeTab === 'restaurants' ? (
          <View style={styles.section}>
            {MOCK_RESTAURANTS.map((r) => (
              <View key={r.id} style={styles.restCard}>
                <Image source={{ uri: r.imageUrl }} style={styles.restImg} />
                <LinearGradient
                  colors={['transparent', 'rgba(0,0,0,0.85)']}
                  style={StyleSheet.absoluteFill}
                />
                {r.isVerified && (
                  <View style={styles.verifiedBadge}>
                    <Ionicons name="checkmark-circle" size={13} color={Colors.primary} />
                    <Text style={styles.verifiedText}>Verified</Text>
                  </View>
                )}
                <View style={styles.restInfo}>
                  <Text style={styles.restName}>{r.name}</Text>
                  <View style={styles.restMetaRow}>
                    <View style={styles.ratingRow}>
                      <Ionicons name="star" size={12} color={Colors.primary} />
                      <Text style={styles.ratingText}>{r.rating}</Text>
                      <Text style={styles.reviewCount}>({r.reviewCount})</Text>
                    </View>
                    <Text style={styles.dot}>·</Text>
                    <Text style={styles.cuisine}>{r.cuisine}</Text>
                    <Text style={styles.dot}>·</Text>
                    <Text style={styles.price}>{r.priceRange}</Text>
                    <Text style={styles.dot}>·</Text>
                    <Text style={styles.distance}>{r.distance}</Text>
                  </View>
                  {r.features.length > 0 && (
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                      <View style={styles.featureRow}>
                        {r.features.slice(0, 4).map((f) => (
                          <View key={f} style={styles.featureTag}>
                            <Text style={styles.featureText}>{f}</Text>
                          </View>
                        ))}
                      </View>
                    </ScrollView>
                  )}
                  <TouchableOpacity
                    style={styles.bookBtn}
                    onPress={() => setSelectedRestaurant(r)}
                  >
                    <LinearGradient
                      colors={['#D4AF37', '#B8942A']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.bookBtnGrad}
                    >
                      <Ionicons name="calendar-outline" size={15} color="#0A0A0A" />
                      <Text style={styles.bookBtnText}>Reserve a Table</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.section}>
            {reservations.length === 0 ? (
              <View style={styles.empty}>
                <Text style={styles.emptyEmoji}>🍷</Text>
                <Text style={styles.emptyTitle}>No Reservations Yet</Text>
                <Text style={styles.emptySub}>
                  Browse restaurants and make your first reservation
                </Text>
                <TouchableOpacity
                  style={styles.emptyBtn}
                  onPress={() => setActiveTab('restaurants')}
                >
                  <Text style={styles.emptyBtnText}>Browse Restaurants</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <>
                {upcoming.length > 0 && (
                  <View>
                    <Text style={styles.groupTitle}>Upcoming</Text>
                    {upcoming.map((res) => <ReservationCard key={res.id} res={res} onCancel={cancelReservation} />)}
                  </View>
                )}
                {past.length > 0 && (
                  <View style={{ marginTop: Spacing.xl }}>
                    <Text style={styles.groupTitle}>Past</Text>
                    {past.map((res) => <ReservationCard key={res.id} res={res} onCancel={cancelReservation} />)}
                  </View>
                )}
              </>
            )}
          </View>
        )}
      </ScrollView>

      {/* Booking Modal */}
      <Modal
        visible={!!selectedRestaurant}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={closeModal}
      >
        {selectedRestaurant && (
          <View style={styles.modal}>
            {bookingSuccess ? (
              <View style={styles.successScreen}>
                <LinearGradient
                  colors={['#0A0A0A', '#1C0000']}
                  style={StyleSheet.absoluteFill}
                />
                <Text style={styles.successEmoji}>🎉</Text>
                <Text style={styles.successTitle}>Reservation Confirmed!</Text>
                <Text style={styles.successSub}>
                  Your table at {selectedRestaurant.name} is booked
                </Text>
                <View style={styles.codeCard}>
                  <Text style={styles.codeLabel}>Confirmation Code</Text>
                  <Text style={styles.codeValue}>{confirmCode}</Text>
                </View>
                <View style={styles.detailsCard}>
                  <View style={styles.detailRow}>
                    <Ionicons name="people-outline" size={16} color={Colors.primary} />
                    <Text style={styles.detailText}>Party of {partySize}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Ionicons name="time-outline" size={16} color={Colors.primary} />
                    <Text style={styles.detailText}>{selectedTime}</Text>
                  </View>
                </View>
                <TouchableOpacity style={styles.doneBtn} onPress={closeModal}>
                  <LinearGradient
                    colors={['#D4AF37', '#B8942A']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.doneBtnGrad}
                  >
                    <Text style={styles.doneBtnText}>Done</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            ) : (
              <ScrollView
                style={styles.modalScroll}
                contentContainerStyle={{ paddingBottom: 60 }}
              >
                {/* Modal header image */}
                <View style={styles.modalImgWrap}>
                  <Image
                    source={{ uri: selectedRestaurant.imageUrl }}
                    style={styles.modalImg}
                  />
                  <LinearGradient
                    colors={['rgba(0,0,0,0.6)', 'transparent', 'rgba(0,0,0,0.4)']}
                    style={StyleSheet.absoluteFill}
                  />
                  <TouchableOpacity style={styles.modalClose} onPress={closeModal}>
                    <Ionicons name="close" size={20} color={Colors.white} />
                  </TouchableOpacity>
                  <View style={styles.modalRestInfo}>
                    <Text style={styles.modalRestName}>{selectedRestaurant.name}</Text>
                    <View style={styles.modalRestMeta}>
                      <Ionicons name="star" size={12} color={Colors.primary} />
                      <Text style={styles.modalRestRating}>{selectedRestaurant.rating}</Text>
                      <Text style={styles.metaDot}>·</Text>
                      <Text style={styles.modalRestCuisine}>{selectedRestaurant.cuisine}</Text>
                    </View>
                  </View>
                </View>

                <View style={styles.modalBody}>
                  {/* Party Size */}
                  <Text style={styles.modalLabel}>Party Size</Text>
                  <View style={styles.partySizeRow}>
                    <TouchableOpacity
                      style={styles.sizeBtn}
                      onPress={() => setPartySize(Math.max(1, partySize - 1))}
                    >
                      <Ionicons name="remove" size={18} color={Colors.primary} />
                    </TouchableOpacity>
                    <Text style={styles.partySizeNum}>{partySize}</Text>
                    <TouchableOpacity
                      style={styles.sizeBtn}
                      onPress={() => setPartySize(Math.min(12, partySize + 1))}
                    >
                      <Ionicons name="add" size={18} color={Colors.primary} />
                    </TouchableOpacity>
                    <Text style={styles.partySizeLabel}>
                      {partySize === 1 ? 'guest' : 'guests'}
                    </Text>
                  </View>

                  {/* Time Slots */}
                  <Text style={styles.modalLabel}>Select Time</Text>
                  <View style={styles.timeGrid}>
                    {selectedRestaurant.availableSlots.map((slot) => (
                      <TouchableOpacity
                        key={slot.time}
                        style={[
                          styles.timeSlot,
                          selectedTime === slot.time && styles.timeSlotActive,
                          slot.available === 0 && styles.timeSlotFull,
                        ]}
                        onPress={() => slot.available > 0 && setSelectedTime(slot.time)}
                        disabled={slot.available === 0}
                      >
                        <Text
                          style={[
                            styles.timeSlotText,
                            selectedTime === slot.time && styles.timeSlotTextActive,
                            slot.available === 0 && styles.timeSlotTextFull,
                          ]}
                        >
                          {slot.time}
                        </Text>
                        <Text
                          style={[
                            styles.timeSlotAvail,
                            slot.available === 0 && styles.timeSlotTextFull,
                          ]}
                        >
                          {slot.available > 0 ? `${slot.available} left` : 'Full'}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  {/* Special Requests */}
                  <Text style={styles.modalLabel}>Special Requests (Optional)</Text>
                  <TextInput
                    style={styles.requestsInput}
                    placeholder="Allergies, occasion, seating preference..."
                    placeholderTextColor={Colors.inputPlaceholder}
                    value={specialRequests}
                    onChangeText={setSpecialRequests}
                    multiline
                    numberOfLines={3}
                  />

                  {/* Summary */}
                  <View style={styles.summaryCard}>
                    <Text style={styles.summaryTitle}>Booking Summary</Text>
                    <View style={styles.summaryRow}>
                      <Text style={styles.summaryKey}>Restaurant</Text>
                      <Text style={styles.summaryVal}>{selectedRestaurant.name}</Text>
                    </View>
                    <View style={styles.summaryRow}>
                      <Text style={styles.summaryKey}>Guests</Text>
                      <Text style={styles.summaryVal}>{partySize}</Text>
                    </View>
                    <View style={styles.summaryRow}>
                      <Text style={styles.summaryKey}>Time</Text>
                      <Text style={styles.summaryVal}>{selectedTime || 'Not selected'}</Text>
                    </View>
                  </View>

                  {/* Confirm Button */}
                  <TouchableOpacity onPress={handleBook}>
                    <LinearGradient
                      colors={['#D4AF37', '#B8942A']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.confirmBtn}
                    >
                      <Ionicons name="checkmark-circle" size={18} color="#0A0A0A" />
                      <Text style={styles.confirmBtnText}>Confirm Reservation</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            )}
          </View>
        )}
      </Modal>
    </View>
  );
};

const ReservationCard = ({
  res,
  onCancel,
}: {
  res: Reservation;
  onCancel: (id: string) => void;
}) => {
  const sc = STATUS_STYLE[res.status] ?? STATUS_STYLE.pending;
  return (
    <View style={styles.resCard}>
      <View style={styles.resHeader}>
        <View>
          <Text style={styles.resName}>{res.restaurantName}</Text>
          <View style={styles.resMetaRow}>
            <Ionicons name="calendar-outline" size={12} color={Colors.textMuted} />
            <Text style={styles.resMeta}>{res.date}</Text>
            <Text style={styles.metaDot}>·</Text>
            <Ionicons name="time-outline" size={12} color={Colors.textMuted} />
            <Text style={styles.resMeta}>{res.time}</Text>
            <Text style={styles.metaDot}>·</Text>
            <Ionicons name="people-outline" size={12} color={Colors.textMuted} />
            <Text style={styles.resMeta}>{res.partySize}</Text>
          </View>
        </View>
        <View style={[styles.resPill, { backgroundColor: sc.bg }]}>
          <Text style={[styles.resPillText, { color: sc.text }]}>
            {res.status.charAt(0).toUpperCase() + res.status.slice(1)}
          </Text>
        </View>
      </View>
      <View style={styles.resCodeRow}>
        <Text style={styles.resCodeLabel}>Confirmation: </Text>
        <Text style={styles.resCode}>{res.confirmationCode}</Text>
      </View>
      {res.status === 'confirmed' && (
        <TouchableOpacity
          style={styles.cancelResBtn}
          onPress={() =>
            Alert.alert('Cancel Reservation', 'Are you sure?', [
              { text: 'No', style: 'cancel' },
              { text: 'Cancel Reservation', style: 'destructive', onPress: () => onCancel(res.id) },
            ])
          }
        >
          <Text style={styles.cancelResBtnText}>Cancel Reservation</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    paddingHorizontal: Spacing['2xl'],
    paddingBottom: Spacing.base,
    gap: Spacing.md,
  },
  headerTitle: { fontSize: 28, fontWeight: '800', color: Colors.textPrimary, paddingTop: Spacing.base },
  headerSub: { fontSize: 13, color: Colors.textMuted, marginTop: -8 },
  tabs: { flexDirection: 'row', gap: 10 },
  tab: {
    flex: 1,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    backgroundColor: Colors.surfaceAlt,
    borderWidth: 1,
    borderColor: Colors.inputBorder,
  },
  tabActive: { borderColor: Colors.primary },
  tabGrad: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabText: { fontSize: 13, fontWeight: '600', color: Colors.textMuted, textAlign: 'center', paddingVertical: 10 },
  tabTextActive: { fontSize: 13, fontWeight: '700', color: '#0A0A0A' },
  section: { padding: Spacing['2xl'] },
  restCard: {
    height: 240,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    marginBottom: 16,
    backgroundColor: Colors.surfaceAlt,
  },
  restImg: { ...StyleSheet.absoluteFillObject },
  verifiedBadge: {
    position: 'absolute',
    top: 14, left: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 10, paddingVertical: 5,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: 'rgba(212,175,55,0.4)',
  },
  verifiedText: { fontSize: 11, color: Colors.primary, fontWeight: '700' },
  restInfo: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    padding: 16,
    gap: 8,
  },
  restName: { fontSize: 20, fontWeight: '800', color: '#fff' },
  restMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  ratingText: { fontSize: 12, color: Colors.primary, fontWeight: '700' },
  reviewCount: { fontSize: 12, color: 'rgba(255,255,255,0.6)' },
  dot: { color: 'rgba(255,255,255,0.4)', fontSize: 12 },
  cuisine: { fontSize: 12, color: 'rgba(255,255,255,0.8)' },
  price: { fontSize: 12, color: 'rgba(255,255,255,0.8)' },
  distance: { fontSize: 12, color: 'rgba(255,255,255,0.8)' },
  featureRow: { flexDirection: 'row', gap: 6 },
  featureTag: {
    backgroundColor: 'rgba(212,175,55,0.2)',
    paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  featureText: { fontSize: 11, color: Colors.primary, fontWeight: '600' },
  bookBtn: { borderRadius: BorderRadius.xl, overflow: 'hidden', alignSelf: 'stretch' },
  bookBtnGrad: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    paddingVertical: 12,
    borderRadius: BorderRadius.xl,
  },
  bookBtnText: { fontSize: 14, fontWeight: '700', color: '#0A0A0A' },
  groupTitle: { fontSize: 18, fontWeight: '800', color: Colors.textPrimary, marginBottom: Spacing.base },
  resCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.base,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    gap: 10,
  },
  resHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  resName: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary },
  resMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 4, flexWrap: 'wrap' },
  resMeta: { fontSize: 12, color: Colors.textMuted },
  resPill: {
    paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  resPillText: { fontSize: 11, fontWeight: '700' },
  resCodeRow: { flexDirection: 'row', alignItems: 'center' },
  resCodeLabel: { fontSize: 12, color: Colors.textMuted },
  resCode: { fontSize: 12, fontWeight: '700', color: Colors.primary },
  cancelResBtn: {
    alignSelf: 'flex-start',
    paddingHorizontal: 14, paddingVertical: 7,
    borderRadius: BorderRadius.md,
    backgroundColor: 'rgba(231,76,60,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(231,76,60,0.3)',
  },
  cancelResBtnText: { fontSize: 12, color: Colors.error, fontWeight: '600' },
  empty: {
    alignItems: 'center',
    paddingVertical: 80,
    gap: 14,
  },
  emptyEmoji: { fontSize: 64 },
  emptyTitle: { fontSize: 22, fontWeight: '800', color: Colors.textPrimary },
  emptySub: { fontSize: 14, color: Colors.textMuted, textAlign: 'center', lineHeight: 22 },
  emptyBtn: {
    marginTop: 8,
    paddingHorizontal: 28, paddingVertical: 14,
    borderRadius: BorderRadius.xl,
    backgroundColor: Colors.secondary,
  },
  emptyBtnText: { fontSize: 15, fontWeight: '700', color: '#fff' },
  // Modal
  modal: { flex: 1, backgroundColor: '#0A0A0A' },
  modalScroll: { flex: 1 },
  modalImgWrap: { height: 240, position: 'relative' },
  modalImg: { width: '100%', height: '100%' },
  modalClose: {
    position: 'absolute',
    top: 16, right: 16,
    width: 36, height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalRestInfo: {
    position: 'absolute',
    bottom: 16, left: 16,
    gap: 4,
  },
  modalRestName: { fontSize: 22, fontWeight: '800', color: '#fff' },
  modalRestMeta: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  modalRestRating: { fontSize: 13, color: Colors.primary, fontWeight: '700' },
  metaDot: { color: 'rgba(255,255,255,0.4)', fontSize: 12 },
  modalRestCuisine: { fontSize: 13, color: 'rgba(255,255,255,0.8)' },
  modalBody: { padding: Spacing['2xl'], gap: Spacing.xl },
  modalLabel: { fontSize: 14, fontWeight: '700', color: Colors.textSecondary, marginBottom: -8 },
  partySizeRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  sizeBtn: {
    width: 40, height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  partySizeNum: { fontSize: 22, fontWeight: '800', color: Colors.textPrimary, minWidth: 30, textAlign: 'center' },
  partySizeLabel: { fontSize: 14, color: Colors.textMuted },
  timeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  timeSlot: {
    paddingHorizontal: 14, paddingVertical: 10,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.surfaceAlt,
    borderWidth: 1.5,
    borderColor: Colors.inputBorder,
    alignItems: 'center',
    minWidth: 80,
  },
  timeSlotActive: {
    borderColor: Colors.primary,
    backgroundColor: 'rgba(212,175,55,0.12)',
  },
  timeSlotFull: { opacity: 0.4 },
  timeSlotText: { fontSize: 13, fontWeight: '700', color: Colors.textSecondary },
  timeSlotTextActive: { color: Colors.primary },
  timeSlotTextFull: { color: Colors.textMuted },
  timeSlotAvail: { fontSize: 10, color: Colors.textMuted, marginTop: 2 },
  requestsInput: {
    backgroundColor: Colors.inputBackground,
    borderRadius: BorderRadius.lg,
    borderWidth: 1.5,
    borderColor: Colors.inputBorder,
    padding: 14,
    fontSize: 14,
    color: Colors.textPrimary,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  summaryCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    gap: 10,
  },
  summaryTitle: { fontSize: 14, fontWeight: '700', color: Colors.textPrimary },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryKey: { fontSize: 13, color: Colors.textMuted },
  summaryVal: { fontSize: 13, fontWeight: '700', color: Colors.textPrimary },
  confirmBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: BorderRadius.xl,
  },
  confirmBtnText: { fontSize: 16, fontWeight: '700', color: '#0A0A0A' },
  // Success
  successScreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    gap: 16,
  },
  successEmoji: { fontSize: 80 },
  successTitle: { fontSize: 26, fontWeight: '800', color: Colors.textPrimary, textAlign: 'center' },
  successSub: { fontSize: 15, color: Colors.textMuted, textAlign: 'center', lineHeight: 22 },
  codeCard: {
    backgroundColor: 'rgba(212,175,55,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(212,175,55,0.3)',
    borderRadius: BorderRadius.xl,
    padding: Spacing['2xl'],
    alignItems: 'center',
    gap: 6,
    width: '100%',
  },
  codeLabel: { fontSize: 12, color: Colors.textMuted, textTransform: 'uppercase', letterSpacing: 1 },
  codeValue: { fontSize: 28, fontWeight: '900', color: Colors.primary, letterSpacing: 2 },
  detailsCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    gap: 10,
    width: '100%',
  },
  detailRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  detailText: { fontSize: 14, color: Colors.textSecondary },
  doneBtn: { borderRadius: BorderRadius.xl, overflow: 'hidden', width: '100%' },
  doneBtnGrad: {
    paddingVertical: 16,
    alignItems: 'center',
    borderRadius: BorderRadius.xl,
  },
  doneBtnText: { fontSize: 16, fontWeight: '700', color: '#0A0A0A' },
});
