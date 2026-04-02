import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, PartnerProfile } from '../types';
import { useDateStore } from '../store';
import { Colors, Typography, Spacing, BorderRadius } from '../constants/theme';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'PartnerProfile'>;
};

const SECTIONS: {
  key: keyof PartnerProfile;
  emoji: string;
  title: string;
  chips: string[];
}[] = [
  {
    key: 'foodDrinks',
    emoji: '🍕',
    title: 'Food & Drinks',
    chips: ['Italian', 'Sushi', 'BBQ', 'Vegan', 'Seafood', 'Cocktails', 'Wine', 'Craft Beer', 'Coffee', 'Fast Food'],
  },
  {
    key: 'activities',
    emoji: '🎭',
    title: 'Activities',
    chips: ['Movies', 'Theater', 'Live Music', 'Dancing', 'Comedy Show', 'Art Galleries', 'Sports', 'Trivia'],
  },
  {
    key: 'outdoors',
    emoji: '🌿',
    title: 'Outdoors',
    chips: ['Parks', 'Hiking', 'Bike Rides', 'Outdoor Concerts', 'Rooftop Bars', 'Water Activities'],
  },
  {
    key: 'stayHome',
    emoji: '🏠',
    title: 'Stay at Home',
    chips: ['Cook Together', 'Movie Night', 'Game Night', 'Spa Night', 'Binge TV'],
  },
  {
    key: 'personality',
    emoji: '💬',
    title: 'Their Personality',
    chips: ['Adventurous', 'Romantic', 'Laid Back', 'Spontaneous', 'Planner', 'Night Owl', 'Early Bird'],
  },
  {
    key: 'notFanOf',
    emoji: '❌',
    title: 'Not a Fan Of',
    chips: ['Loud Places', 'Crowded Spots', 'Spicy Food', 'Outdoors', 'Fancy Restaurants', 'Horror Movies'],
  },
  {
    key: 'accessibility',
    emoji: '♿',
    title: 'Accessibility',
    chips: ['Wheelchair Access', 'Limited Walking', 'Quiet Spaces', 'No Stairs', 'Dietary Restrictions'],
  },
];

export default function PartnerProfileScreen({ navigation }: Props) {
  const { partnerProfile, setPartnerProfile } = useDateStore();
  const [profile, setProfile] = useState<PartnerProfile>({ ...partnerProfile });

  const toggleChip = (key: keyof PartnerProfile, value: string) => {
    setProfile((prev) => {
      const current = prev[key];
      const updated = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];
      return { ...prev, [key]: updated };
    });
  };

  const handleSave = () => {
    setPartnerProfile(profile);
    navigation.navigate('AIChat');
  };

  const hasAnySelection = Object.values(profile).some((arr) => arr.length > 0);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Your Partner's Vibe</Text>
          <Text style={styles.subtitle}>Set it once, never again</Text>
          <Text style={styles.hint}>Select everything that fits — the more you share, the better your dates!</Text>
        </View>

        {/* Sections */}
        {SECTIONS.map((section) => (
          <View key={section.key} style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionEmoji}>{section.emoji}</Text>
              <Text style={styles.sectionTitle}>{section.title}</Text>
              {profile[section.key].length > 0 && (
                <View style={styles.countBadge}>
                  <Text style={styles.countText}>{profile[section.key].length}</Text>
                </View>
              )}
            </View>
            <View style={styles.chipGrid}>
              {section.chips.map((chip) => {
                const isSelected = profile[section.key].includes(chip);
                return (
                  <TouchableOpacity
                    key={chip}
                    style={[styles.chip, isSelected && styles.chipSelected]}
                    onPress={() => toggleChip(section.key, chip)}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
                      {chip}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        ))}

        {/* Skip option */}
        {!hasAnySelection && (
          <TouchableOpacity
            style={styles.skipLink}
            onPress={() => navigation.navigate('AIChat')}
          >
            <Text style={styles.skipText}>Skip for now →</Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      {/* Save button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSave}
          activeOpacity={0.85}
        >
          <Text style={styles.saveText}>
            {hasAnySelection ? 'Save & Continue' : 'Continue'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.screen,
    paddingBottom: Spacing.xl,
  },
  header: {
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xxl,
  },
  backBtn: {
    marginBottom: Spacing.md,
  },
  backText: {
    color: Colors.gold,
    fontSize: Typography.base,
  },
  title: {
    fontFamily: Typography.heading,
    fontSize: Typography.xxl,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: Typography.base,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  hint: {
    fontSize: Typography.sm,
    color: Colors.textMuted,
    lineHeight: 18,
  },
  section: {
    marginBottom: Spacing.xxl,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: Spacing.md,
  },
  sectionEmoji: {
    fontSize: 18,
  },
  sectionTitle: {
    fontSize: Typography.md,
    color: Colors.textPrimary,
    fontWeight: Typography.semibold,
    flex: 1,
  },
  countBadge: {
    backgroundColor: Colors.gold,
    borderRadius: BorderRadius.pill,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countText: {
    color: Colors.black,
    fontSize: 10,
    fontWeight: Typography.bold,
  },
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
  },
  chip: {
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    borderRadius: BorderRadius.pill,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
  },
  chipSelected: {
    borderColor: Colors.gold,
    backgroundColor: 'rgba(201, 168, 76, 0.12)',
  },
  chipText: {
    color: Colors.textSecondary,
    fontSize: Typography.sm,
  },
  chipTextSelected: {
    color: Colors.gold,
    fontWeight: Typography.semibold,
  },
  skipLink: {
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  skipText: {
    color: Colors.textMuted,
    fontSize: Typography.sm,
  },
  footer: {
    paddingHorizontal: Spacing.screen,
    paddingBottom: Spacing.xl,
    paddingTop: Spacing.md,
    backgroundColor: Colors.background,
    borderTopWidth: 1,
    borderTopColor: Colors.cardBorder,
  },
  saveButton: {
    backgroundColor: Colors.red,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.lg,
    alignItems: 'center',
  },
  saveText: {
    color: Colors.white,
    fontSize: Typography.md,
    fontWeight: Typography.bold,
    letterSpacing: 0.5,
  },
});
