import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius } from '../../constants';
import { Restaurant } from '../../types';

interface RestaurantCardProps {
  restaurant: Restaurant;
  onPress?: () => void;
  onBook?: () => void;
  variant?: 'full' | 'compact';
}

export const RestaurantCard: React.FC<RestaurantCardProps> = ({
  restaurant: r,
  onPress,
  onBook,
  variant = 'compact',
}) => {
  if (variant === 'full') {
    return (
      <TouchableOpacity
        style={styles.full}
        activeOpacity={0.92}
        onPress={onPress}
      >
        <Image source={{ uri: r.imageUrl }} style={styles.fullImg} resizeMode="cover" />
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.85)']}
          style={StyleSheet.absoluteFill}
        />
        {r.isVerified && (
          <View style={styles.verifiedBadge}>
            <Ionicons name="checkmark-circle" size={12} color={Colors.primary} />
            <Text style={styles.verifiedText}>Verified</Text>
          </View>
        )}
        <View style={styles.fullInfo}>
          <Text style={styles.fullName}>{r.name}</Text>
          <View style={styles.metaRow}>
            <View style={styles.ratingRow}>
              <Ionicons name="star" size={12} color={Colors.primary} />
              <Text style={styles.ratingText}>{r.rating}</Text>
            </View>
            <Text style={styles.dot}>·</Text>
            <Text style={styles.cuisine}>{r.cuisine}</Text>
            <Text style={styles.dot}>·</Text>
            <Text style={styles.price}>{r.priceRange}</Text>
            {r.distance && (
              <>
                <Text style={styles.dot}>·</Text>
                <Text style={styles.distance}>{r.distance}</Text>
              </>
            )}
          </View>
          {onBook && (
            <TouchableOpacity onPress={onBook}>
              <LinearGradient
                colors={['#D4AF37', '#B8942A']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.bookBtn}
              >
                <Ionicons name="calendar-outline" size={14} color="#0A0A0A" />
                <Text style={styles.bookBtnText}>Reserve</Text>
              </LinearGradient>
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    );
  }

  // compact
  return (
    <TouchableOpacity
      style={styles.compact}
      activeOpacity={0.9}
      onPress={onPress}
    >
      <Image source={{ uri: r.imageUrl }} style={styles.compactImg} />
      <View style={styles.compactInfo}>
        <Text style={styles.compactName} numberOfLines={1}>{r.name}</Text>
        <Text style={styles.compactCuisine}>{r.cuisine}</Text>
        <View style={styles.metaRow}>
          <View style={styles.ratingRow}>
            <Ionicons name="star" size={10} color={Colors.primary} />
            <Text style={[styles.ratingText, { fontSize: 11 }]}>{r.rating}</Text>
          </View>
          <Text style={styles.dot}>·</Text>
          <Text style={[styles.price, { fontSize: 11 }]}>{r.priceRange}</Text>
          {r.distance && (
            <>
              <Text style={styles.dot}>·</Text>
              <Text style={[styles.distance, { fontSize: 11 }]}>{r.distance}</Text>
            </>
          )}
        </View>
      </View>
      {onBook && (
        <TouchableOpacity
          style={styles.compactBookBtn}
          onPress={onBook}
        >
          <Text style={styles.compactBookText}>Reserve</Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  // Full variant
  full: {
    height: 240,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    marginBottom: 16,
    backgroundColor: Colors.surfaceAlt,
  },
  fullImg: { ...StyleSheet.absoluteFillObject },
  verifiedBadge: {
    position: 'absolute',
    top: 12, left: 12,
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
  fullInfo: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    padding: 16,
    gap: 8,
  },
  fullName: { fontSize: 20, fontWeight: '800', color: '#fff' },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  ratingText: { fontSize: 12, color: Colors.primary, fontWeight: '700' },
  dot: { color: 'rgba(255,255,255,0.45)', fontSize: 12 },
  cuisine: { fontSize: 12, color: 'rgba(255,255,255,0.8)' },
  price: { fontSize: 12, color: 'rgba(255,255,255,0.8)' },
  distance: { fontSize: 12, color: 'rgba(255,255,255,0.8)' },
  bookBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 11,
    borderRadius: BorderRadius.lg,
  },
  bookBtnText: { fontSize: 14, fontWeight: '700', color: '#0A0A0A' },

  // Compact variant
  compact: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    alignItems: 'center',
  },
  compactImg: { width: 80, height: 80 },
  compactInfo: { flex: 1, padding: 12, gap: 4 },
  compactName: { fontSize: 14, fontWeight: '700', color: Colors.textPrimary },
  compactCuisine: { fontSize: 12, color: Colors.textMuted },
  compactBookBtn: {
    marginRight: 12,
    paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.secondary,
  },
  compactBookText: { fontSize: 12, fontWeight: '700', color: '#fff' },
});
