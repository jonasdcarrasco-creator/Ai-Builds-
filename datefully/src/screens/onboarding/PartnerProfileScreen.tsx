import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Brand colors
const BLACK = '#000000';
const DEEP_RED = '#C0392B';
const GOLD = '#C9A84C';
const WHITE = '#FFFFFF';
const DARK_SURFACE = '#111111';
const DARK_BORDER = '#2A2A2A';
const TEXT_MUTED = '#888888';

type Section = {
  label: string;
  chips: string[];
};

const SECTIONS: Section[] = [
  {
    label: 'FOOD & DRINKS',
    chips: [
      'Italian', 'Sushi', 'Mexican', 'Steakhouse', 'Vegan', 'Wine',
      'Cocktails', 'Desserts', 'Brunch', 'Seafood', 'Pizza', 'Coffee',
    ],
  },
  {
    label: 'ACTIVITIES',
    chips: [
      'Live music', 'Dancing', 'Comedy show', 'Movies', 'Art gallery',
      'Escape room', 'Cooking class', 'Karaoke', 'Paint & sip', 'Bowling',
      'Mini golf', 'Theater',
    ],
  },
  {
    label: 'OUTDOORS',
    chips: [
      'Sunset walks', 'Hiking', 'Beach', 'Picnic', 'Rooftop bars',
      'Stargazing', 'Bike rides', 'Farmers market', 'Park visits',
    ],
  },
  {
    label: 'STAY AT HOME',
    chips: [
      'Cozy movie night', 'Cook together', 'Game night', 'Spa night',
      'Order takeout', 'Dance at home', 'Binge a show',
    ],
  },
  {
    label: 'THEIR PERSONALITY',
    chips: [
      'Romantic', 'Loves surprises', 'Shy', 'Adventurous', 'Outgoing',
      'Creative', 'Sporty', 'Spiritual', 'Laid back', 'Loves laughing',
    ],
  },
  {
    label: 'NOT A FAN OF',
    chips: [
      'Crowds', 'Spicy food', 'Loud bars', 'Horror', 'Heights',
      'Long walks', 'Seafood', 'Early mornings',
    ],
  },
  {
    label: 'ACCESSIBILITY',
    chips: ['Wheelchair friendly', 'No stairs', 'Quiet spaces', 'Pet friendly'],
  },
];

const DISLIKES_SECTION = 'NOT A FAN OF';

type Props = {
  navigation: any;
};

export default function PartnerProfileScreen({ navigation }: Props) {
  const [selected, setSelected] = useState<Record<string, boolean>>({});

  const toggleChip = (chip: string) => {
    setSelected(prev => ({ ...prev, [chip]: !prev[chip] }));
  };

  const handleBuildDate = () => {
    const likes: string[] = [];
    const dislikes: string[] = [];

    SECTIONS.forEach(section => {
      section.chips.forEach(chip => {
        if (selected[chip]) {
          if (section.label === DISLIKES_SECTION) {
            dislikes.push(chip);
          } else {
            likes.push(chip);
          }
        }
      });
    });

    navigation.navigate('AIChat', { likes, dislikes });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={BLACK} />
      <View style={styles.container}>
        {/* Header Row */}
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={WHITE} />
          </TouchableOpacity>

          {/* Auto-save badge */}
          <View style={styles.autoSaveBadge}>
            <Ionicons name="checkmark-circle" size={12} color={GOLD} style={{ marginRight: 4 }} />
            <Text style={styles.autoSaveText}>Auto-save</Text>
          </View>
        </View>

        {/* Progress Dots */}
        <View style={styles.dotsRow}>
          {Array.from({ length: 9 }).map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                i === 3
                  ? styles.dotActive
                  : styles.dotInactive,
              ]}
            />
          ))}
        </View>

        {/* Heading */}
        <Text style={styles.heading}>Tell us about your date</Text>
        <Text style={styles.subtext}>Saved forever — never fill in again</Text>

        {/* Scrollable Chip Sections */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {SECTIONS.map(section => (
            <View key={section.label} style={styles.section}>
              <Text style={styles.sectionLabel}>{section.label}</Text>
              <View style={styles.chipsRow}>
                {section.chips.map(chip => {
                  const isActive = !!selected[chip];
                  return (
                    <TouchableOpacity
                      key={chip}
                      onPress={() => toggleChip(chip)}
                      style={[
                        styles.chip,
                        isActive ? styles.chipActive : styles.chipInactive,
                      ]}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.chipText, isActive ? styles.chipTextActive : styles.chipTextInactive]}>
                        {chip}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          ))}
          {/* Bottom padding so content clears the fixed button */}
          <View style={{ height: 100 }} />
        </ScrollView>

        {/* Fixed Bottom Button */}
        <View style={styles.bottomBar}>
          <TouchableOpacity style={styles.buildButton} onPress={handleBuildDate} activeOpacity={0.85}>
            <Text style={styles.buildButtonText}>Build My Date</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: BLACK,
  },
  container: {
    flex: 1,
    backgroundColor: BLACK,
    paddingTop: 12,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  backButton: {
    padding: 4,
  },
  autoSaveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: DARK_SURFACE,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: DARK_BORDER,
  },
  autoSaveText: {
    color: GOLD,
    fontSize: 10,
    fontWeight: '600',
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    gap: 6,
  },
  dot: {
    height: 6,
    borderRadius: 3,
  },
  dotActive: {
    width: 20,
    backgroundColor: GOLD,
  },
  dotInactive: {
    width: 6,
    backgroundColor: '#444',
  },
  heading: {
    color: WHITE,
    fontSize: 26,
    fontWeight: 'bold',
    paddingHorizontal: 20,
    marginBottom: 6,
  },
  subtext: {
    color: TEXT_MUTED,
    fontSize: 14,
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionLabel: {
    color: GOLD,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.4,
    marginBottom: 10,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    margin: 4,
  },
  chipActive: {
    backgroundColor: 'rgba(201,168,76,0.15)',
    borderColor: GOLD,
  },
  chipInactive: {
    backgroundColor: DARK_SURFACE,
    borderColor: DARK_BORDER,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '500',
  },
  chipTextActive: {
    color: GOLD,
  },
  chipTextInactive: {
    color: TEXT_MUTED,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: BLACK,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: DARK_BORDER,
  },
  buildButton: {
    backgroundColor: DEEP_RED,
    borderRadius: 28,
    paddingVertical: 16,
    alignItems: 'center',
  },
  buildButtonText: {
    color: WHITE,
    fontSize: 16,
    fontWeight: 'bold',
  },
});
