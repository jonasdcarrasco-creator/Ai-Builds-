import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  FlatList,
  TextInput,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Spacing, BorderRadius, Shadow } from '../../constants';
import { useAuthStore, useAppStore } from '../../store';
import { MOCK_DATE_IDEAS, MOCK_RESTAURANTS } from '../../constants/mockData';

const { width: W } = Dimensions.get('window');

const QUICK_PICKS = [
  { id: 'tonight', label: 'Tonight', emoji: '🌙', colors: ['#8B0000', '#4A0000'] as [string, string] },
  { id: 'weekend', label: 'Weekend', emoji: '🌅', colors: ['#B8942A', '#7A5F1A'] as [string, string] },
  { id: 'surprise', label: 'Surprise', emoji: '✨', colors: ['#4A0000', '#8B0000'] as [string, string] },
  { id: 'budget', label: 'Budget', emoji: '💰', colors: ['#1A3A1A', '#2D5A2D'] as [string, string] },
];

const CATEGORIES = [
  { id: 'all', label: 'All', emoji: '🔥' },
  { id: 'romantic', label: 'Romantic', emoji: '💕' },
  { id: 'foodie', label: 'Foodie', emoji: '🍽️' },
  { id: 'adventure', label: 'Adventure', emoji: '🏔️' },
  { id: 'cultural', label: 'Cultural', emoji: '🎭' },
  { id: 'outdoor', label: 'Outdoor', emoji: '🌿' },
  { id: 'nightlife', label: 'Night Out', emoji: '🌙' },
];

interface HomeScreenProps {
  navigation: any;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { user } = useAuthStore();
  const { savedIdeas, toggleSaveIdea, activeCategory, setActiveCategory } = useAppStore();
  const [searchText, setSearchText] = useState('');

