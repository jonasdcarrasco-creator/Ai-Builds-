import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  TextInput,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Spacing, BorderRadius, Shadow } from '../../constants';
import { DATE_CATEGORIES, BUDGET_RANGES, MOOD_OPTIONS } from '../../constants';
import { DateIdeaCard } from '../../components/cards/DateIdeaCard';
import { MOCK_DATE_IDEAS } from '../../constants/mockData';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface ExploreScreenProps {
  navigation: any;
}

export const ExploreScreen: React.FC<ExploreScreenProps> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedBudget, setSelectedBudget] = useState('');
  const [selectedMood, setSelectedMood] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const filteredIdeas = MOCK_DATE_IDEAS.filter((idea) => {
    const matchesSearch =
      !searchQuery ||
      idea.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      idea.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      idea.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || idea.category === selectedCategory;
    const matchesBudget =
      !selectedBudget ||
      (selectedBudget === 'free' && idea.priceRange === '$') ||
      (selectedBudget === 'budget' && idea.priceRange === '$') ||
      (selectedBudget === 'moderate' && idea.priceRange === '$$') ||
      (selectedBudget === 'upscale' && idea.priceRange === '$$$') ||
      (selectedBudget === 'luxury' && idea.priceRange === '$$$$');
    return matchesSearch && matchesCategory && matchesBudget;
  });

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + Spacing.base }]}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.headerTitle}>Explore</Text>
            <Text style={styles.headerSubtitle}>Find your perfect date idea</Text>
          </View>
          <TouchableOpacity
            style={[styles.filterToggle, showFilters && styles.filterToggleActive]}
            onPress={() => setShowFilters(!showFilters)}
          >
            <Ionicons
              name="options"
              size={18}
              color={showFilters ? Colors.white : Colors.primary}
            />
            <Text style={[styles.filterToggleText, showFilters && { color: Colors.white }]}>
              Filter
            </Text>
          </TouchableOpacity>
        </View>

        {/* Search */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={18} color={Colors.textMuted} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search date ideas..."
            placeholderTextColor={Colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={18} color={Colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Filters */}
        {showFilters && (
          <View style={styles.filtersPanel}>
            <Text style={styles.filterLabel}>Category</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
              {[{ id: 'all', label: 'All', emoji: '🎲' }, ...DATE_CATEGORIES].map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  style={[
                    styles.filterChip,
                    selectedCategory === cat.id && styles.filterChipActive,
                  ]}
                  onPress={() => setSelectedCategory(cat.id)}
                >
                  <Text style={styles.filterChipEmoji}>{cat.emoji}</Text>
                  <Text style={[
                    styles.filterChipText,
                    selectedCategory === cat.id && styles.filterChipTextActive,
                  ]}>{cat.label}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={[styles.filterLabel, { marginTop: Spacing.base }]}>Budget</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
              {BUDGET_RANGES.map((b) => (
                <TouchableOpacity
                  key={b.id}
                  style={[
                    styles.filterChip,
                    selectedBudget === b.id && styles.filterChipActive,
                  ]}
                  onPress={() => setSelectedBudget(selectedBudget === b.id ? '' : b.id)}
                >
                  <Text style={styles.filterChipEmoji}>{b.icon}</Text>
                  <Text style={[
                    styles.filterChipText,
                    selectedBudget === b.id && styles.filterChipTextActive,
                  ]}>{b.label}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={[styles.filterLabel, { marginTop: Spacing.base }]}>Mood</Text>
            <View style={styles.moodGrid}>
              {MOOD_OPTIONS.map((mood) => (
                <TouchableOpacity
                  key={mood.id}
                  style={[
                    styles.moodChip,
                    selectedMood === mood.id && styles.moodChipActive,
                  ]}
                  onPress={() => setSelectedMood(selectedMood === mood.id ? '' : mood.id)}
                >
                  <Text style={styles.moodEmoji}>{mood.emoji}</Text>
                  <Text style={[
                    styles.moodText,
                    selectedMood === mood.id && styles.moodTextActive,
                  ]}>{mood.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {(selectedCategory !== 'all' || selectedBudget || selectedMood) && (
              <TouchableOpacity
                style={styles.clearFiltersBtn}
                onPress={() => {
                  setSelectedCategory('all');
                  setSelectedBudget('');
                  setSelectedMood('');
                }}
              >
                <Text style={styles.clearFiltersText}>Clear all filters</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Results Count */}
        <View style={styles.resultsHeader}>
          <Text style={styles.resultsCount}>
            {filteredIdeas.length} idea{filteredIdeas.length !== 1 ? 's' : ''} found
          </Text>
          <TouchableOpacity style={styles.sortBtn}>
            <Ionicons name="swap-vertical-outline" size={16} color={Colors.textSecondary} />
            <Text style={styles.sortText}>Sort</Text>
          </TouchableOpacity>
        </View>

        {/* Categories Grid */}
        {!searchQuery && selectedCategory === 'all' && !showFilters && (
          <>
            <Text style={styles.sectionTitle}>Browse Categories</Text>
            <View style={styles.categoriesGrid}>
              {DATE_CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  style={[styles.categoryCard, { borderColor: cat.color + '40' }]}
                  onPress={() => setSelectedCategory(cat.id)}
                  activeOpacity={0.85}
                >
                  <View style={[styles.categoryIconBg, { backgroundColor: cat.color + '20' }]}>
                    <Text style={styles.categoryEmoji}>{cat.emoji}</Text>
                  </View>
                  <Text style={styles.categoryName}>{cat.label}</Text>
                  <Text style={styles.categoryCount}>
                    {MOCK_DATE_IDEAS.filter((i) => i.category === cat.id).length} ideas
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.divider} />
            <Text style={styles.sectionTitle}>All Date Ideas</Text>
          </>
        )}

        {/* Ideas */}
        {filteredIdeas.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>🔍</Text>
            <Text style={styles.emptyTitle}>No ideas found</Text>
            <Text style={styles.emptySubtitle}>
              Try adjusting your search or filters to find date ideas.
            </Text>
            <TouchableOpacity
              style={styles.resetBtn}
              onPress={() => {
                setSearchQuery('');
                setSelectedCategory('all');
                setSelectedBudget('');
                setSelectedMood('');
              }}
            >
              <Text style={styles.resetBtnText}>Reset Filters</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.ideasContainer}>
            {filteredIdeas.map((idea) => (
              <DateIdeaCard
                key={idea.id}
                idea={idea}
                onPress={() => navigation.navigate('DateIdeaDetail', { idea })}
                variant="horizontal"
              />
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    backgroundColor: Colors.background,
    paddingHorizontal: Spacing.base,
    paddingBottom: Spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray100,
    gap: Spacing.md,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  },
  filterToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: BorderRadius.full,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    backgroundColor: Colors.surfaceAlt,
  },
  filterToggleActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterToggleText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.primary,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
    borderWidth: 1.5,
    borderColor: Colors.gray200,
    gap: Spacing.sm,
  },
  searchIcon: {},
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: Colors.textPrimary,
    height: 36,
  },
  filtersPanel: {
    backgroundColor: Colors.white,
    padding: Spacing.base,
    marginBottom: Spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray100,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  filterRow: {
    flexDirection: 'row',
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: BorderRadius.full,
    borderWidth: 1.5,
    borderColor: Colors.gray200,
    marginRight: 8,
    backgroundColor: Colors.white,
  },
  filterChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterChipEmoji: {
    fontSize: 13,
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  filterChipTextActive: {
    color: Colors.white,
  },
  moodGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  moodChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: BorderRadius.full,
    borderWidth: 1.5,
    borderColor: Colors.gray200,
    backgroundColor: Colors.white,
  },
  moodChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  moodEmoji: {
    fontSize: 14,
  },
  moodText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  moodTextActive: {
    color: Colors.white,
  },
  clearFiltersBtn: {
    marginTop: Spacing.base,
    alignSelf: 'center',
  },
  clearFiltersText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.error,
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
  },
  resultsCount: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  sortBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  sortText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
    paddingHorizontal: Spacing.base,
    marginBottom: Spacing.md,
    marginTop: Spacing.base,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: Spacing.base,
    gap: 12,
    marginBottom: Spacing.base,
  },
  categoryCard: {
    width: (SCREEN_WIDTH - Spacing.base * 2 - 12) / 2,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl,
    padding: Spacing.base,
    gap: 8,
    borderWidth: 1.5,
    ...Shadow.sm,
  },
  categoryIconBg: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryEmoji: {
    fontSize: 22,
  },
  categoryName: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  categoryCount: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.gray100,
    marginHorizontal: Spacing.base,
    marginVertical: Spacing.lg,
  },
  ideasContainer: {
    paddingHorizontal: Spacing.base,
    paddingBottom: Spacing.base,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing['3xl'],
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
  resetBtn: {
    marginTop: Spacing.sm,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.full,
  },
  resetBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.white,
  },
});
