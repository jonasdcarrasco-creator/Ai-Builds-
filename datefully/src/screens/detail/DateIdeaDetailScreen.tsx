import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Spacing, BorderRadius } from '../../constants';
import { useAppStore } from '../../store';
import { DateIdea } from '../../types';

const { width: W, height: H } = Dimensions.get('window');

interface DateIdeaDetailScreenProps {
  navigation: any;
  route: { params: { idea: DateIdea } };
}

export const DateIdeaDetailScreen: React.FC<DateIdeaDetailScreenProps> = ({
  navigation,
  route,
}) => {
  const { idea } = route.params;
  const insets = useSafeAreaInsets();
  const { savedIdeas, toggleSaveIdea, addPlan } = useAppStore();
  const isSaved = savedIdeas.includes(idea.id);
  const [addedToPlan, setAddedToPlan] = useState(false);

  const handlePlanThis = () => {
    addPlan({
      id: Date.now().toString(),
      title: idea.title,
      date: new Date().toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      }),
      items: [
        {
          id: '1',
          type: 'idea',
          title: idea.title,
          description: idea.description,
          duration: idea.estimatedDuration,
          isCompleted: false,
        },
      ],
      status: 'upcoming',
      createdAt: new Date().toISOString(),
    });
    setAddedToPlan(true);
    Alert.alert(
      '✅ Added to Plans!',
      `"${idea.title}" has been added to your date plans.`,
      [{ text: 'View Plans', onPress: () => navigation.navigate('Plan') }, { text: 'Stay Here' }]
    );
  };

  return (
    <View style={styles.container}>
      {/* Hero Image */}
      <View style={styles.heroWrap}>
        <Image source={{ uri: idea.imageUrl }} style={styles.heroImg} resizeMode="cover" />
        <LinearGradient
          colors={['rgba(0,0,0,0.4)', 'transparent', 'rgba(0,0,0,0.7)']}
          style={StyleSheet.absoluteFill}
        />
        {/* Back + Save */}
        <View style={[styles.navRow, { paddingTop: insets.top + 12 }]}>
          <TouchableOpacity style={styles.navBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={20} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.navBtn}
            onPress={() => toggleSaveIdea(idea.id)}
          >
            <Ionicons
              name={isSaved ? 'heart' : 'heart-outline'}
              size={20}
              color={isSaved ? Colors.primary : '#fff'}
            />
          </TouchableOpacity>
        </View>

        {/* Hero bottom content */}
        <View style={styles.heroBottom}>
          {idea.isFeatured && (
            <View style={styles.featuredBadge}>
              <Ionicons name="star" size={12} color={Colors.primary} />
              <Text style={styles.featuredBadgeText}>Featured</Text>
            </View>
          )}
          <Text style={styles.heroTitle}>{idea.title}</Text>
          <View style={styles.heroMeta}>
            <View style={styles.heroMetaItem}>
              <Ionicons name="star" size={14} color={Colors.primary} />
              <Text style={styles.heroMetaVal}>{idea.rating}</Text>
              <Text style={styles.heroMetaSub}>({idea.reviewCount})</Text>
            </View>
            <View style={styles.heroMetaDot} />
            <View style={styles.heroMetaItem}>
              <Ionicons name="time-outline" size={14} color="rgba(255,255,255,0.7)" />
              <Text style={styles.heroMetaText}>{idea.estimatedDuration}</Text>
            </View>
            <View style={styles.heroMetaDot} />
            <Text style={styles.heroPrice}>{idea.priceRange}</Text>
            {idea.distance && (
              <>
                <View style={styles.heroMetaDot} />
                <View style={styles.heroMetaItem}>
                  <Ionicons name="location-outline" size={14} color="rgba(255,255,255,0.7)" />
                  <Text style={styles.heroMetaText}>{idea.distance}</Text>
                </View>
              </>
            )}
          </View>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 120 }}
      >
        {/* Category tag + location */}
        <View style={styles.tagsRow}>
          <View style={styles.catTag}>
            <Text style={styles.catTagText}>
              {idea.category.charAt(0).toUpperCase() + idea.category.slice(1)}
            </Text>
          </View>
          {idea.location && (
            <View style={styles.locTag}>
              <Ionicons name="pin-outline" size={12} color={Colors.textMuted} />
              <Text style={styles.locTagText}>{idea.location}</Text>
            </View>
          )}
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About This Date</Text>
          <Text style={styles.description}>{idea.description}</Text>
        </View>

        {/* Best For */}
        {idea.bestFor && idea.bestFor.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Perfect For</Text>
            <View style={styles.pillsRow}>
              {idea.bestFor.map((item) => (
                <View key={item} style={styles.pill}>
                  <Ionicons name="checkmark-circle" size={14} color={Colors.primary} />
                  <Text style={styles.pillText}>{item}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Tags */}
        {idea.tags && idea.tags.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Vibes</Text>
            <View style={styles.pillsRow}>
              {idea.tags.map((tag) => (
                <View key={tag} style={styles.tagChip}>
                  <Text style={styles.tagChipText}>#{tag}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Tips */}
        {idea.tips && idea.tips.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Pro Tips</Text>
            <View style={styles.tipsCard}>
              {idea.tips.map((tip, i) => (
                <View
                  key={i}
                  style={[
                    styles.tipRow,
                    i < idea.tips!.length - 1 && styles.tipBorder,
                  ]}
                >
                  <View style={styles.tipNum}>
                    <Text style={styles.tipNumText}>{i + 1}</Text>
                  </View>
                  <Text style={styles.tipText}>{tip}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Stats Card */}
        <View style={styles.section}>
          <View style={styles.statsCard}>
            <View style={styles.statsItem}>
              <Text style={styles.statsEmoji}>⏱</Text>
              <Text style={styles.statsVal}>{idea.estimatedDuration}</Text>
              <Text style={styles.statsLabel}>Duration</Text>
            </View>
            <View style={styles.statsDivider} />
            <View style={styles.statsItem}>
              <Text style={styles.statsEmoji}>💰</Text>
              <Text style={styles.statsVal}>{idea.priceRange}</Text>
              <Text style={styles.statsLabel}>Cost</Text>
            </View>
            <View style={styles.statsDivider} />
            <View style={styles.statsItem}>
              <Text style={styles.statsEmoji}>⭐</Text>
              <Text style={styles.statsVal}>{idea.rating}</Text>
              <Text style={styles.statsLabel}>Rating</Text>
            </View>
            <View style={styles.statsDivider} />
            <View style={styles.statsItem}>
              <Text style={styles.statsEmoji}>💬</Text>
              <Text style={styles.statsVal}>{idea.reviewCount.toLocaleString()}</Text>
              <Text style={styles.statsLabel}>Reviews</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Sticky CTA */}
      <View style={[styles.ctaBar, { paddingBottom: insets.bottom + 16 }]}>
        <View style={styles.ctaBarInner}>
          <TouchableOpacity
            style={styles.secondaryCta}
            onPress={() => navigation.navigate('Reservations')}
          >
            <Ionicons name="restaurant-outline" size={18} color={Colors.textPrimary} />
            <Text style={styles.secondaryCtaText}>Find Restaurants</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.primaryCta}
            onPress={handlePlanThis}
            disabled={addedToPlan}
          >
            <LinearGradient
              colors={addedToPlan ? ['#444', '#333'] : ['#D4AF37', '#B8942A']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.primaryCtaGrad}
            >
              <Ionicons
                name={addedToPlan ? 'checkmark-circle' : 'calendar-outline'}
                size={18}
                color="#0A0A0A"
              />
              <Text style={styles.primaryCtaText}>
                {addedToPlan ? 'In Your Plans' : 'Plan This Date'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  heroWrap: { height: H * 0.45, position: 'relative' },
  heroImg: { width: W, height: H * 0.45 },
  navRow: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    zIndex: 10,
  },
  navBtn: {
    width: 42, height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  heroBottom: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    padding: 24,
    gap: 8,
  },
  featuredBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(212,175,55,0.2)',
    paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: 'rgba(212,175,55,0.4)',
    alignSelf: 'flex-start',
  },
  featuredBadgeText: { fontSize: 11, color: Colors.primary, fontWeight: '700' },
  heroTitle: { fontSize: 26, fontWeight: '900', color: '#fff', lineHeight: 32 },
  heroMeta: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 6 },
  heroMetaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  heroMetaVal: { fontSize: 13, color: Colors.primary, fontWeight: '700' },
  heroMetaSub: { fontSize: 12, color: 'rgba(255,255,255,0.6)' },
  heroMetaText: { fontSize: 13, color: 'rgba(255,255,255,0.8)' },
  heroMetaDot: {
    width: 3, height: 3,
    borderRadius: 1.5,
    backgroundColor: 'rgba(255,255,255,0.4)',
  },
  heroPrice: { fontSize: 13, color: Colors.primary, fontWeight: '700' },
  tagsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: Spacing['2xl'],
    paddingTop: Spacing.xl,
  },
  catTag: {
    backgroundColor: 'rgba(139,0,0,0.2)',
    paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: 'rgba(139,0,0,0.4)',
  },
  catTagText: { fontSize: 12, color: '#FF8080', fontWeight: '700' },
  locTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.surfaceAlt,
    paddingHorizontal: 10, paddingVertical: 5,
    borderRadius: BorderRadius.full,
  },
  locTagText: { fontSize: 12, color: Colors.textMuted },
  section: {
    paddingHorizontal: Spacing['2xl'],
    paddingTop: Spacing.xl,
    gap: Spacing.md,
  },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: Colors.primary },
  description: {
    fontSize: 15,
    color: Colors.textSecondary,
    lineHeight: 24,
  },
  pillsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(212,175,55,0.08)',
    paddingHorizontal: 12, paddingVertical: 8,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: 'rgba(212,175,55,0.2)',
  },
  pillText: { fontSize: 13, color: Colors.textSecondary, fontWeight: '600' },
  tagChip: {
    backgroundColor: Colors.surfaceAlt,
    paddingHorizontal: 12, paddingVertical: 7,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.inputBorder,
  },
  tagChipText: { fontSize: 12, color: Colors.textMuted, fontWeight: '600' },
  tipsCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    overflow: 'hidden',
  },
  tipRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
    padding: 16,
  },
  tipBorder: { borderBottomWidth: 1, borderBottomColor: Colors.inputBorder },
  tipNum: {
    width: 24, height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(212,175,55,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(212,175,55,0.3)',
    flexShrink: 0,
    marginTop: 1,
  },
  tipNumText: { fontSize: 12, fontWeight: '800', color: Colors.primary },
  tipText: { flex: 1, fontSize: 14, color: Colors.textSecondary, lineHeight: 20 },
  statsCard: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  statsItem: { flex: 1, alignItems: 'center', gap: 4 },
  statsEmoji: { fontSize: 18 },
  statsVal: { fontSize: 14, fontWeight: '800', color: Colors.primary },
  statsLabel: { fontSize: 10, color: Colors.textMuted, fontWeight: '600', textTransform: 'uppercase' },
  statsDivider: { width: 1, backgroundColor: Colors.inputBorder, marginVertical: 8 },
  ctaBar: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    backgroundColor: Colors.background,
    borderTopWidth: 1,
    borderTopColor: Colors.inputBorder,
    paddingTop: 16,
    paddingHorizontal: Spacing['2xl'],
  },
  ctaBarInner: { flexDirection: 'row', gap: 12 },
  secondaryCta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    paddingHorizontal: 18, paddingVertical: 14,
    borderRadius: BorderRadius.xl,
    backgroundColor: Colors.surfaceAlt,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  secondaryCtaText: { fontSize: 13, fontWeight: '700', color: Colors.textPrimary },
  primaryCta: { flex: 1, borderRadius: BorderRadius.xl, overflow: 'hidden' },
  primaryCtaGrad: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: BorderRadius.xl,
  },
  primaryCtaText: { fontSize: 15, fontWeight: '700', color: '#0A0A0A' },
});
