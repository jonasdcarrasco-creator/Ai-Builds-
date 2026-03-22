import React, { useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Dimensions,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Spacing, BorderRadius, Shadow } from '../../constants';
import { DATE_CATEGORIES } from '../../constants';
import { DateIdeaCard } from '../../components/cards/DateIdeaCard';
import { RestaurantCard } from '../../components/cards/RestaurantCard';
import { useAuthStore, useAppStore } from '../../store';
import { MOCK_DATE_IDEAS, MOCK_RESTAURANTS } from '../../constants/mockData';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const QUICK_PICKS = [
  { id: 'q1', label: 'Tonight', emoji: '🌙', gradient: ['#1a1a2e', '#0f3460'] as [string, string] },
  { id: 'q2', label: 'Weekend', emoji: '🌅', gradient: ['#FF6B9D', '#E85585'] as [string, string] },
  { id: 'q3', label: 'Surprise Me', emoji: '✨', gradient: ['#9B59B6', '#6C3483'] as [string, string] },
  { id: 'q4', label: 'Budget Date', emoji: '💰', gradient: ['#27AE60', '#1A7A40'] as [string, string] },
];

interface HomeScreenProps {
  navigation: any;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { user } = useAuthStore();
  const { activeCategory, setActiveCategory } = useAppStore();

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const filteredIdeas = activeCategory === 'all'
    ? MOCK_DATE_IDEAS
    : MOCK_DATE_IDEAS.filter((idea) => idea.category === activeCategory);

