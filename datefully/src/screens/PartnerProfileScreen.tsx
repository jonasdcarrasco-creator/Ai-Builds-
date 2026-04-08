import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, PartnerProfile } from '../types';
import { useDateStore } from '../store';
import { Colors, Typography, Spacing, BorderRadius } from '../constants/theme';
import ScreenContainer from '../components/common/ScreenContainer';
import RomanticTipCard from '../components/common/RomanticTip';
import { getTip } from '../data/romanticTips';

type Props = { navigation: NativeStackNavigationProp<RootStackParamList, 'PartnerProfile'> };

const DIETARY_NEEDS = [
  'Vegan','Vegetarian','Pescatarian','Gluten Free','Halal','Kosher',
  'Dairy Free','Keto','Paleo','Nut Allergy','Shellfish Allergy','No Restrictions',
];

const CUISINE_PREFS = [
  'Italian','Sushi','Mexican','Steakhouse','French','Spanish Tapas','Mediterranean','Greek',
  'Indian','Korean','Vietnamese','Thai','Chinese','Japanese','Asian Fusion',
  'Ethiopian','Caribbean','Soul Food','BBQ','Seafood','Farm to Table','Brunch',
  'Burgers','Pizza','Dessert Bar','Coffee & Tea','Wine Bar','Cocktail Bar','Brewery','Mocktails',
];

const ACTIVITIES = [
  'Movies','Theater','Live Music','Dancing','Comedy Show','Art Galleries',
  'Sports Games','Trivia Night','Cooking Class','Yoga','Painting Night',
  'Bowling','Mini Golf','Escape Room','Karaoke',
];

const ACCESSIBILITY = [
  'Wheelchair Friendly','No Stairs','Pet Friendly','LGBTQ+ Welcoming',
  'Kid Friendly','Minority-Owned','Woman-Owned','Quiet Spaces',
];

const PERSONALITY = [
  'Adventurous','Romantic','Laid Back','Spontaneous','Homebody',
  'Night Owl','Early Bird','Foodie','Artsy','Athletic',
];

const AVOID = [
  'Loud Places','Crowded Spots','Spicy Food','Outdoors','Fancy Restaurants',
  'Horror Movies','Alcohol','Smoking Areas','Long Waits',
];

