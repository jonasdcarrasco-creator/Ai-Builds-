import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  Share,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Spacing, BorderRadius, Shadow } from '../../constants';
import { useAppStore } from '../../store';
import type { DateIdea } from '../../types';

const { width, height } = Dimensions.get('window');
const HERO_HEIGHT = height * 0.42;

interface Props {
  navigation: any;
  route: { params: { idea: DateIdea } };
}

const CATEGORY_COLORS: Record<string, string[]> = {
  romantic: ['#FF6B9D', '#E85585'],
  foodie: ['#F39C12', '#E67E22'],
  adventure: ['#2ECC71', '#27AE60'],
  nightlife: ['#9B59B6', '#6C3483'],
  cultural: ['#3498DB', '#2980B9'],
  wellness: ['#1ABC9C', '#16A085'],
  outdoor: ['#27AE60', '#1E8449'],
};

const PRICE_LABEL: Record<string, string> = {
  '$': 'Budget-friendly',
  '$$': 'Moderate',
  '$$$': 'Splurge',
  '$$$$': 'Luxury',
};

export const DateIdeaDetailScreen: React.FC<Props> = ({ navigation, route }) => {
  const { idea } = route.params;
  const { savedIdeas, toggleSaveIdea } = useAppStore();
  const isSaved = savedIdeas.includes(idea.id);
  const gradientColors = CATEGORY_COLORS[idea.category] ?? ['#FF6B9D', '#E85585'];

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out this date idea: ${idea.title} — ${idea.description.slice(0, 80)}...`,
        title: idea.title,
      });
    } catch (_) {}
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Hero */}
      <View style={styles.hero}>
        <Image source={{ uri: idea.imageUrl }} style={styles.heroImage} resizeMode="cover" />
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.75)']}
          style={styles.heroGradient}
        />

        {/* Nav buttons */}
        <View style={styles.navRow}>
          <TouchableOpacity style={styles.navBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={22} color={Colors.white} />
          </TouchableOpacity>
          <View style={styles.navRight}>
            <TouchableOpacity style={styles.navBtn} onPress={handleShare}>
              <Ionicons name="share-outline" size={22} color={Colors.white} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.navBtn}
              onPress={() => toggleSaveIdea(idea.id)}
            >
              <Ionicons
                name={isSaved ? 'heart' : 'heart-outline'}
                size={22}
                color={isSaved ? Colors.primary : Colors.white}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Category badge */}
        <View style={styles.heroBadge}>
          <LinearGradient colors={gradientColors as any} style={styles.badgeGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
            <Ionicons name="sparkles" size={12} color={Colors.white} />
            <Text style={styles.badgeText}>{idea.category.charAt(0).toUpperCase() + idea.category.slice(1)}</Text>
          </LinearGradient>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Title & Meta */}
        <View style={styles.titleBlock}>
          <Text style={styles.title}>{idea.title}</Text>

          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Ionicons name="star" size={15} color={Colors.accent} />
              <Text style={styles.metaValue}>{idea.rating}</Text>
              <Text style={styles.metaMuted}>({idea.reviewCount.toLocaleString()})</Text>
            </View>
            {idea.location && (
              <View style={styles.metaItem}>
                <Ionicons name="location-outline" size={15} color={Colors.textSecondary} />
                <Text style={styles.metaMuted}>{idea.location}</Text>
              </View>
            )}
            {idea.distance && (
              <View style={styles.metaItem}>
                <Ionicons name="navigate-outline" size={15} color={Colors.textSecondary} />
                <Text style={styles.metaMuted}>{idea.distance}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Quick Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Ionicons name="time-outline" size={20} color={Colors.primary} />
            <Text style={styles.statLabel}>Duration</Text>
            <Text style={styles.statValue}>{idea.estimatedDuration}</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="cash-outline" size={20} color={Colors.secondary} />
            <Text style={styles.statLabel}>Cost</Text>
            <Text style={styles.statValue}>{idea.priceRange}</Text>
            <Text style={styles.statSub}>{PRICE_LABEL[idea.priceRange]}</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="heart-outline" size={20} color={Colors.accent} />
            <Text style={styles.statLabel}>Best for</Text>
            <Text style={styles.statValue}>{idea.bestFor.length} types</Text>
          </View>
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About this date</Text>
          <Text style={styles.description}>{idea.description}</Text>
        </View>

        {/* Best For */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Best for</Text>
          <View style={styles.chipRow}>
            {idea.bestFor.map((b, i) => (
              <View key={i} style={styles.bestForChip}>
                <Ionicons name="checkmark-circle" size={14} color={Colors.success} />
                <Text style={styles.bestForText}>{b}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Tags */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tags</Text>
          <View style={styles.chipRow}>
            {idea.tags.map((tag, i) => (
              <View key={i} style={styles.tag}>
                <Text style={styles.tagText}>#{tag}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Tips */}
        {idea.tips && idea.tips.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Pro tips</Text>
            <View style={styles.tipsCard}>
              {idea.tips.map((tip, i) => (
                <View key={i} style={[styles.tipRow, i < idea.tips!.length - 1 && styles.tipBorder]}>
                  <View style={styles.tipNumber}>
                    <Text style={styles.tipNumberText}>{i + 1}</Text>
                  </View>
                  <Text style={styles.tipText}>{tip}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Bottom CTA */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.saveBtn}
          onPress={() => toggleSaveIdea(idea.id)}
        >
          <Ionicons name={isSaved ? 'heart' : 'heart-outline'} size={20} color={Colors.primary} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.ctaBtn} activeOpacity={0.85}>
          <LinearGradient
            colors={['#FF6B9D', '#E85585']}
            style={styles.ctaGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Ionicons name="calendar-outline" size={18} color={Colors.white} />
            <Text style={styles.ctaText}>Add to Date Plan</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  hero: { width, height: HERO_HEIGHT, position: 'relative' },
  heroImage: { width: '100%', height: '100%' },
  heroGradient: {
    ...StyleSheet.absoluteFillObject,
    bottom: 0,
    height: HERO_HEIGHT * 0.55,
    top: HERO_HEIGHT * 0.45,
  },
  navRow: {
    position: 'absolute',
    top: 52,
    left: Spacing.base,
    right: Spacing.base,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  navRight: { flexDirection: 'row', gap: 10 },
  navBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroBadge: {
    position: 'absolute',
    bottom: Spacing.base,
    left: Spacing.base,
  },
  badgeGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
  },
  badgeText: { color: Colors.white, fontSize: 12, fontWeight: '700' },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 20 },
  titleBlock: { padding: Spacing.base, paddingBottom: 0 },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.textPrimary,
    lineHeight: 30,
    marginBottom: 10,
  },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 4 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaValue: { fontSize: 14, fontWeight: '700', color: Colors.textPrimary },
  metaMuted: { fontSize: 13, color: Colors.textSecondary },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.base,
    gap: 10,
    marginTop: Spacing.base,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: 12,
    alignItems: 'center',
    gap: 4,
    ...Shadow.sm,
  },
  statLabel: { fontSize: 11, color: Colors.textMuted, fontWeight: '600' },
  statValue: { fontSize: 13, color: Colors.textPrimary, fontWeight: '700', textAlign: 'center' },
  statSub: { fontSize: 10, color: Colors.textMuted, textAlign: 'center' },
  section: { padding: Spacing.base, paddingTop: Spacing.lg },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 10,
  },
  description: {
    fontSize: 15,
    color: Colors.textSecondary,
    lineHeight: 23,
  },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  bestForChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.surfaceAlt,
    borderRadius: BorderRadius.full,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  bestForText: { fontSize: 13, color: Colors.textPrimary, fontWeight: '500' },
  tag: {
    backgroundColor: Colors.gray100,
    borderRadius: BorderRadius.full,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  tagText: { fontSize: 12, color: Colors.textSecondary, fontWeight: '500' },
  tipsCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    ...Shadow.sm,
  },
  tipRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    padding: 14,
  },
  tipBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray100,
  },
  tipNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  tipNumberText: { fontSize: 12, fontWeight: '700', color: Colors.primary },
  tipText: { flex: 1, fontSize: 14, color: Colors.textSecondary, lineHeight: 20 },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: Spacing.base,
    paddingBottom: 32,
    paddingTop: 12,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.gray100,
  },
  saveBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaBtn: { flex: 1, borderRadius: BorderRadius.xl, overflow: 'hidden' },
  ctaGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
  },
  ctaText: { color: Colors.white, fontSize: 16, fontWeight: '700' },
});
