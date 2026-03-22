import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { DateIdea } from '../../types';
import { Colors, BorderRadius, Spacing, Shadow } from '../../constants';
import { useAppStore } from '../../store';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH * 0.72;

interface DateIdeaCardProps {
  idea: DateIdea;
  onPress: () => void;
  variant?: 'large' | 'compact' | 'horizontal';
}

const PRICE_LABELS: Record<string, string> = {
  '$': 'Budget',
  '$$': 'Moderate',
  '$$$': 'Upscale',
  '$$$$': 'Luxury',
};

export const DateIdeaCard: React.FC<DateIdeaCardProps> = ({
  idea,
  onPress,
  variant = 'large',
}) => {
  const { savedIdeas, toggleSaveIdea } = useAppStore();
  const isSaved = savedIdeas.includes(idea.id);

  if (variant === 'horizontal') {
    return (
      <TouchableOpacity
        style={[styles.horizontal, Shadow.md]}
        onPress={onPress}
        activeOpacity={0.9}
      >
        <Image source={{ uri: idea.imageUrl }} style={styles.horizontalImage} />
        <View style={styles.horizontalContent}>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{idea.category}</Text>
          </View>
          <Text style={styles.horizontalTitle} numberOfLines={2}>{idea.title}</Text>
          <View style={styles.metaRow}>
            <Ionicons name="star" size={12} color={Colors.accent} />
            <Text style={styles.rating}>{idea.rating}</Text>
            <Text style={styles.metaDot}>·</Text>
            <Text style={styles.priceLabel}>{PRICE_LABELS[idea.priceRange]}</Text>
            <Text style={styles.metaDot}>·</Text>
            <Text style={styles.duration}>{idea.estimatedDuration}</Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.saveButtonSmall}
          onPress={() => toggleSaveIdea(idea.id)}
        >
          <Ionicons
            name={isSaved ? 'heart' : 'heart-outline'}
            size={18}
            color={isSaved ? Colors.primary : Colors.gray400}
          />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  }

  if (variant === 'compact') {
    return (
      <TouchableOpacity
        style={[styles.compact, Shadow.sm]}
        onPress={onPress}
        activeOpacity={0.9}
      >
        <Image source={{ uri: idea.imageUrl }} style={styles.compactImage} />
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.85)']}
          style={styles.compactGradient}
        >
          <View style={styles.compactContent}>
            <Text style={styles.compactTitle} numberOfLines={2}>{idea.title}</Text>
            <View style={styles.compactMeta}>
              <Ionicons name="star" size={11} color={Colors.accent} />
              <Text style={styles.compactRating}>{idea.rating}</Text>
              <Text style={styles.compactPrice}>{idea.priceRange}</Text>
            </View>
          </View>
        </LinearGradient>
        <TouchableOpacity
          style={styles.saveButtonOverlay}
          onPress={() => toggleSaveIdea(idea.id)}
        >
          <Ionicons
            name={isSaved ? 'heart' : 'heart-outline'}
            size={16}
            color={isSaved ? Colors.primary : Colors.white}
          />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  }

  // Large card (default)
  return (
    <TouchableOpacity
      style={[styles.large, Shadow.lg]}
      onPress={onPress}
      activeOpacity={0.92}
    >
      <Image source={{ uri: idea.imageUrl }} style={styles.largeImage} />
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.9)']}
        style={styles.largeGradient}
      >
        {idea.isFeatured && (
          <View style={styles.featuredBadge}>
            <Ionicons name="sparkles" size={10} color={Colors.white} />
            <Text style={styles.featuredText}>Featured</Text>
          </View>
        )}
        <View style={styles.largeContent}>
          <View style={styles.largeTopRow}>
            <View style={styles.categoryPill}>
              <Text style={styles.categoryPillText}>{idea.category}</Text>
            </View>
            <View style={styles.pricePill}>
              <Text style={styles.priceText}>{idea.priceRange}</Text>
            </View>
          </View>
          <Text style={styles.largeTitle}>{idea.title}</Text>
          <Text style={styles.largeDescription} numberOfLines={2}>
            {idea.description}
          </Text>
          <View style={styles.largeMeta}>
            <View style={styles.ratingRow}>
              <Ionicons name="star" size={13} color={Colors.accent} />
              <Text style={styles.largeRating}>{idea.rating}</Text>
              <Text style={styles.reviewCount}>({idea.reviewCount.toLocaleString()})</Text>
            </View>
            {idea.distance && (
              <View style={styles.distanceRow}>
                <Ionicons name="location-outline" size={13} color="rgba(255,255,255,0.7)" />
                <Text style={styles.distanceText}>{idea.distance}</Text>
              </View>
            )}
            <View style={styles.durationRow}>
              <Ionicons name="time-outline" size={13} color="rgba(255,255,255,0.7)" />
              <Text style={styles.durationText}>{idea.estimatedDuration}</Text>
            </View>
          </View>
        </View>
      </LinearGradient>
      <TouchableOpacity
        style={styles.saveButton}
        onPress={() => toggleSaveIdea(idea.id)}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Ionicons
          name={isSaved ? 'heart' : 'heart-outline'}
          size={22}
          color={isSaved ? Colors.primary : Colors.white}
        />
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  // Large
  large: {
    width: CARD_WIDTH,
    height: 380,
    borderRadius: BorderRadius['2xl'],
    overflow: 'hidden',
    marginRight: Spacing.base,
    backgroundColor: Colors.gray800,
  },
  largeImage: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: BorderRadius['2xl'],
  },
  largeGradient: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-between',
    padding: Spacing.base,
  },
  featuredBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
    backgroundColor: Colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
    gap: 4,
  },
  featuredText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.white,
    letterSpacing: 0.5,
  },
  largeContent: {
    gap: 6,
  },
  largeTopRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 4,
  },
  categoryPill: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  categoryPillText: {
    fontSize: 11,
    color: Colors.white,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  pricePill: {
    backgroundColor: 'rgba(255,107,157,0.8)',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  priceText: {
    fontSize: 11,
    color: Colors.white,
    fontWeight: '700',
  },
  largeTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.white,
    lineHeight: 28,
  },
  largeDescription: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.75)',
    lineHeight: 19,
  },
  largeMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 4,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  largeRating: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.white,
  },
  reviewCount: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.6)',
  },
  distanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  distanceText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
  },
  durationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  durationText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
  },
  saveButton: {
    position: 'absolute',
    top: Spacing.base,
    left: Spacing.base,
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: BorderRadius.full,
    padding: 8,
  },

  // Compact
  compact: {
    width: 160,
    height: 200,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    marginRight: Spacing.md,
    backgroundColor: Colors.gray800,
  },
  compactImage: {
    ...StyleSheet.absoluteFillObject,
  },
  compactGradient: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
  },
  compactContent: {
    padding: Spacing.md,
  },
  compactTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.white,
    marginBottom: 4,
    lineHeight: 18,
  },
  compactMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  compactRating: {
    fontSize: 11,
    color: Colors.white,
    fontWeight: '600',
  },
  compactPrice: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.7)',
    marginLeft: 4,
  },
  saveButtonOverlay: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.35)',
    borderRadius: BorderRadius.full,
    padding: 6,
  },

  // Horizontal
  horizontal: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    marginBottom: Spacing.md,
    padding: Spacing.md,
    gap: Spacing.md,
  },
  horizontalImage: {
    width: 80,
    height: 80,
    borderRadius: BorderRadius.lg,
  },
  horizontalContent: {
    flex: 1,
    gap: 4,
  },
  categoryBadge: {
    backgroundColor: Colors.surfaceAlt,
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  categoryText: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.primary,
    textTransform: 'capitalize',
  },
  horizontalTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
    lineHeight: 20,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  rating: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  metaDot: {
    fontSize: 10,
    color: Colors.textMuted,
  },
  priceLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  duration: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  saveButtonSmall: {
    padding: 6,
  },
});