  const firstName = user?.name?.split(' ')[0] ?? 'You';
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  const featured = MOCK_DATE_IDEAS.filter((d) => d.isFeatured);
  const filtered =
    activeCategory === 'all'
      ? MOCK_DATE_IDEAS
      : MOCK_DATE_IDEAS.filter((d) => d.category === activeCategory);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
      >
        {/* Hero Header */}
        <LinearGradient
          colors={['#0A0A0A', '#1C0000', '#0A0A0A']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          {/* Top row */}
          <View style={styles.headerTop}>
            <View style={styles.logoRow}>
              <LinearGradient
                colors={['#8B0000', '#D4AF37']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.logoMini}
              >
                <Ionicons name="heart" size={14} color="#fff" />
              </LinearGradient>
              <Text style={styles.logoText}>datefully</Text>
            </View>
            <TouchableOpacity style={styles.notifBtn}>
              <Ionicons name="notifications-outline" size={22} color={Colors.textPrimary} />
              <View style={styles.notifDot} />
            </TouchableOpacity>
          </View>

          {/* Greeting */}
          <View style={styles.greetingBlock}>
            <Text style={styles.greeting}>{greeting},</Text>
            <Text style={styles.greetingName}>{firstName} 👋</Text>
            <Text style={styles.greetingSub}>
              {user?.partnerName
                ? `Ready to plan something special for you & ${user.partnerName}?`
                : 'Discover your next unforgettable date.'}
            </Text>
          </View>

          {/* Search bar */}
          <View style={styles.searchBar}>
            <Ionicons name="search" size={18} color={Colors.textMuted} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search date ideas..."
              placeholderTextColor={Colors.inputPlaceholder}
              value={searchText}
              onChangeText={setSearchText}
            />
            {searchText.length > 0 && (
              <TouchableOpacity onPress={() => setSearchText('')}>
                <Ionicons name="close-circle" size={18} color={Colors.textMuted} />
              </TouchableOpacity>
            )}
          </View>
        </LinearGradient>

        {/* Quick Picks */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Picks</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.hScroll}>
            <View style={styles.quickRow}>
              {QUICK_PICKS.map((q) => (
                <TouchableOpacity key={q.id} activeOpacity={0.85}>
                  <LinearGradient
                    colors={q.colors}
                    style={styles.quickCard}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <Text style={styles.quickEmoji}>{q.emoji}</Text>
                    <Text style={styles.quickLabel}>{q.label}</Text>
                  </LinearGradient>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Featured Date Ideas */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Featured Ideas</Text>
            <TouchableOpacity>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.hScroll}>
            <View style={styles.featuredRow}>
              {featured.map((idea) => {
                const saved = savedIdeas.includes(idea.id);
                return (
                  <TouchableOpacity
                    key={idea.id}
                    style={styles.featuredCard}
                    activeOpacity={0.92}
                    onPress={() => navigation.navigate('DateIdeaDetail', { idea })}
                  >
                    <Image source={{ uri: idea.imageUrl }} style={styles.featuredImg} />
                    <LinearGradient
                      colors={['transparent', 'rgba(0,0,0,0.9)']}
                      style={StyleSheet.absoluteFill}
                    />
                    <TouchableOpacity
                      style={styles.heartBtn}
                      onPress={() => toggleSaveIdea(idea.id)}
                    >
                      <Ionicons
                        name={saved ? 'heart' : 'heart-outline'}
                        size={18}
                        color={saved ? Colors.primary : Colors.white}
                      />
                    </TouchableOpacity>
                    <View style={styles.featuredInfo}>
                      <View style={styles.featuredBadge}>
                        <Text style={styles.featuredBadgeText}>{idea.priceRange}</Text>
                      </View>
                      <Text style={styles.featuredTitle} numberOfLines={2}>{idea.title}</Text>
                      <View style={styles.featuredMeta}>
                        <Ionicons name="star" size={12} color={Colors.primary} />
                        <Text style={styles.featuredRating}>{idea.rating}</Text>
                        <Text style={styles.featuredDot}>·</Text>
                        <Text style={styles.featuredDuration}>{idea.estimatedDuration}</Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>
        </View>

        {/* Category Filter */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Browse by Vibe</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.hScroll}>
            <View style={styles.catRow}>
              {CATEGORIES.map((c) => (
                <TouchableOpacity
                  key={c.id}
                  style={[styles.catChip, activeCategory === c.id && styles.catChipActive]}
                  onPress={() => setActiveCategory(c.id)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.catEmoji}>{c.emoji}</Text>
                  <Text
                    style={[
                      styles.catLabel,
                      activeCategory === c.id && styles.catLabelActive,
                    ]}
                  >
                    {c.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Ideas List */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              {activeCategory === 'all' ? 'All Ideas' : CATEGORIES.find((c) => c.id === activeCategory)?.label}
            </Text>
            <Text style={styles.resultCount}>{filtered.length} ideas</Text>
          </View>

          {filtered.map((idea) => {
            const saved = savedIdeas.includes(idea.id);
            return (
              <TouchableOpacity
                key={idea.id}
                style={styles.listCard}
                activeOpacity={0.9}
                onPress={() => navigation.navigate('DateIdeaDetail', { idea })}
              >
                <Image source={{ uri: idea.imageUrl }} style={styles.listImg} />
                <View style={styles.listInfo}>
                  <Text style={styles.listTitle} numberOfLines={1}>{idea.title}</Text>
                  <Text style={styles.listDesc} numberOfLines={2}>{idea.description}</Text>
                  <View style={styles.listMeta}>
                    <View style={styles.ratingBadge}>
                      <Ionicons name="star" size={11} color={Colors.primary} />
                      <Text style={styles.ratingText}>{idea.rating}</Text>
                    </View>
                    <Text style={styles.priceBadge}>{idea.priceRange}</Text>
                    <Text style={styles.durText}>{idea.estimatedDuration}</Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={styles.listHeart}
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
          })}
        </View>

        {/* Top Restaurants */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Top Restaurants</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Reservations')}>
              <Text style={styles.seeAll}>Reserve</Text>
            </TouchableOpacity>
          </View>
          {MOCK_RESTAURANTS.slice(0, 3).map((r) => (
            <View key={r.id} style={styles.restCard}>
              <Image source={{ uri: r.imageUrl }} style={styles.restImg} />
              <View style={styles.restInfo}>
                <Text style={styles.restName}>{r.name}</Text>
                <Text style={styles.restCuisine}>{r.cuisine}</Text>
                <View style={styles.listMeta}>
                  <View style={styles.ratingBadge}>
                    <Ionicons name="star" size={11} color={Colors.primary} />
                    <Text style={styles.ratingText}>{r.rating}</Text>
                  </View>
                  <Text style={styles.priceBadge}>{r.priceRange}</Text>
                  <Text style={styles.durText}>{r.distance}</Text>
                </View>
              </View>
              <TouchableOpacity style={styles.reserveBtn}>
                <Text style={styles.reserveBtnText}>Reserve</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* Plan CTA Banner */}
        <View style={styles.ctaBanner}>
          <LinearGradient
            colors={['#8B0000', '#D4AF37']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.ctaGradient}
          >
            <View style={styles.ctaContent}>
              <Text style={styles.ctaTitle}>Plan Your Perfect Date</Text>
              <Text style={styles.ctaSub}>
                Combine ideas, make reservations & create memories
              </Text>
              <TouchableOpacity
                style={styles.ctaBtn}
                onPress={() => navigation.navigate('Plan')}
              >
                <Text style={styles.ctaBtnText}>Start Planning</Text>
                <Ionicons name="arrow-forward" size={16} color="#0A0A0A" />
              </TouchableOpacity>
            </View>
            <Text style={styles.ctaEmoji}>💝</Text>
          </LinearGradient>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    paddingHorizontal: Spacing['2xl'],
    paddingBottom: Spacing['2xl'],
    gap: Spacing.lg,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Spacing.base,
  },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  logoMini: {
    width: 28, height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: { fontSize: 18, fontWeight: '800', color: Colors.textPrimary },
  notifBtn: { position: 'relative' },
  notifDot: {
    position: 'absolute',
    top: 0, right: 0,
    width: 8, height: 8,
    borderRadius: 4,
    backgroundColor: Colors.secondary,
    borderWidth: 1.5,
    borderColor: Colors.background,
  },
  greetingBlock: { gap: 4 },
  greeting: { fontSize: 14, color: Colors.textMuted },
  greetingName: { fontSize: 28, fontWeight: '800', color: Colors.textPrimary },
  greetingSub: { fontSize: 14, color: Colors.textSecondary, lineHeight: 20 },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: Colors.surfaceAlt,
    borderRadius: BorderRadius.xl,
    paddingHorizontal: Spacing.base,
    height: 48,
    borderWidth: 1,
    borderColor: Colors.inputBorder,
  },
  searchInput: { flex: 1, fontSize: 15, color: Colors.textPrimary },
  section: { paddingHorizontal: Spacing['2xl'], paddingTop: Spacing['2xl'] },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.base,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  seeAll: { fontSize: 13, color: Colors.primary, fontWeight: '600' },
  resultCount: { fontSize: 13, color: Colors.textMuted },
  hScroll: { marginHorizontal: -Spacing['2xl'] },
  quickRow: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: Spacing['2xl'],
    paddingBottom: 4,
  },
  quickCard: {
    width: 90,
    height: 90,
    borderRadius: BorderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  quickEmoji: { fontSize: 26 },
  quickLabel: { fontSize: 12, fontWeight: '700', color: '#fff' },
  featuredRow: {
    flexDirection: 'row',
    gap: 14,
    paddingHorizontal: Spacing['2xl'],
    paddingBottom: 4,
  },
  featuredCard: {
    width: W * 0.6,
    height: 220,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    backgroundColor: Colors.surfaceAlt,
  },
  featuredImg: { ...StyleSheet.absoluteFillObject },
  heartBtn: {
    position: 'absolute',
    top: 12, right: 12,
    width: 34, height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  featuredInfo: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    padding: 14,
    gap: 6,
  },
  featuredBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(212,175,55,0.25)',
    paddingHorizontal: 8, paddingVertical: 3,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: 'rgba(212,175,55,0.5)',
  },
  featuredBadgeText: { fontSize: 11, color: Colors.primary, fontWeight: '700' },
  featuredTitle: { fontSize: 16, fontWeight: '800', color: '#fff', lineHeight: 22 },
  featuredMeta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  featuredRating: { fontSize: 12, color: Colors.primary, fontWeight: '700' },
  featuredDot: { color: Colors.textMuted, fontSize: 12 },
  featuredDuration: { fontSize: 12, color: Colors.textMuted },
  catRow: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: Spacing['2xl'],
    paddingBottom: 4,
  },
  catChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surfaceAlt,
    borderWidth: 1,
    borderColor: Colors.inputBorder,
  },
  catChipActive: {
    borderColor: Colors.primary,
    backgroundColor: 'rgba(212,175,55,0.1)',
  },
  catEmoji: { fontSize: 14 },
  catLabel: { fontSize: 13, fontWeight: '600', color: Colors.textMuted },
  catLabelActive: { color: Colors.primary },
  listCard: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  listImg: { width: 90, height: 90 },
  listInfo: { flex: 1, padding: 12, gap: 4 },
  listTitle: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary },
  listDesc: { fontSize: 12, color: Colors.textMuted, lineHeight: 17 },
  listMeta: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
  ratingBadge: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  ratingText: { fontSize: 12, fontWeight: '700', color: Colors.primary },
  priceBadge: { fontSize: 12, color: Colors.textMuted },
  durText: { fontSize: 12, color: Colors.textMuted },
  listHeart: {
    padding: 14,
    alignSelf: 'center',
  },
  restCard: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    alignItems: 'center',
  },
  restImg: { width: 80, height: 80 },
  restInfo: { flex: 1, padding: 12, gap: 4 },
  restName: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary },
  restCuisine: { fontSize: 12, color: Colors.textMuted },
  reserveBtn: {
    marginRight: 12,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.secondary,
  },
  reserveBtnText: { fontSize: 12, fontWeight: '700', color: '#fff' },
  ctaBanner: {
    marginHorizontal: Spacing['2xl'],
    marginTop: Spacing['2xl'],
    borderRadius: BorderRadius['2xl'],
    overflow: 'hidden',
  },
  ctaGradient: { padding: Spacing['2xl'] },
  ctaContent: { gap: 10, flex: 1 },
  ctaTitle: { fontSize: 20, fontWeight: '800', color: '#0A0A0A' },
  ctaSub: { fontSize: 13, color: 'rgba(10,10,10,0.7)', lineHeight: 18 },
  ctaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(10,10,10,0.15)',
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: BorderRadius.full,
    marginTop: 4,
  },
  ctaBtnText: { fontSize: 14, fontWeight: '700', color: '#0A0A0A' },
  ctaEmoji: { position: 'absolute', right: 24, top: 20, fontSize: 60, opacity: 0.3 },
});