  const featuredIdeas = MOCK_DATE_IDEAS.filter((i) => i.isFeatured);

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* Hero Header */}
        <LinearGradient
          colors={['#FF6B9D', '#9B59B6']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.heroHeader, { paddingTop: insets.top + Spacing.base }]}
        >
          <View style={styles.topBar}>
            <View>
              <Text style={styles.greeting}>{greeting()}, {user?.name?.split(' ')[0]} 👋</Text>
              <Text style={styles.tagline}>What kind of date tonight?</Text>
            </View>
            <TouchableOpacity style={styles.notifBtn}>
              <Ionicons name="notifications-outline" size={22} color={Colors.white} />
              <View style={styles.notifDot} />
            </TouchableOpacity>
          </View>

          {/* Search Bar */}
          <TouchableOpacity
            style={styles.searchBar}
            onPress={() => {}}
          >
            <Ionicons name="search" size={18} color={Colors.textMuted} />
            <Text style={styles.searchPlaceholder}>Search date ideas, restaurants…</Text>
            <View style={styles.filterBtn}>
              <Ionicons name="options-outline" size={16} color={Colors.primary} />
            </View>
          </TouchableOpacity>
        </LinearGradient>

        {/* Quick Picks */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Picks</Text>
          <View style={styles.quickPicksRow}>
            {QUICK_PICKS.map((pick) => (
              <TouchableOpacity key={pick.id} style={styles.quickPickCard} activeOpacity={0.85}>
                <LinearGradient
                  colors={pick.gradient}
                  style={styles.quickPickGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Text style={styles.quickPickEmoji}>{pick.emoji}</Text>
                  <Text style={styles.quickPickLabel}>{pick.label}</Text>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Featured Date Ideas */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Featured Ideas ✨</Text>
          <TouchableOpacity>
            <Text style={styles.seeAll}>See all</Text>
          </TouchableOpacity>
        </View>
        <FlatList
          data={featuredIdeas}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.horizontalList}
          renderItem={({ item }) => (
            <DateIdeaCard
              idea={item}
              onPress={() => navigation.navigate('DateIdeaDetail', { idea: item })}
              variant="large"
            />
          )}
        />

        {/* Category Filter */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Browse by Vibe</Text>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesRow}
        >
          <TouchableOpacity
            style={[
              styles.categoryChip,
              activeCategory === 'all' && styles.categoryChipActive,
            ]}
            onPress={() => setActiveCategory('all')}
          >
            <Text style={styles.categoryChipEmoji}>🎲</Text>
            <Text style={[
              styles.categoryChipText,
              activeCategory === 'all' && styles.categoryChipTextActive,
            ]}>All</Text>
          </TouchableOpacity>
          {DATE_CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              style={[
                styles.categoryChip,
                activeCategory === cat.id && styles.categoryChipActive,
              ]}
              onPress={() => setActiveCategory(cat.id)}
            >
              <Text style={styles.categoryChipEmoji}>{cat.emoji}</Text>
              <Text style={[
                styles.categoryChipText,
                activeCategory === cat.id && styles.categoryChipTextActive,
              ]}>{cat.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Date Ideas List */}
        <View style={styles.ideasList}>
          {filteredIdeas.map((idea) => (
            <DateIdeaCard
              key={idea.id}
              idea={idea}
              onPress={() => navigation.navigate('DateIdeaDetail', { idea })}
              variant="horizontal"
            />
          ))}
        </View>

        {/* Restaurants Near You */}
        <View style={[styles.sectionHeader, { marginTop: Spacing.xl }]}>
          <Text style={styles.sectionTitle}>Top Restaurants 🍽️</Text>
          <TouchableOpacity onPress={() => {}}>
            <Text style={styles.seeAll}>View all</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.restaurantsList}>
          {MOCK_RESTAURANTS.slice(0, 2).map((r) => (
            <RestaurantCard
              key={r.id}
              restaurant={r}
              onPress={() => navigation.navigate('RestaurantDetail', { restaurant: r })}
            />
          ))}
        </View>

        {/* Inspiration Banner */}
        <TouchableOpacity style={[styles.banner, Shadow.md]} activeOpacity={0.9}>
          <LinearGradient
            colors={['#FF6B9D', '#9B59B6']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.bannerGradient}
          >
            <View style={styles.bannerContent}>
              <Text style={styles.bannerEmoji}>📅</Text>
              <View>
                <Text style={styles.bannerTitle}>Plan Your Next Date</Text>
                <Text style={styles.bannerSubtitle}>
                  Build a full date itinerary in minutes
                </Text>
              </View>
            </View>
            <View style={styles.bannerBtn}>
              <Text style={styles.bannerBtnText}>Start</Text>
              <Ionicons name="arrow-forward" size={14} color={Colors.primary} />
            </View>
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  heroHeader: {
    paddingHorizontal: Spacing.base,
    paddingBottom: Spacing['2xl'],
    gap: Spacing.base,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  greeting: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.white,
    lineHeight: 28,
  },
  tagline: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.75)',
    marginTop: 2,
  },
  notifBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  notifDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.accent,
    borderWidth: 1.5,
    borderColor: Colors.primary,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
  },
  searchPlaceholder: {
    flex: 1,
    fontSize: 14,
    color: Colors.textMuted,
  },
  filterBtn: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  section: {
    paddingHorizontal: Spacing.base,
    marginTop: Spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.base,
    marginTop: Spacing.xl,
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  seeAll: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
  },
  quickPicksRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: Spacing.md,
  },
  quickPickCard: {
    flex: 1,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
  },
  quickPickGradient: {
    paddingVertical: Spacing.base,
    alignItems: 'center',
    gap: 4,
  },
  quickPickEmoji: {
    fontSize: 22,
  },
  quickPickLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.white,
    textAlign: 'center',
  },
  horizontalList: {
    paddingLeft: Spacing.base,
    paddingRight: Spacing.sm,
  },
  categoriesRow: {
    paddingHorizontal: Spacing.base,
    paddingBottom: 4,
    gap: 8,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.white,
    borderWidth: 1.5,
    borderColor: Colors.gray200,
  },
  categoryChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  categoryChipEmoji: {
    fontSize: 14,
  },
  categoryChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  categoryChipTextActive: {
    color: Colors.white,
  },
  ideasList: {
    paddingHorizontal: Spacing.base,
    marginTop: Spacing.md,
  },
  restaurantsList: {
    paddingHorizontal: Spacing.base,
  },
  banner: {
    marginHorizontal: Spacing.base,
    marginTop: Spacing.lg,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
  },
  bannerGradient: {
    padding: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    flex: 1,
  },
  bannerEmoji: {
    fontSize: 32,
  },
  bannerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.white,
  },
  bannerSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.75)',
    marginTop: 2,
  },
  bannerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.white,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: BorderRadius.full,
  },
  bannerBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primary,
  },
});
