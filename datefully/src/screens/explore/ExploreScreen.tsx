import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  FlatList,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Spacing, BorderRadius } from '../../constants';
import { useAppStore } from '../../store';
import { MOCK_DATE_IDEAS } from '../../constants/mockData';

interface ExploreScreenProps {
  navigation: any;
}

const CATEGORIES = [
  { id: 'romantic', label: 'Romantic', emoji: '💕', count: 12 },
  { id: 'foodie', label: 'Foodie', emoji: '🍽️', count: 9 },
  { id: 'adventure', label: 'Adventure', emoji: '🏔️', count: 7 },
  { id: 'cultural', label: 'Cultural', emoji: '🎭', count: 8 },
  { id: 'outdoor', label: 'Outdoor', emoji: '🌿', count: 11 },
  { id: 'nightlife', label: 'Night Out', emoji: '🌙', count: 6 },
  { id: 'active', label: 'Active', emoji: '🏋️', count: 5 },
  { id: 'stay-in', label: 'Stay In', emoji: '🏠', count: 4 },
];

const BUDGETS = ['Free', 'Budget', 'Moderate', 'Upscale', 'Luxury'];
const MOODS = ['Spontaneous', 'Planned', 'Romantic', 'Adventurous', 'Cozy', 'Outdoor'];

