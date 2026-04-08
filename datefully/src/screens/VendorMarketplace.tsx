// ─── Screen 8 — Vendor Marketplace ───────────────────────────────────────────
import React, { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, VendorListing } from '../types';
import ScreenContainer from '../components/common/ScreenContainer';
import { Colors, Typography } from '../constants/theme';
import { useDateStore } from '../store/dateStore';

type Nav = NativeStackNavigationProp<RootStackParamList, 'VendorMarketplace'>;

// ─── Badge colors ─────────────────────────────────────────────────────────────
const BADGE_COLORS: Record<string, string> = {
  'Black-Owned': '#6B21A8',
  'Minority-Owned': '#7C3AED',
  'Woman-Owned': '#BE185D',
  'LGBTQ+ Welcoming': '#0369A1',
  'Halal Verified': '#059669',
  'Vegan Friendly': '#16A34A',
};

const DIETARY_FILTER_OPTIONS = [
  'Vegan Friendly', 'Vegan Options', 'Vegetarian', 'Halal Options',
  'Halal Verified', 'Gluten Free Options', 'Mocktails Available',
];

const BADGE_FILTER_OPTIONS = [
  'Black-Owned', 'Minority-Owned', 'Woman-Owned', 'LGBTQ+ Welcoming',
];

type Category = 'all' | 'restaurant' | 'experience' | 'addon';

// ─── Sub-components ───────────────────────────────────────────────────────────
function StarRow({ rating, count }: { rating: number; count: number }) {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5;
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Text key={i} style={{ fontSize: 12, color: Colors.gold }}>
          {i < full ? '★' : i === full && half ? '½' : '☆'}
        </Text>
      ))}
      <Text style={styles.reviewCount}>({count})</Text>
    </View>
  );
}

function BadgeChip({ label }: { label: string }) {
  const bg = BADGE_COLORS[label] ?? Colors.cardBorder;
  return (
    <View style={[styles.badgeChip, { backgroundColor: bg }]}>
      <Text style={styles.badgeChipText}>{label}</Text>
    </View>
  );
}

function DietaryTag({ label }: { label: string }) {
  const isHalal = label.toLowerCase().includes('halal');
  const isVegan = label.toLowerCase().includes('vegan');
  const color = isHalal ? '#059669' : isVegan ? '#16A34A' : Colors.textSecondary;
  return (
    <View style={[styles.dietaryTag, { borderColor: color }]}>
      <Text style={[styles.dietaryTagText, { color }]}>{label}</Text>
    </View>
  );
}

function VendorCard({ vendor, onBook }: { vendor: VendorListing; onBook: (v: VendorListing) => void }) {
  const categoryEmoji =
    vendor.category === 'restaurant' ? '🍽️' : vendor.category === 'experience' ? '✨' : '➕';
  return (
    <View style={[styles.vendorCard, vendor.sponsored && styles.vendorCardSponsored]}>
      {vendor.sponsored && (
        <View style={styles.sponsoredBadge}>
          <Text style={styles.sponsoredText}>⭐ Featured</Text>
        </View>
      )}

      {/* Header */}
      <View style={styles.vendorHeader}>
        <Text style={styles.vendorEmoji}>{categoryEmoji}</Text>
        <View style={{ flex: 1 }}>
          <Text style={styles.vendorName}>{vendor.name}</Text>
          <StarRow rating={vendor.rating} count={vendor.reviewCount} />
        </View>
        <Text style={styles.priceRange}>{vendor.priceRange}</Text>
      </View>

      <Text style={styles.vendorDesc}>{vendor.description}</Text>

      {/* Badges */}
      {vendor.badges.length > 0 && (
        <View style={styles.chipsRow}>
          {vendor.badges.map((b) => <BadgeChip key={b} label={b} />)}
        </View>
      )}

      {/* Dietary tags */}
      {vendor.dietaryTags.length > 0 && (
        <View style={styles.chipsRow}>
          {vendor.dietaryTags.map((d) => <DietaryTag key={d} label={d} />)}
        </View>
      )}

      {/* Meta */}
      <View style={styles.metaRow}>
        <Text style={styles.metaItem}>📍 {vendor.distance}</Text>
        <Text style={styles.metaItem}>🅿️ {vendor.parkingInfo}</Text>
      </View>

      {/* Book */}
      <TouchableOpacity style={styles.bookBtn} onPress={() => onBook(vendor)} activeOpacity={0.85}>
        <Text style={styles.bookBtnText}>Book Now →</Text>
      </TouchableOpacity>
    </View>
  );
}

