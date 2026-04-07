import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const COLORS = {
  black: '#000000',
  deepRed: '#C0392B',
  gold: '#C9A84C',
  white: '#FFFFFF',
  darkSurface: '#111111',
};

const WHO_OPTIONS = ['A Man', 'A Woman', 'A Couple', 'Partners', 'Just Exploring'];

const OCCASION_OPTIONS = [
  'Anniversary',
  'First Date',
  'Just Because',
  "Valentine's",
  'Chill at Home',
  'Surprise!',
  'Apology Date',
  'Teen Date',
  'Proposal',
];

interface Props {
  navigation: any;
}

export default function WhosPlanningScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const [selectedWho, setSelectedWho] = useState<string | null>(null);
  const [selectedOccasions, setSelectedOccasions] = useState<string[]>([]);

  const toggleOccasion = (occasion: string) => {
    setSelectedOccasions((prev) =>
      prev.includes(occasion)
        ? prev.filter((o) => o !== occasion)
        : [...prev, occasion]
    );
  };

  const canProceed = selectedWho !== null;

  const handleNext = () => {
    if (!canProceed) return;
    navigation.navigate('Budget', {
      who: selectedWho,
      occasions: selectedOccasions,
    });
  };

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top, paddingBottom: insets.bottom },
      ]}
    >
      {/* Header row */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={22} color={COLORS.white} />
        </TouchableOpacity>

        {/* Progress dots */}
        <View style={styles.progressDots}>
          {Array.from({ length: 9 }).map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                i === 1 ? styles.dotActive : styles.dotInactive,
              ]}
            />
          ))}
        </View>

        {/* Spacer to balance back button */}
        <View style={styles.backButtonSpacer} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Heading */}
        <Text style={styles.heading}>Who's planning the date?</Text>
        <Text style={styles.subtext}>Everyone welcome — any age, any couple</Text>

        {/* I AM section */}
        <Text style={styles.sectionLabel}>I AM</Text>
        <View style={styles.chipRow}>
          {WHO_OPTIONS.map((option) => {
            const active = selectedWho === option;
            return (
              <TouchableOpacity
                key={option}
                onPress={() => setSelectedWho(option)}
                activeOpacity={0.75}
                style={[styles.chip, active ? styles.chipActive : styles.chipInactive]}
              >
                <Text style={[styles.chipText, active ? styles.chipTextActive : styles.chipTextInactive]}>
                  {option}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* THE OCCASION section */}
        <Text style={[styles.sectionLabel, { marginTop: 28 }]}>THE OCCASION</Text>
        <View style={styles.chipRow}>
          {OCCASION_OPTIONS.map((option) => {
            const active = selectedOccasions.includes(option);
            return (
              <TouchableOpacity
                key={option}
                onPress={() => toggleOccasion(option)}
                activeOpacity={0.75}
                style={[styles.chip, active ? styles.chipActive : styles.chipInactive]}
              >
                <Text style={[styles.chipText, active ? styles.chipTextActive : styles.chipTextInactive]}>
                  {option}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* Next button */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom > 0 ? 8 : 24 }]}>
        <TouchableOpacity
          style={[styles.nextButton, !canProceed && styles.nextButtonDisabled]}
          onPress={handleNext}
          activeOpacity={canProceed ? 0.85 : 1}
          disabled={!canProceed}
        >
          <Text style={styles.nextButtonText}>Next</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.black,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
  },
  backButton: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonSpacer: {
    width: 36,
  },
  progressDots: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
  },
  dot: {
    height: 6,
    borderRadius: 3,
  },
  dotActive: {
    width: 20,
    backgroundColor: COLORS.gold,
  },
  dotInactive: {
    width: 6,
    backgroundColor: '#333',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 24,
  },
  heading: {
    fontSize: 26,
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: 8,
  },
  subtext: {
    fontSize: 14,
    color: '#888',
    marginBottom: 28,
  },
  sectionLabel: {
    fontSize: 11,
    color: COLORS.gold,
    fontWeight: '600',
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 20,
    borderWidth: 1.5,
  },
  chipActive: {
    borderColor: COLORS.gold,
    backgroundColor: 'rgba(201,168,76,0.15)',
  },
  chipInactive: {
    borderColor: '#2A2A2A',
    backgroundColor: COLORS.darkSurface,
  },
  chipText: {
    fontSize: 14,
    fontWeight: '500',
  },
  chipTextActive: {
    color: COLORS.gold,
  },
  chipTextInactive: {
    color: '#888',
  },
  bottomBar: {
    paddingHorizontal: 24,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#1A1A1A',
  },
  nextButton: {
    backgroundColor: COLORS.deepRed,
    borderRadius: 28,
    paddingVertical: 17,
    alignItems: 'center',
    width: '100%',
  },
  nextButtonDisabled: {
    opacity: 0.4,
  },
  nextButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 0.3,
  },
});