export const ExploreScreen: React.FC<ExploreScreenProps> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { savedIdeas, toggleSaveIdea } = useAppStore();

  const [query, setQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedBudget, setSelectedBudget] = useState('');
  const [selectedMood, setSelectedMood] = useState('');

  const results = useMemo(() => {
    let list = [...MOCK_DATE_IDEAS];
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (d) =>
          d.title.toLowerCase().includes(q) ||
          d.description.toLowerCase().includes(q) ||
          d.category.toLowerCase().includes(q)
      );
    }
    if (selectedCategory) {
      list = list.filter((d) => d.category === selectedCategory);
    }
    return list;
  }, [query, selectedCategory, selectedBudget, selectedMood]);

  const clearFilters = () => {
    setSelectedCategory('');
    setSelectedBudget('');
    setSelectedMood('');
  };

  const hasFilters = selectedCategory || selectedBudget || selectedMood;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <LinearGradient
        colors={['#0A0A0A', '#1C0000', '#0A0A0A']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.headerTitle}>Explore</Text>
            <Text style={styles.headerSub}>Find your perfect date idea</Text>
          </View>
          <TouchableOpacity
            style={[styles.filterToggle, showFilters && styles.filterToggleActive]}
            onPress={() => setShowFilters(!showFilters)}
          >
            <Ionicons
              name="options"
              size={18}
              color={showFilters ? Colors.black : Colors.primary}
            />
            {hasFilters ? <View style={styles.filterDot} /> : null}
          </TouchableOpacity>
        </View>

        {/* Search */}
        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color={Colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by mood, category, idea..."
            placeholderTextColor={Colors.inputPlaceholder}
            value={query}
            onChangeText={setQuery}
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')}>
              <Ionicons name="close-circle" size={18} color={Colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>
      </LinearGradient>

      {/* Filters Panel */}
      {showFilters && (
        <View style={styles.filtersPanel}>
          <View style={styles.filterHeader}>
            <Text style={styles.filterTitle}>Filters</Text>
            {hasFilters ? (
              <TouchableOpacity onPress={clearFilters}>
                <Text style={styles.clearText}>Clear All</Text>
              </TouchableOpacity>
            ) : null}
          </View>

          <Text style={styles.filterLabel}>Category</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.filterChips}>
              {CATEGORIES.map((c) => (
                <TouchableOpacity
                  key={c.id}
                  style={[
                    styles.filterChip,
                    selectedCategory === c.id && styles.filterChipActive,
                  ]}
                  onPress={() =>
                    setSelectedCategory(selectedCategory === c.id ? '' : c.id)
                  }
                >
                  <Text style={styles.filterChipEmoji}>{c.emoji}</Text>
                  <Text
                    style={[
                      styles.filterChipText,
                      selectedCategory === c.id && styles.filterChipTextActive,
                    ]}
                  >
                    {c.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          <Text style={styles.filterLabel}>Budget</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.filterChips}>
              {BUDGETS.map((b) => (
                <TouchableOpacity
                  key={b}
                  style={[
                    styles.filterChip,
                    selectedBudget === b && styles.filterChipActive,
                  ]}
                  onPress={() => setSelectedBudget(selectedBudget === b ? '' : b)}
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      selectedBudget === b && styles.filterChipTextActive,
                    ]}
                  >
                    {b}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          <Text style={styles.filterLabel}>Mood</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.filterChips}>
              {MOODS.map((m) => (
                <TouchableOpacity
                  key={m}
                  style={[
                    styles.filterChip,
                    selectedMood === m && styles.filterChipActive,
                  ]}
                  onPress={() => setSelectedMood(selectedMood === m ? '' : m)}
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      selectedMood === m && styles.filterChipTextActive,
                    ]}
                  >
                    {m}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>
      )}

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
      >
        {/* Categories Grid (when no search/filter active) */}
        {!query && !hasFilters && !showFilters && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Browse Categories</Text>
            <View style={styles.catGrid}>
              {CATEGORIES.map((c) => (
                <TouchableOpacity
                  key={c.id}
                  style={styles.catCard}
                  onPress={() => setSelectedCategory(c.id)}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={['#1A0000', '#2D0000']}
                    style={styles.catCardGrad}
                  >
                    <Text style={styles.catCardEmoji}>{c.emoji}</Text>
                    <Text style={styles.catCardLabel}>{c.label}</Text>
                    <Text style={styles.catCardCount}>{c.count} ideas</Text>
                  </LinearGradient>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Results */}
        {(query || hasFilters || showFilters) && (
          <View style={styles.section}>
            <View style={styles.resultsHeader}>
              <Text style={styles.sectionTitle}>
                {results.length} Result{results.length !== 1 ? 's' : ''}
              </Text>
              {hasFilters && (
                <TouchableOpacity onPress={clearFilters}>
                  <Text style={styles.clearText}>Clear</Text>
                </TouchableOpacity>
              )}
            </View>

            {results.length === 0 ? (
              <View style={styles.empty}>
                <Text style={styles.emptyEmoji}>🔍</Text>
                <Text style={styles.emptyTitle}>No results found</Text>
                <Text style={styles.emptySub}>
                  Try different keywords or clear your filters
                </Text>
                <TouchableOpacity
                  style={styles.emptyBtn}
                  onPress={() => { setQuery(''); clearFilters(); }}
                >
                  <Text style={styles.emptyBtnText}>Reset Search</Text>
                </TouchableOpacity>
              </View>
            ) : (
              results.map((idea) => {
                const saved = savedIdeas.includes(idea.id);
                return (
                  <TouchableOpacity
                    key={idea.id}
                    style={styles.resultCard}
                    activeOpacity={0.9}
                    onPress={() => navigation.navigate('DateIdeaDetail', { idea })}
                  >
                    <Image source={{ uri: idea.imageUrl }} style={styles.resultImg} />
                    <View style={styles.resultInfo}>
                      <View style={styles.resultTopRow}>
                        <View style={styles.catTag}>
                          <Text style={styles.catTagText}>{idea.category}</Text>
                        </View>
                        {idea.isFeatured && (
                          <View style={styles.featTag}>
                            <Ionicons name="star" size={10} color={Colors.primary} />
                            <Text style={styles.featTagText}>Featured</Text>
                          </View>
                        )}
                      </View>
                      <Text style={styles.resultTitle} numberOfLines={2}>{idea.title}</Text>
                      <Text style={styles.resultDesc} numberOfLines={2}>{idea.description}</Text>
                      <View style={styles.resultMeta}>
                        <View style={styles.starRow}>
                          <Ionicons name="star" size={11} color={Colors.primary} />
                          <Text style={styles.starText}>{idea.rating}</Text>
                        </View>
                        <Text style={styles.metaDot}>·</Text>
                        <Text style={styles.metaText}>{idea.priceRange}</Text>
                        <Text style={styles.metaDot}>·</Text>
                        <Text style={styles.metaText}>{idea.estimatedDuration}</Text>
                      </View>
                    </View>
                    <TouchableOpacity
                      style={styles.heartBtn}
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
              })
            )}
          </View>
        )}

        {/* All Ideas (default) */}
        {!query && !hasFilters && !showFilters && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>All Ideas</Text>
            {MOCK_DATE_IDEAS.slice(0, 8).map((idea) => {
              const saved = savedIdeas.includes(idea.id);
              return (
                <TouchableOpacity
                  key={idea.id}
                  style={styles.resultCard}
                  activeOpacity={0.9}
                  onPress={() => navigation.navigate('DateIdeaDetail', { idea })}
                >
                  <Image source={{ uri: idea.imageUrl }} style={styles.resultImg} />
                  <View style={styles.resultInfo}>
                    <Text style={styles.resultTitle} numberOfLines={1}>{idea.title}</Text>
                    <Text style={styles.resultDesc} numberOfLines={2}>{idea.description}</Text>
                    <View style={styles.resultMeta}>
                      <View style={styles.starRow}>
                        <Ionicons name="star" size={11} color={Colors.primary} />
                        <Text style={styles.starText}>{idea.rating}</Text>
                      </View>
                      <Text style={styles.metaDot}>·</Text>
                      <Text style={styles.metaText}>{idea.priceRange}</Text>
                      <Text style={styles.metaDot}>·</Text>
                      <Text style={styles.metaText}>{idea.estimatedDuration}</Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    style={styles.heartBtn}
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
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    paddingHorizontal: Spacing['2xl'],
    paddingBottom: Spacing.xl,
    gap: Spacing.base,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingTop: Spacing.base,
  },
  headerTitle: { fontSize: 28, fontWeight: '800', color: Colors.textPrimary },
  headerSub: { fontSize: 13, color: Colors.textMuted, marginTop: 2 },
  filterToggle: {
    width: 42, height: 42,
    borderRadius: 21,
    backgroundColor: Colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  filterToggleActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterDot: {
    position: 'absolute',
    top: 6, right: 6,
    width: 8, height: 8,
    borderRadius: 4,
    backgroundColor: Colors.secondary,
  },
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
  filtersPanel: {
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing['2xl'],
    paddingVertical: Spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: Colors.cardBorder,
    gap: 10,
  },
  filterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  filterTitle: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary },
  clearText: { fontSize: 13, color: Colors.primary, fontWeight: '600' },
  filterLabel: { fontSize: 12, color: Colors.textMuted, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  filterChips: { flexDirection: 'row', gap: 8, paddingVertical: 4 },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12, paddingVertical: 7,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surfaceAlt,
    borderWidth: 1,
    borderColor: Colors.inputBorder,
  },
  filterChipActive: {
    borderColor: Colors.primary,
    backgroundColor: 'rgba(212,175,55,0.1)',
  },
  filterChipEmoji: { fontSize: 13 },
  filterChipText: { fontSize: 13, color: Colors.textMuted, fontWeight: '600' },
  filterChipTextActive: { color: Colors.primary },
  section: { padding: Spacing['2xl'] },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: Colors.textPrimary, marginBottom: Spacing.base },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.base,
  },
  catGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  catCard: { width: '47%', borderRadius: BorderRadius.xl, overflow: 'hidden' },
  catCardGrad: {
    padding: Spacing.base,
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(139,0,0,0.3)',
    borderRadius: BorderRadius.xl,
  },
  catCardEmoji: { fontSize: 28 },
  catCardLabel: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary },
  catCardCount: { fontSize: 12, color: Colors.textMuted },
  resultCard: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  resultImg: { width: 90, height: 100 },
  resultInfo: { flex: 1, padding: 12, gap: 5 },
  resultTopRow: { flexDirection: 'row', gap: 8 },
  catTag: {
    backgroundColor: 'rgba(139,0,0,0.25)',
    paddingHorizontal: 8, paddingVertical: 3,
    borderRadius: BorderRadius.sm,
  },
  catTagText: { fontSize: 10, color: '#FF6B6B', fontWeight: '700', textTransform: 'capitalize' },
  featTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(212,175,55,0.15)',
    paddingHorizontal: 8, paddingVertical: 3,
    borderRadius: BorderRadius.sm,
  },
  featTagText: { fontSize: 10, color: Colors.primary, fontWeight: '700' },
  resultTitle: { fontSize: 14, fontWeight: '700', color: Colors.textPrimary },
  resultDesc: { fontSize: 12, color: Colors.textMuted, lineHeight: 17 },
  resultMeta: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  starRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  starText: { fontSize: 12, color: Colors.primary, fontWeight: '700' },
  metaDot: { color: Colors.inputBorder, fontSize: 12 },
  metaText: { fontSize: 12, color: Colors.textMuted },
  heartBtn: { padding: 14, alignSelf: 'center' },
  empty: {
    alignItems: 'center',
    paddingVertical: 60,
    gap: 12,
  },
  emptyEmoji: { fontSize: 48 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: Colors.textPrimary },
  emptySub: { fontSize: 14, color: Colors.textMuted, textAlign: 'center' },
  emptyBtn: {
    marginTop: 8,
    paddingHorizontal: 24, paddingVertical: 12,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.secondary,
  },
  emptyBtnText: { fontSize: 14, fontWeight: '700', color: '#fff' },
});
