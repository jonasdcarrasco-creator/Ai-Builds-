import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
  FlatList,
  Linking,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Spacing, BorderRadius, Shadow } from '../../constants';
import { useAppStore } from '../../store';
import type { Restaurant } from '../../types';

const { width, height } = Dimensions.get('window');
const HERO_HEIGHT = height * 0.38;

interface Props {
  navigation: any;
  route: { params: { restaurant: Restaurant } };
}

const PRICE_LABEL: Record<string, string> = {
  '$': 'Budget-friendly',
  '$$': 'Moderate',
  '$$$': 'Fine dining',
  '$$$$': 'Luxury',
};

export const RestaurantDetailScreen: React.FC<Props> = ({ navigation, route }) => {
  const { restaurant } = route.params;
  const { savedRestaurants, toggleSaveRestaurant } = useAppStore();
  const isSaved = savedRestaurants.includes(restaurant.id);
  const [activeImg, setActiveImg] = useState(0);
  const flatRef = useRef<FlatList>(null);

  const handleCall = () => {
    Linking.openURL(`tel:${restaurant.phone}`);
  };

  const handleWebsite = () => {
    if (restaurant.website) Linking.openURL(restaurant.website);
  };

  const handleBook = () => {
    navigation.navigate('BookTable', { restaurant });
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Image Gallery Hero */}
      <View style={styles.hero}>
        <FlatList
          ref={flatRef}
          data={restaurant.images.length > 0 ? restaurant.images : [restaurant.imageUrl]}
          keyExtractor={(_, i) => String(i)}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={(e) => {
            setActiveImg(Math.round(e.nativeEvent.contentOffset.x / width));
          }}
          renderItem={({ item }) => (
            <Image source={{ uri: item }} style={styles.heroImage} resizeMode="cover" />
          )}
        />
        <LinearGradient
          colors={['rgba(0,0,0,0.55)', 'transparent', 'transparent', 'rgba(0,0,0,0.6)']}
          style={StyleSheet.absoluteFillObject}
        />

        {/* Nav */}
        <View style={styles.navRow}>
          <TouchableOpacity style={styles.navBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={22} color={Colors.white} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.navBtn} onPress={() => toggleSaveRestaurant(restaurant.id)}>
            <Ionicons
              name={isSaved ? 'heart' : 'heart-outline'}
              size={22}
              color={isSaved ? Colors.primary : Colors.white}
            />
          </TouchableOpacity>
        </View>

        {/* Image dots */}
        {restaurant.images.length > 1 && (
          <View style={styles.dotsRow}>
            {restaurant.images.map((_, i) => (
              <View key={i} style={[styles.dot, i === activeImg && styles.dotActive]} />
            ))}
          </View>
        )}

        {/* Status badge */}
        <View style={styles.statusBadge}>
          <View style={[styles.statusDot, { backgroundColor: restaurant.isOpen ? Colors.success : Colors.error }]} />
          <Text style={styles.statusText}>{restaurant.isOpen ? 'Open now' : 'Closed'}</Text>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Info */}
        <View style={styles.infoBlock}>
          <View style={styles.titleRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{restaurant.name}</Text>
              <Text style={styles.cuisine}>{restaurant.cuisine}</Text>
            </View>
            {restaurant.isVerified && (
              <View style={styles.verifiedBadge}>
                <Ionicons name="checkmark-circle" size={14} color={Colors.white} />
                <Text style={styles.verifiedText}>Verified</Text>
              </View>
            )}
          </View>

          {/* Meta row */}
          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Ionicons name="star" size={14} color={Colors.accent} />
              <Text style={styles.metaValue}>{restaurant.rating}</Text>
              <Text style={styles.metaMuted}>({restaurant.reviewCount.toLocaleString()})</Text>
            </View>
            <View style={styles.metaItem}>
              <Text style={styles.price}>{restaurant.priceRange}</Text>
              <Text style={styles.metaMuted}> · {PRICE_LABEL[restaurant.priceRange]}</Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="navigate-outline" size={14} color={Colors.textSecondary} />
              <Text style={styles.metaMuted}>{restaurant.distance}</Text>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.actionsRow}>
          <TouchableOpacity style={styles.actionBtn} onPress={handleCall}>
            <View style={styles.actionIcon}>
              <Ionicons name="call-outline" size={20} color={Colors.primary} />
            </View>
            <Text style={styles.actionLabel}>Call</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} onPress={handleWebsite} disabled={!restaurant.website}>
            <View style={[styles.actionIcon, !restaurant.website && { opacity: 0.4 }]}>
              <Ionicons name="globe-outline" size={20} color={Colors.primary} />
            </View>
            <Text style={[styles.actionLabel, !restaurant.website && { opacity: 0.4 }]}>Website</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn}>
            <View style={styles.actionIcon}>
              <Ionicons name="map-outline" size={20} color={Colors.primary} />
            </View>
            <Text style={styles.actionLabel}>Directions</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn}>
            <View style={styles.actionIcon}>
              <Ionicons name="share-outline" size={20} color={Colors.primary} />
            </View>
            <Text style={styles.actionLabel}>Share</Text>
          </TouchableOpacity>
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.description}>{restaurant.description}</Text>
        </View>

        {/* Address */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Location</Text>
          <View style={styles.addressCard}>
            <Ionicons name="location" size={18} color={Colors.primary} />
            <Text style={styles.addressText}>{restaurant.address}</Text>
          </View>
        </View>

        {/* Ambiance */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ambiance</Text>
          <View style={styles.chipRow}>
            {restaurant.ambiance.map((a, i) => (
              <View key={i} style={styles.ambianceChip}>
                <Text style={styles.ambianceText}>{a}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Features */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Features</Text>
          <View style={styles.featuresGrid}>
            {restaurant.features.map((f, i) => (
              <View key={i} style={styles.featureItem}>
                <Ionicons name="checkmark-circle-outline" size={16} color={Colors.success} />
                <Text style={styles.featureText}>{f}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Hours */}
        {restaurant.hours && restaurant.hours.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Hours</Text>
            <View style={styles.hoursCard}>
              {restaurant.hours.map((h, i) => (
                <View key={i} style={[styles.hoursRow, i < restaurant.hours.length - 1 && styles.hoursBorder]}>
                  <Text style={styles.hoursDay}>{h.day}</Text>
                  <Text style={styles.hoursTime}>{h.open} – {h.close}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Available slots preview */}
        {restaurant.availableSlots && restaurant.availableSlots.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Available Tonight</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.slotsRow}>
                {restaurant.availableSlots.slice(0, 6).map((slot, i) => {
                  const pct = slot.available / slot.total;
                  const isLow = pct < 0.3;
                  return (
                    <TouchableOpacity key={i} style={styles.slotChip} onPress={handleBook}>
                      <Text style={styles.slotTime}>{slot.time}</Text>
                      {isLow && (
                        <Text style={styles.slotLow}>Only {slot.available} left</Text>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>
          </View>
        )}

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Bottom CTA */}
      <View style={styles.bottomBar}>
        <View style={styles.bottomMeta}>
          <Text style={styles.bottomPrice}>{restaurant.priceRange}</Text>
          <Text style={styles.bottomCuisine}>{restaurant.cuisine}</Text>
        </View>
        <TouchableOpacity style={styles.bookBtn} onPress={handleBook} activeOpacity={0.85}>
          <LinearGradient
            colors={['#FF6B9D', '#E85585']}
            style={styles.bookGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Ionicons name="calendar-outline" size={18} color={Colors.white} />
            <Text style={styles.bookText}>Book a Table</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  hero: { width, height: HERO_HEIGHT, position: 'relative' },
  heroImage: { width, height: HERO_HEIGHT },
  navRow: {
    position: 'absolute',
    top: 52,
    left: Spacing.base,
    right: Spacing.base,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  navBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotsRow: {
    position: 'absolute',
    bottom: 56,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  dotActive: { backgroundColor: Colors.white, width: 18 },
  statusBadge: {
    position: 'absolute',
    bottom: Spacing.base,
    left: Spacing.base,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(0,0,0,0.45)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: BorderRadius.full,
  },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  statusText: { color: Colors.white, fontSize: 12, fontWeight: '600' },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 20 },
  infoBlock: { padding: Spacing.base },
  titleRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 8 },
  name: { fontSize: 24, fontWeight: '800', color: Colors.textPrimary },
  cuisine: { fontSize: 14, color: Colors.textSecondary, marginTop: 2 },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.success,
    borderRadius: BorderRadius.full,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  verifiedText: { color: Colors.white, fontSize: 11, fontWeight: '700' },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaValue: { fontSize: 14, fontWeight: '700', color: Colors.textPrimary },
  metaMuted: { fontSize: 13, color: Colors.textSecondary },
  price: { fontSize: 14, fontWeight: '700', color: Colors.secondary },
  actionsRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.base,
    gap: 8,
    marginBottom: 4,
  },
  actionBtn: { flex: 1, alignItems: 'center', gap: 6 },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionLabel: { fontSize: 11, color: Colors.textSecondary, fontWeight: '600' },
  section: { paddingHorizontal: Spacing.base, paddingTop: Spacing.lg },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 10,
  },
  description: { fontSize: 15, color: Colors.textSecondary, lineHeight: 22 },
  addressCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: 14,
    ...Shadow.sm,
  },
  addressText: { flex: 1, fontSize: 14, color: Colors.textPrimary, lineHeight: 20 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  ambianceChip: {
    backgroundColor: Colors.surfaceAlt,
    borderRadius: BorderRadius.full,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: Colors.primaryLight + '40',
  },
  ambianceText: { fontSize: 13, color: Colors.primary, fontWeight: '600' },
  featuresGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    width: '47%',
  },
  featureText: { fontSize: 13, color: Colors.textPrimary, fontWeight: '500', flex: 1 },
  hoursCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    ...Shadow.sm,
  },
  hoursRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 12,
    paddingHorizontal: 16,
  },
  hoursBorder: { borderBottomWidth: 1, borderBottomColor: Colors.gray100 },
  hoursDay: { fontSize: 14, color: Colors.textPrimary, fontWeight: '600' },
  hoursTime: { fontSize: 14, color: Colors.textSecondary },
  slotsRow: { flexDirection: 'row', gap: 8, paddingBottom: 4 },
  slotChip: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: 16,
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: Colors.primary + '40',
    ...Shadow.sm,
  },
  slotTime: { fontSize: 14, fontWeight: '700', color: Colors.textPrimary },
  slotLow: { fontSize: 10, color: Colors.error, fontWeight: '600', marginTop: 2 },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingHorizontal: Spacing.base,
    paddingBottom: 32,
    paddingTop: 12,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.gray100,
  },
  bottomMeta: { flex: 0 },
  bottomPrice: { fontSize: 18, fontWeight: '800', color: Colors.secondary },
  bottomCuisine: { fontSize: 11, color: Colors.textMuted },
  bookBtn: { flex: 1, borderRadius: BorderRadius.xl, overflow: 'hidden' },
  bookGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
  },
  bookText: { color: Colors.white, fontSize: 16, fontWeight: '700' },
});
