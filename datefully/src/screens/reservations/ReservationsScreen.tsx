import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Spacing, BorderRadius, Shadow } from '../../constants';
import { RestaurantCard } from '../../components/cards/RestaurantCard';
import { useAppStore } from '../../store';
import { MOCK_RESTAURANTS } from '../../constants/mockData';
import { Restaurant, Reservation } from '../../types';

interface ReservationsScreenProps {
  navigation: any;
}

export const ReservationsScreen: React.FC<ReservationsScreenProps> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { reservations, addReservation, cancelReservation } = useAppStore();
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [selectedTime, setSelectedTime] = useState('');
  const [partySize, setPartySize] = useState(2);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [specialRequests, setSpecialRequests] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<'restaurants' | 'mybookings'>('restaurants');

  const handleSelectRestaurant = (restaurant: Restaurant) => {
    setSelectedRestaurant(restaurant);
    setSelectedTime('');
    setShowBookingModal(true);
  };

  const handleBook = () => {
    if (!selectedTime) {
      Alert.alert('Select a time', 'Please choose a time slot to continue.');
      return;
    }
    const reservation: Reservation = {
      id: Date.now().toString(),
      restaurantId: selectedRestaurant!.id,
      restaurantName: selectedRestaurant!.name,
      restaurantImage: selectedRestaurant!.imageUrl,
      date: new Date().toISOString().split('T')[0],
      time: selectedTime,
      partySize,
      specialRequests: specialRequests || undefined,
      status: 'confirmed',
      confirmationCode: `DATE-${Math.random().toString(36).toUpperCase().slice(2, 8)}`,
      createdAt: new Date().toISOString(),
    };
    addReservation(reservation);
    setBookingSuccess(true);
    setTimeout(() => {
      setBookingSuccess(false);
      setShowBookingModal(false);
      setSelectedRestaurant(null);
      setSelectedTime('');
      setPartySize(2);
      setActiveTab('mybookings');
    }, 2000);
  };

  const upcomingReservations = reservations.filter((r) => r.status === 'confirmed' || r.status === 'pending');
  const pastReservations = reservations.filter((r) => r.status === 'completed' || r.status === 'cancelled');

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + Spacing.base }]}>
        <Text style={styles.headerTitle}>Reservations</Text>
        <Text style={styles.headerSubtitle}>Book the best tables in town</Text>

        {/* Tabs */}
        <View style={styles.tabsRow}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'restaurants' && styles.tabActive]}
            onPress={() => setActiveTab('restaurants')}
          >
            <Text style={[styles.tabText, activeTab === 'restaurants' && styles.tabTextActive]}>
              Restaurants
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'mybookings' && styles.tabActive]}
            onPress={() => setActiveTab('mybookings')}
          >
            <Text style={[styles.tabText, activeTab === 'mybookings' && styles.tabTextActive]}>
              My Bookings {reservations.length > 0 ? `(${reservations.length})` : ''}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        {activeTab === 'restaurants' ? (
          <View style={styles.restaurantsList}>
            {MOCK_RESTAURANTS.map((r) => (
              <RestaurantCard
                key={r.id}
                restaurant={r}
                onPress={() => handleSelectRestaurant(r)}
              />
            ))}
          </View>
        ) : (
          <View style={styles.bookingsList}>
            {reservations.length === 0 ? (
              <View style={styles.emptyBookings}>
                <Text style={styles.emptyEmoji}>🍽️</Text>
                <Text style={styles.emptyTitle}>No reservations yet</Text>
                <Text style={styles.emptySubtitle}>
                  Browse restaurants and book a table for your next date.
                </Text>
                <TouchableOpacity
                  style={styles.browseBtn}
                  onPress={() => setActiveTab('restaurants')}
                >
                  <Text style={styles.browseBtnText}>Browse Restaurants</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <>
                {upcomingReservations.length > 0 && (
                  <>
                    <Text style={styles.bookingSection}>Upcoming</Text>
                    {upcomingReservations.map((r) => (
                      <ReservationCard
                        key={r.id}
                        reservation={r}
                        onCancel={() => {
                          Alert.alert(
                            'Cancel Reservation',
                            'Are you sure you want to cancel this reservation?',
                            [
                              { text: 'Keep It', style: 'cancel' },
                              {
                                text: 'Cancel Reservation',
                                style: 'destructive',
                                onPress: () => cancelReservation(r.id),
                              },
                            ]
                          );
                        }}
                      />
                    ))}
                  </>
                )}
                {pastReservations.length > 0 && (
                  <>
                    <Text style={[styles.bookingSection, { marginTop: Spacing.xl }]}>Past</Text>
                    {pastReservations.map((r) => (
                      <ReservationCard key={r.id} reservation={r} />
                    ))}
                  </>
                )}
              </>
            )}
          </View>
        )}
      </ScrollView>

      {/* Booking Modal */}
      <Modal
        visible={showBookingModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modal}>
          {bookingSuccess ? (
            <View style={styles.successView}>
              <LinearGradient
                colors={['#FF6B9D', '#9B59B6']}
                style={styles.successGradient}
              >
                <Text style={styles.successEmoji}>🎉</Text>
                <Text style={styles.successTitle}>Reservation Confirmed!</Text>
                <Text style={styles.successSubtitle}>
                  You're all set at {selectedRestaurant?.name}
                </Text>
              </LinearGradient>
            </View>
          ) : (
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.modalHeader}>
                <View>
                  <Text style={styles.modalTitle}>{selectedRestaurant?.name}</Text>
                  <Text style={styles.modalSubtitle}>{selectedRestaurant?.cuisine}</Text>
                </View>
                <TouchableOpacity
                  onPress={() => setShowBookingModal(false)}
                  style={styles.closeBtn}
                >
                  <Ionicons name="close" size={22} color={Colors.textPrimary} />
                </TouchableOpacity>
              </View>

              {/* Party Size */}
              <View style={styles.modalSection}>
                <Text style={styles.modalSectionTitle}>Party Size</Text>
                <View style={styles.partySizeRow}>
                  <TouchableOpacity
                    style={styles.partySizeBtn}
                    onPress={() => setPartySize(Math.max(1, partySize - 1))}
                  >
                    <Ionicons name="remove" size={20} color={Colors.primary} />
                  </TouchableOpacity>
                  <View style={styles.partySizeDisplay}>
                    <Ionicons name="people-outline" size={20} color={Colors.textPrimary} />
                    <Text style={styles.partySizeText}>{partySize} people</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.partySizeBtn}
                    onPress={() => setPartySize(Math.min(12, partySize + 1))}
                  >
                    <Ionicons name="add" size={20} color={Colors.primary} />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Time Slots */}
              <View style={styles.modalSection}>
                <Text style={styles.modalSectionTitle}>Available Times</Text>
                <View style={styles.timeSlotsGrid}>
                  {selectedRestaurant?.availableSlots.map((slot) => (
                    <TouchableOpacity
                      key={slot.time}
                      style={[
                        styles.timeSlot,
                        slot.available === 0 && styles.timeSlotUnavailable,
                        selectedTime === slot.time && styles.timeSlotSelected,
                      ]}
                      onPress={() => slot.available > 0 && setSelectedTime(slot.time)}
                      disabled={slot.available === 0}
                    >
                      <Text style={[
                        styles.timeSlotText,
                        selectedTime === slot.time && styles.timeSlotTextSelected,
                        slot.available === 0 && styles.timeSlotTextUnavailable,
                      ]}>
                        {slot.time}
                      </Text>
                      {slot.available === 0 ? (
                        <Text style={styles.timeSlotAvail}>Full</Text>
                      ) : (
                        <Text style={[
                          styles.timeSlotAvail,
                          selectedTime === slot.time && { color: 'rgba(255,255,255,0.8)' }
                        ]}>
                          {slot.available} left
                        </Text>
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Special Requests */}
              <View style={styles.modalSection}>
                <Text style={styles.modalSectionTitle}>Special Requests (optional)</Text>
                <View style={styles.requestInput}>
                  <Ionicons name="chatbubble-outline" size={16} color={Colors.textMuted} />
                  <Text style={styles.requestPlaceholder}>
                    Anniversary, dietary needs, seating preference...
                  </Text>
                </View>
              </View>

              <View style={styles.modalFooter}>
                <View style={styles.bookingSummary}>
                  <Text style={styles.summaryLabel}>Summary</Text>
                  <Text style={styles.summaryText}>
                    {partySize} {partySize === 1 ? 'person' : 'people'}{selectedTime ? ` · ${selectedTime}` : ''}
                  </Text>
                </View>
                <TouchableOpacity style={styles.bookBtn} onPress={handleBook}>
                  <LinearGradient
                    colors={['#FF6B9D', '#E85585']}
                    style={styles.bookBtnGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  >
                    <Text style={styles.bookBtnText}>Confirm Reservation</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </ScrollView>
          )}
        </View>
      </Modal>
    </View>
  );
};

const ReservationCard: React.FC<{
  reservation: Reservation;
  onCancel?: () => void;
}> = ({ reservation, onCancel }) => {
  const statusColors: Record<string, string> = {
    confirmed: Colors.success,
    pending: Colors.warning,
    cancelled: Colors.error,
    completed: Colors.gray400,
  };

  return (
    <View style={[styles.reservationCard, Shadow.sm]}>
      <View style={styles.reservationHeader}>
        <View>
          <Text style={styles.reservationName}>{reservation.restaurantName}</Text>
          <Text style={styles.reservationDetails}>
            {reservation.date} · {reservation.time} · {reservation.partySize} people
          </Text>
        </View>
        <View style={[
          styles.reservationStatus,
          { backgroundColor: statusColors[reservation.status] + '20' }
        ]}>
          <Text style={[styles.reservationStatusText, { color: statusColors[reservation.status] }]}>
            {reservation.status.charAt(0).toUpperCase() + reservation.status.slice(1)}
          </Text>
        </View>
      </View>
      <View style={styles.confirmationRow}>
        <Ionicons name="checkmark-circle-outline" size={14} color={Colors.success} />
        <Text style={styles.confirmationCode}>{reservation.confirmationCode}</Text>
      </View>
      {onCancel && reservation.status === 'confirmed' && (
        <TouchableOpacity onPress={onCancel} style={styles.cancelResBtn}>
          <Text style={styles.cancelResBtnText}>Cancel Reservation</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: Spacing.base,
    paddingBottom: 0,
    backgroundColor: Colors.background,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  headerSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
    marginBottom: Spacing.base,
  },
  tabsRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray100,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: Colors.primary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textMuted,
  },
  tabTextActive: {
    color: Colors.primary,
  },
  restaurantsList: {
    padding: Spacing.base,
  },
  bookingsList: {
    padding: Spacing.base,
  },
  emptyBookings: {
    alignItems: 'center',
    paddingVertical: Spacing['3xl'],
    gap: Spacing.md,
  },
  emptyEmoji: {
    fontSize: 48,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  emptySubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  browseBtn: {
    marginTop: Spacing.sm,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.full,
  },
  browseBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.white,
  },
  bookingSection: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: Spacing.md,
  },
  reservationCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl,
    padding: Spacing.base,
    marginBottom: Spacing.md,
    gap: Spacing.md,
  },
  reservationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: Spacing.md,
  },
  reservationName: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  reservationDetails: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 3,
  },
  reservationStatus: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  reservationStatusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  confirmationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  confirmationCode: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
    fontFamily: 'monospace',
  },
  cancelResBtn: {
    alignSelf: 'flex-start',
  },
  cancelResBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.error,
  },
  // Modal
  modal: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray100,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  modalSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.gray100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalSection: {
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray100,
  },
  modalSectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  partySizeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.gray50,
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
  },
  partySizeBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  partySizeDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  partySizeText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  timeSlotsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  timeSlot: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: BorderRadius.lg,
    borderWidth: 1.5,
    borderColor: Colors.gray200,
    backgroundColor: Colors.white,
    alignItems: 'center',
    minWidth: 90,
  },
  timeSlotUnavailable: {
    backgroundColor: Colors.gray100,
    borderColor: Colors.gray200,
    opacity: 0.5,
  },
  timeSlotSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  timeSlotText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  timeSlotTextSelected: {
    color: Colors.white,
  },
  timeSlotTextUnavailable: {
    color: Colors.textMuted,
  },
  timeSlotAvail: {
    fontSize: 10,
    color: Colors.textMuted,
    marginTop: 2,
  },
  requestInput: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.gray50,
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.gray200,
  },
  requestPlaceholder: {
    fontSize: 13,
    color: Colors.textMuted,
    flex: 1,
  },
  modalFooter: {
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  bookingSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  summaryText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  bookBtn: {
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
  },
  bookBtnGradient: {
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bookBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.white,
    letterSpacing: 0.3,
  },
  successView: {
    flex: 1,
  },
  successGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.lg,
    padding: Spacing['3xl'],
  },
  successEmoji: {
    fontSize: 72,
  },
  successTitle: {
    fontSize: 30,
    fontWeight: '900',
    color: Colors.white,
    textAlign: 'center',
  },
  successSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.85)',
    textAlign: 'center',
    lineHeight: 24,
  },
});
