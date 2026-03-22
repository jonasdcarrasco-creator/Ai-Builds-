import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Restaurant } from '../../types';
import { Colors, BorderRadius, Spacing, Shadow } from '../../constants';

interface RestaurantCardProps {
  restaurant: Restaurant;
  onPress: () => void;
  variant?: 'default' | 'compact';
}

const PRICE_MAP: Record<string, string> = {
  '$': '~$15',
  '$$': '~$40',
  '$$$': '~$80',
  '$$$$': '$120+',
};

export const RestaurantCard: React.FC<RestaurantCardProps> = ({
  restaurant,
  onPress,
  variant = 'default',
}) => {
  if (variant === 'compact') {
    return (
      <TouchableOpacity
        style={[styles.compact, Shadow.sm]}
        onPress={onPress}
        activeOpacity={0.9}
      >
        <Image source={{ uri: restaurant.imageUrl }} style={styles.compactImage} />
        <View style={styles.compactContent}>
          <Text style={styles.compactName} numberOfLines={1}>{restaurant.name}</Text>
          <Text style={styles.compactCuisine}>{restaurant.cuisine}</Text>
          <View style={styles.compactMeta}>
            <Ionicons name="star" size={11} color={Colors.accent} />
            <Text style={styles.compactRating}>{restaurant.rating}</Text>
            <Text style={styles.compactDot}>·</Text>
            <Text style={styles.compactPrice}>{restaurant.priceRange}</Text>
            <Text style={styles.compactDot}>·</Text>
            <Text style={styles.compactDistance}>{restaurant.distance}</Text>
          </View>
          <View style={[
            styles.openBadge,
            { backgroundColor: restaurant.isOpen ? '#D1FAE5' : '#FEE2E2' }
          ]}>
            <View style={[
              styles.openDot,
              { backgroundColor: restaurant.isOpen ? Colors.success : Colors.error }
            ]} />
            <Text style={[
              styles.openText,
              { color: restaurant.isOpen ? '#065F46' : '#991B1B' }
            ]}>
              {restaurant.isOpen ? 'Open now' : 'Closed'}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={[styles.card, Shadow.md]}
      onPress={onPress}
      activeOpacity={0.9}
    >
      <Image source={{ uri: restaurant.imageUrl }} style={styles.image} />
      {restaurant.isVerified && (
        <View style={styles.verifiedBadge}>
          <Ionicons name="checkmark-circle" size={14} color={Colors.white} />
          <Text style={styles.verifiedText}>Verified</Text>
        </View>
      )}
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.name}>{restaurant.name}</Text>
            <Text style={styles.cuisine}>{restaurant.cuisine}</Text>
          </View>
          <View style={styles.headerRight}>
            <View style={styles.ratingBadge}>
              <Ionicons name="star" size={13} color={Colors.accent} />
              <Text style={styles.ratingText}>{restaurant.rating}</Text>
            </View>
            <Text style={styles.reviewCount}>
              {restaurant.reviewCount.toLocaleString()} reviews
            </Text>
          </View>
        </View>

        <View style={styles.ambianceRow}>
          {restaurant.ambiance.slice(0, 3).map((tag) => (
            <View key={tag} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>

        <View style={styles.footer}>
          <View style={styles.footerLeft}>
            <View style={styles.infoItem}>
              <Ionicons name="location-outline" size={13} color={Colors.textMuted} />
              <Text style={styles.infoText}>{restaurant.distance}</Text>
            </View>
            <View style={styles.infoItem}>
              <Ionicons name="cash-outline" size={13} color={Colors.textMuted} />
              <Text style={styles.infoText}>
                {restaurant.priceRange} · {PRICE_MAP[restaurant.priceRange] || 'per person'}
              </Text>
            </View>
          </View>
          <View style={[
            styles.openBadge,
            { backgroundColor: restaurant.isOpen ? '#D1FAE5' : '#FEE2E2' }
          ]}>
            <View style={[
              styles.openDot,
              { backgroundColor: restaurant.isOpen ? Colors.success : Colors.error }
            ]} />
            <Text style={[
              styles.openText,
              { color: restaurant.isOpen ? '#065F46' : '#991B1B' }
            ]}>
              {restaurant.isOpen ? 'Open' : 'Closed'}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    marginBottom: Spacing.base,
  },
  image: {
    width: '100%',
    height: 180,
  },
  verifiedBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  verifiedText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.white,
  },
  content: {
    padding: Spacing.base,
    gap: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerLeft: {
    flex: 1,
    gap: 3,
  },
  headerRight: {
    alignItems: 'flex-end',
    gap: 2,
  },
  name: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  cuisine: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#FFF9E6',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  ratingText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.accent,
  },
  reviewCount: {
    fontSize: 11,
    color: Colors.textMuted,
  },
  ambianceRow: {
    flexDirection: 'row',
    gap: 8,
  },
  tag: {
    backgroundColor: Colors.surfaceAlt,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  tagText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.primary,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerLeft: {
    gap: 4,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  infoText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  openBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  openDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  openText: {
    fontSize: 12,
    fontWeight: '600',
  },

  // Compact
  compact: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    marginBottom: Spacing.sm,
    padding: Spacing.sm,
    gap: Spacing.md,
    alignItems: 'center',
  },
  compactImage: {
    width: 72,
    height: 72,
    borderRadius: BorderRadius.md,
  },
  compactContent: {
    flex: 1,
    gap: 3,
  },
  compactName: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  compactCuisine: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  compactMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  compactRating: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  compactDot: {
    color: Colors.textMuted,
    fontSize: 10,
  },
  compactPrice: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  compactDistance: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
});
