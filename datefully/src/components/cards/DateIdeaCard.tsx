import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius } from '../../constants';
import { DateIdea } from '../../types';
import { useAppStore } from '../../store';

const { width: W } = Dimensions.get('window');

interface DateIdeaCardProps {
  idea: DateIdea;
  variant?: 'large' | 'horizontal' | 'compact';
  onPress?: () => void;
}

export const DateIdeaCard: React.FC<DateIdeaCardProps> = ({
  idea,
  variant = 'horizontal',
  onPress,
}) => {
  const { savedIdeas, toggleSaveIdea } = useAppStore();
  const saved = savedIdeas.includes(idea.id);

  if (variant === 'large') {
    return (
      <TouchableOpacity
        style={styles.large}
        activeOpacity={0.92}
        onPress={onPress}
      >
        <Image source={{ uri: idea.imageUrl }} style={styles.largeImg} resizeMode="cover" />
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.9)']}
          style={StyleSheet.absoluteFill}
        />
        {idea.isFeatured && (
          <View style={styles.featuredBadge}>
            <Ionicons name="star" size={11} color={Colors.primary} />
            <Text style={styles.featuredText}>Featured</Text>
          </View>
        )}
        <TouchableOpacity
          style={styles.heartLarge}
          onPress={() => toggleSaveIdea(idea.id)}
        >
          <Ionicons
            name={saved ? 'heart' : 'heart-outline'}
            size={18}
            color={saved ? Colors.primary : '#fff'}
          />
        </TouchableOpacity>
        <View style={styles.largeInfo}>
          <Text style={styles.largePriceRange}>{idea.priceRange}</Text>
          <Text style={styles.largeTitle} numberOfLines={2}>{idea.title}</Text>
          <View style={styles.largeMeta}>
            <Ionicons name="star" size={12} color={Colors.primary} />
            <Text style={styles.largeRating}>{idea.rating}</Text>
            <Text style={styles.largeDot}>·</Text>
            <Text style={styles.largeDur}>{idea.estimatedDuration}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  if (variant === 'compact') {
    return (
      <TouchableOpacity
        style={styles.compact}
        activeOpacity={0.92}
        onPress={onPress}
      >
        <Image source={{ uri: idea.imageUrl }} style={styles.compactImg} resizeMode="cover" />
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.85)']}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.compactInfo}>
          <Text style={styles.compactTitle} numberOfLines={2}>{idea.title}</Text>
          <View style={styles.compactMeta}>
            <Ionicons name="star" size={10} color={Colors.primary} />
            <Text style={styles.compactRating}>{idea.rating}</Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.heartCompact}
          onPress={() => toggleSaveIdea(idea.id)}
        >
          <Ionicons
            name={saved ? 'heart' : 'heart-outline'}
            size={14}
            color={saved ? Colors.primary : '#fff'}
          />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  }

  // horizontal (default)
  return (
    <TouchableOpacity
      style={styles.horizontal}
      activeOpacity={0.9}
      onPress={onPress}
    >
      <Image source={{ uri: idea.imageUrl }} style={styles.horizontalImg} />
      <View style={styles.horizontalInfo}>
        <Text style={styles.horizontalTitle} numberOfLines={1}>{idea.title}</Text>
        <Text style={styles.horizontalDesc} numberOfLines={2}>{idea.description}</Text>
        <View style={styles.horizontalMeta}>
          <View style={styles.ratingRow}>
            <Ionicons name="star" size={11} color={Colors.primary} />
            <Text style={styles.ratingText}>{idea.rating}</Text>
          </View>
          <Text style={styles.priceDot}>·</Text>
          <Text style={styles.priceText}>{idea.priceRange}</Text>
          <Text style={styles.priceDot}>·</Text>
          <Text style={styles.durText}>{idea.estimatedDuration}</Text>
        </View>
      </View>
      <TouchableOpacity
        style={styles.heartHoriz}
        onPress={() => toggleSaveIdea(idea.id)}
      >
        <Ionicons
          name={saved ? 'heart' : 'heart-outline'}
          size={20}
          color={saved ? Colors.primary : Colors.textMuted}
        />
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  // Large
  large: {
    width: W * 0.62,
    height: 220,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    backgroundColor: Colors.surfaceAlt,
    marginRight: 14,
  },
  largeImg: { ...StyleSheet.absoluteFillObject },
  featuredBadge: {
    position: 'absolute',
    top: 12, left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(212,175,55,0.2)',
    paddingHorizontal: 8, paddingVertical: 4,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: 'rgba(212,175,55,0.4)',
  },
  featuredText: { fontSize: 10, color: Colors.primary, fontWeight: '700' },
  heartLarge: {
    position: 'absolute',
    top: 12, right: 12,
    width: 32, height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  largeInfo: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    padding: 14,
    gap: 5,
  },
  largePriceRange: {
    alignSelf: 'flex-start',
    fontSize: 11,
    color: Colors.primary,
    fontWeight: '700',
    backgroundColor: 'rgba(212,175,55,0.15)',
    paddingHorizontal: 7, paddingVertical: 3,
    borderRadius: 4,
  },
  largeTitle: { fontSize: 16, fontWeight: '800', color: '#fff' },
  largeMeta: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  largeRating: { fontSize: 12, color: Colors.primary, fontWeight: '700' },
  largeDot: { color: 'rgba(255,255,255,0.5)', fontSize: 12 },
  largeDur: { fontSize: 12, color: 'rgba(255,255,255,0.75)' },

  // Compact
  compact: {
    width: 160,
    height: 200,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    backgroundColor: Colors.surfaceAlt,
    marginRight: 12,
  },
  compactImg: { ...StyleSheet.absoluteFillObject },
  compactInfo: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    padding: 12,
    gap: 4,
  },
  compactTitle: { fontSize: 13, fontWeight: '700', color: '#fff', lineHeight: 17 },
  compactMeta: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  compactRating: { fontSize: 11, color: Colors.primary, fontWeight: '700' },
  heartCompact: {
    position: 'absolute',
    top: 10, right: 10,
    width: 28, height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Horizontal
  horizontal: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  horizontalImg: { width: 90, height: 90 },
  horizontalInfo: { flex: 1, padding: 12, gap: 5 },
  horizontalTitle: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary },
  horizontalDesc: { fontSize: 12, color: Colors.textMuted, lineHeight: 17 },
  horizontalMeta: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  ratingText: { fontSize: 12, color: Colors.primary, fontWeight: '700' },
  priceDot: { color: Colors.inputBorder, fontSize: 12 },
  priceText: { fontSize: 12, color: Colors.textMuted },
  durText: { fontSize: 12, color: Colors.textMuted },
  heartHoriz: { padding: 14, alignSelf: 'center' },
});