// ─── Main screen ──────────────────────────────────────────────────────────────
export default function VendorMarketplace() {
  const navigation = useNavigation<Nav>();
  const { vendorListings, userCity, partnerProfile } = useDateStore();

  const [activeCategory, setActiveCategory] = useState<Category>('all');
  const [activeDietaryFilters, setActiveDietaryFilters] = useState<string[]>(
    partnerProfile.dietaryNeeds,
  );
  const [activeBadgeFilters, setActiveBadgeFilters] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  function toggleDietary(tag: string) {
    setActiveDietaryFilters((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  }
  function toggleBadge(badge: string) {
    setActiveBadgeFilters((prev) =>
      prev.includes(badge) ? prev.filter((b) => b !== badge) : [...prev, badge],
    );
  }

  const filtered = useMemo(() => {
    return vendorListings.filter((v) => {
      if (activeCategory !== 'all' && v.category !== activeCategory) return false;
      if (activeDietaryFilters.length > 0) {
        const ok = activeDietaryFilters.some((f) =>
          v.dietaryTags.some((t) => t.toLowerCase().includes(f.toLowerCase())),
        );
        if (!ok) return false;
      }
      if (activeBadgeFilters.length > 0) {
        const ok = activeBadgeFilters.some((b) => v.badges.includes(b));
        if (!ok) return false;
      }
      return true;
    });
  }, [vendorListings, activeCategory, activeDietaryFilters, activeBadgeFilters]);

  function handleBook(vendor: VendorListing) {
    if (vendor.bookingUrl) Linking.openURL(vendor.bookingUrl).catch(() => {});
  }

  const categories: { key: Category; label: string; emoji: string }[] = [
    { key: 'all', label: 'All', emoji: '🗂️' },
    { key: 'restaurant', label: 'Restaurants', emoji: '🍽️' },
    { key: 'experience', label: 'Experiences', emoji: '✨' },
    { key: 'addon', label: 'Add-Ons', emoji: '➕' },
  ];

  const hasActiveFilters = activeDietaryFilters.length > 0 || activeBadgeFilters.length > 0;

  return (
    <ScreenContainer>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={styles.backArrow}>‹</Text>
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>Marketplace</Text>
            <Text style={styles.subtitle}>{userCity}</Text>
          </View>
          <TouchableOpacity
            style={styles.filterToggle}
            onPress={() => setShowFilters((p) => !p)}
          >
            <Text style={styles.filterToggleText}>
              {showFilters ? '✕ Hide' : '⚙️ Filters'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Category tabs */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryRow}
        >
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat.key}
              style={[styles.catTab, activeCategory === cat.key && styles.catTabActive]}
              onPress={() => setActiveCategory(cat.key)}
              activeOpacity={0.8}
            >
              <Text style={styles.catEmoji}>{cat.emoji}</Text>
              <Text
                style={[styles.catLabel, activeCategory === cat.key && styles.catLabelActive]}
              >
                {cat.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Filter panel */}
        {showFilters && (
          <View style={styles.filterPanel}>
            <Text style={styles.filterSection}>Dietary Needs</Text>
            <View style={styles.chipsRow}>
              {DIETARY_FILTER_OPTIONS.map((tag) => (
                <TouchableOpacity
                  key={tag}
                  style={[
                    styles.filterChip,
                    activeDietaryFilters.includes(tag) && styles.filterChipDietActive,
                  ]}
                  onPress={() => toggleDietary(tag)}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      activeDietaryFilters.includes(tag) && styles.filterChipTextActive,
                    ]}
                  >
                    {tag}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[styles.filterSection, { marginTop: 12 }]}>Identity & Values</Text>
            <View style={styles.chipsRow}>
              {BADGE_FILTER_OPTIONS.map((badge) => (
                <TouchableOpacity
                  key={badge}
                  style={[
                    styles.filterChip,
                    activeBadgeFilters.includes(badge) && styles.filterChipBadgeActive,
                  ]}
                  onPress={() => toggleBadge(badge)}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      activeBadgeFilters.includes(badge) && styles.filterChipTextActive,
                    ]}
                  >
                    {badge}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Active filter summary */}
        {hasActiveFilters && (
          <View style={styles.activeFiltersRow}>
            <Text style={styles.activeFiltersLabel}>Active: </Text>
            {[...activeDietaryFilters, ...activeBadgeFilters].map((f) => (
              <View key={f} style={styles.activePill}>
                <Text style={styles.activePillText}>{f}</Text>
              </View>
            ))}
            <TouchableOpacity
              onPress={() => { setActiveDietaryFilters([]); setActiveBadgeFilters([]); }}
            >
              <Text style={styles.clearAllText}>Clear</Text>
            </TouchableOpacity>
          </View>
        )}

        <Text style={styles.resultsCount}>
          {filtered.length} venue{filtered.length !== 1 ? 's' : ''}
        </Text>

        {/* Vendor cards */}
        {filtered.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>🔍</Text>
            <Text style={styles.emptyTitle}>No matches</Text>
            <Text style={styles.emptySubtitle}>Adjust your filters to see more venues.</Text>
          </View>
        ) : (
          filtered.map((vendor) => (
            <VendorCard key={vendor.id} vendor={vendor} onBook={handleBook} />
          ))
        )}

        {/* Plan Another Date */}
        <TouchableOpacity
          style={styles.planBtn}
          onPress={() => navigation.navigate('WhosPlanning')}
          activeOpacity={0.85}
        >
          <Text style={styles.planBtnText}>Plan Another Date ♥</Text>
        </TouchableOpacity>

        <View style={{ height: 32 }} />
      </ScrollView>
    </ScreenContainer>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    gap: 12,
  },
  backBtn: { paddingRight: 4 },
  backArrow: { fontSize: 32, color: Colors.textPrimary, lineHeight: 36 },
  title: {
    fontFamily: Typography.heading,
    fontSize: 22,
    color: Colors.textPrimary,
  },
  subtitle: { fontSize: 13, color: Colors.textMuted, marginTop: 2 },
  filterToggle: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  filterToggleText: { fontSize: 13, color: Colors.gold },

  categoryRow: {
    paddingHorizontal: 20,
    paddingBottom: 12,
    gap: 8,
  },
  catTab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  catTabActive: { backgroundColor: Colors.gold, borderColor: Colors.gold },
  catEmoji: { fontSize: 14 },
  catLabel: { fontSize: 13, color: Colors.textSecondary },
  catLabelActive: { color: Colors.background, fontWeight: '700' },

  filterPanel: {
    marginHorizontal: 20,
    marginBottom: 12,
    padding: 14,
    backgroundColor: Colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  filterSection: {
    fontSize: 11,
    color: Colors.textMuted,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 8,
  },
  filterChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    backgroundColor: Colors.cardAlt,
  },
  filterChipDietActive: { backgroundColor: '#14532d', borderColor: '#16A34A' },
  filterChipBadgeActive: { backgroundColor: '#3B0764', borderColor: '#7C3AED' },
  filterChipText: { fontSize: 12, color: Colors.textSecondary },
  filterChipTextActive: { color: Colors.textPrimary },

  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 8,
  },

  activeFiltersRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 10,
    gap: 6,
  },
  activeFiltersLabel: { fontSize: 12, color: Colors.textMuted },
  activePill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    backgroundColor: Colors.cardAlt,
  },
  activePillText: { fontSize: 11, color: Colors.gold },
  clearAllText: { fontSize: 12, color: Colors.error, marginLeft: 4 },

  resultsCount: {
    paddingHorizontal: 20,
    marginBottom: 8,
    fontSize: 13,
    color: Colors.textMuted,
  },

  vendorCard: {
    marginHorizontal: 20,
    marginBottom: 14,
    padding: 16,
    backgroundColor: Colors.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  vendorCardSponsored: { borderColor: Colors.gold },
  sponsoredBadge: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.gold,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginBottom: 10,
  },
  sponsoredText: { fontSize: 10, color: Colors.background, fontWeight: '700' },

  vendorHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 8,
  },
  vendorEmoji: { fontSize: 26, width: 34, textAlign: 'center' },
  vendorName: {
    fontFamily: Typography.heading,
    fontSize: 16,
    color: Colors.textPrimary,
    marginBottom: 3,
  },
  reviewCount: { fontSize: 11, color: Colors.textMuted, marginLeft: 2 },
  priceRange: { fontSize: 14, color: Colors.gold, fontWeight: '700' },

  vendorDesc: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 19,
    marginBottom: 10,
  },

  badgeChip: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  badgeChipText: { fontSize: 10, color: '#ffffff', fontWeight: '700' },

  dietaryTag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
  },
  dietaryTagText: { fontSize: 11, fontWeight: '600' },

  metaRow: { gap: 4, marginBottom: 12 },
  metaItem: { fontSize: 12, color: Colors.textMuted, lineHeight: 18 },

  bookBtn: {
    backgroundColor: Colors.red,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  bookBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
    letterSpacing: 0.3,
  },

  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
    paddingHorizontal: 24,
  },
  emptyEmoji: { fontSize: 40, marginBottom: 12 },
  emptyTitle: {
    fontFamily: Typography.heading,
    fontSize: 20,
    color: Colors.textPrimary,
    marginBottom: 6,
  },
  emptySubtitle: { fontSize: 14, color: Colors.textMuted, textAlign: 'center' },

  planBtn: {
    marginHorizontal: 20,
    marginTop: 8,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.gold,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  planBtnText: {
    color: Colors.gold,
    fontSize: 15,
    fontFamily: Typography.heading,
  },
});