function ChipSection({
  title, emoji, chips, selected, onToggle, green = false,
}: {
  title: string; emoji: string; chips: string[];
  selected: string[]; onToggle: (v: string) => void; green?: boolean;
}) {
  return (
    <View style={sec.container}>
      <Text style={sec.title}>{emoji} {title}</Text>
      <View style={sec.row}>
        {chips.map((chip) => {
          const active = selected.includes(chip);
          return (
            <TouchableOpacity
              key={chip}
              style={[sec.chip, active && (green ? sec.chipGreen : sec.chipGold)]}
              onPress={() => onToggle(chip)}
              activeOpacity={0.8}
            >
              <Text style={[sec.chipText, active && (green ? sec.chipTextGreen : sec.chipTextGold)]}>
                {chip}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const sec = StyleSheet.create({
  container: { marginBottom: Spacing.xl, paddingHorizontal: Spacing.screen },
  title: { color: Colors.textPrimary, fontSize: Typography.base, fontWeight: Typography.semibold, marginBottom: Spacing.sm },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.xs },
  chip: {
    backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.cardBorder,
    borderRadius: BorderRadius.pill, paddingHorizontal: Spacing.sm, paddingVertical: 6,
  },
  chipGold: { borderColor: Colors.gold, backgroundColor: 'rgba(201,168,76,0.12)' },
  chipGreen: { borderColor: '#27ae60', backgroundColor: 'rgba(39,174,96,0.1)' },
  chipText: { color: Colors.textSecondary, fontSize: Typography.sm },
  chipTextGold: { color: Colors.gold, fontWeight: Typography.semibold },
  chipTextGreen: { color: '#27ae60', fontWeight: Typography.semibold },
});

export default function PartnerProfileScreen({ navigation }: Props) {
  const { partnerProfile, setPartnerProfile } = useDateStore();

  const [dietaryNeeds, setDietaryNeeds] = useState<string[]>(partnerProfile.dietaryNeeds || []);
  const [cuisinePrefs, setCuisinePrefs] = useState<string[]>(partnerProfile.cuisinePreferences || []);
  const [activities, setActivities] = useState<string[]>(partnerProfile.activities || []);
  const [accessibility, setAccessibility] = useState<string[]>(partnerProfile.accessibility || []);
  const [personality, setPersonality] = useState<string[]>(partnerProfile.personality || []);
  const [avoid, setAvoid] = useState<string[]>(partnerProfile.avoid || []);

  const tip = getTip('partnerProfile', 'both');

  const toggle = (list: string[], setList: (v: string[]) => void) => (val: string) => {
    setList(list.includes(val) ? list.filter((v) => v !== val) : [...list, val]);
  };

  const handleSave = () => {
    setPartnerProfile({ dietaryNeeds, cuisinePreferences: cuisinePrefs, activities, accessibility, personality, avoid });
    navigation.navigate('WeatherChat');
  };

  return (
    <ScreenContainer>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}><Text style={styles.backText}>← Back</Text></TouchableOpacity>
          <Text style={styles.title}>Your Partner's Vibe</Text>
          <Text style={styles.subtitle}>Set it once, never again</Text>
        </View>

        {/* FOOD SECTION 1 — Dietary Needs */}
        <View style={styles.foodHeader}>
          <Text style={styles.foodSectionTitle}>🍽️ Food & Drinks</Text>
        </View>
        <View style={styles.dietaryBanner}>
          <Text style={styles.dietaryBannerIcon}>🛡️</Text>
          <Text style={styles.dietaryBannerText}>Dietary needs are used as hard filters — only compliant venues will appear</Text>
        </View>
        <ChipSection
          title="Dietary Needs"
          emoji="✅"
          chips={DIETARY_NEEDS}
          selected={dietaryNeeds}
          onToggle={toggle(dietaryNeeds, setDietaryNeeds)}
          green={true}
        />

        <ChipSection
          title="Cuisine Preferences"
          emoji="🌮"
          chips={CUISINE_PREFS}
          selected={cuisinePrefs}
          onToggle={toggle(cuisinePrefs, setCuisinePrefs)}
        />

        <ChipSection
          title="Activities"
          emoji="🎭"
          chips={ACTIVITIES}
          selected={activities}
          onToggle={toggle(activities, setActivities)}
        />

        <ChipSection
          title="Accessibility & Filters"
          emoji="♿"
          chips={ACCESSIBILITY}
          selected={accessibility}
          onToggle={toggle(accessibility, setAccessibility)}
        />

        <ChipSection
          title="Their Personality"
          emoji="💬"
          chips={PERSONALITY}
          selected={personality}
          onToggle={toggle(personality, setPersonality)}
        />

        <ChipSection
          title="Not a Fan Of"
          emoji="❌"
          chips={AVOID}
          selected={avoid}
          onToggle={toggle(avoid, setAvoid)}
        />

        <RomanticTipCard tip={tip} />

        <TouchableOpacity style={styles.saveBtn} onPress={handleSave} activeOpacity={0.88}>
          <Text style={styles.saveBtnText}>Save & Continue →</Text>
        </TouchableOpacity>
        <View style={{ height: Spacing.xxxl }} />
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scrollContent: { paddingBottom: Spacing.xxxl },
  header: { paddingHorizontal: Spacing.screen, paddingTop: Spacing.md, paddingBottom: Spacing.lg },
  backText: { color: Colors.gold, fontSize: Typography.base, marginBottom: Spacing.md },
  title: { fontFamily: Typography.heading, fontSize: Typography.xxl, color: Colors.textPrimary, marginBottom: 4 },
  subtitle: { color: Colors.textSecondary, fontSize: Typography.sm },
  foodHeader: { paddingHorizontal: Spacing.screen, paddingBottom: Spacing.xs },
  foodSectionTitle: { fontFamily: Typography.heading, fontSize: Typography.lg, color: Colors.textPrimary },
  dietaryBanner: {
    flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.sm,
    backgroundColor: 'rgba(39,174,96,0.08)', borderWidth: 1, borderColor: 'rgba(39,174,96,0.25)',
    borderRadius: BorderRadius.md, padding: Spacing.md,
    marginHorizontal: Spacing.screen, marginBottom: Spacing.md,
  },
  dietaryBannerIcon: { fontSize: 16, marginTop: 1 },
  dietaryBannerText: { color: '#27ae60', fontSize: Typography.xs, flex: 1, lineHeight: 18 },
  saveBtn: {
    backgroundColor: Colors.red, borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.lg, alignItems: 'center', marginHorizontal: Spacing.screen,
  },
  saveBtnText: { color: Colors.white, fontSize: Typography.base, fontWeight: Typography.bold },
});
