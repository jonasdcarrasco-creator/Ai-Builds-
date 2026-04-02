import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, CoupleType, Occasion } from '../types';
import { useDateStore } from '../store';
import { Colors, Typography, Spacing, BorderRadius } from '../constants/theme';

const { width } = Dimensions.get('window');

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'WhosPlanning'>;
};

const COUPLE_TYPES: { type: CoupleType; label: string; emoji: string }[] = [
  { type: 'couple', label: 'Couple', emoji: '👫' },
  { type: 'two_women', label: 'Two Women', emoji: '👭' },
  { type: 'two_men', label: 'Two Men', emoji: '👬' },
  { type: 'surprise', label: 'Surprise', emoji: '🎉' },
  { type: 'solo', label: 'Solo', emoji: '👤' },
];

const OCCASIONS: Occasion[] = [
  'Anniversary',
  'First Date',
  'Just Because',
  "Valentine's Day",
  'Chill at Home',
  'Surprise',
  'Apology Date',
  'Teen Date',
  'Proposal',
];

export default function WhosPlanning({ navigation }: Props) {
  const { planningFor, occasion, setPlanningFor, setOccasion } = useDateStore();
  const [selectedType, setSelectedType] = useState<CoupleType>(planningFor);
  const [selectedOccasion, setSelectedOccasion] = useState<Occasion | null>(occasion);

  const handleContinue = () => {
    setPlanningFor(selectedType);
    if (selectedOccasion) setOccasion(selectedOccasion);
    navigation.navigate('Budget');
  };

  const canContinue = selectedOccasion !== null;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Who's Planning?</Text>
          <Text style={styles.subtitle}>Tell us about you two</Text>
        </View>

        {/* Couple type chips */}
        <View style={styles.section}>
          <View style={styles.chipRow}>
            {COUPLE_TYPES.map((item) => {
              const isSelected = selectedType === item.type;
              return (
                <TouchableOpacity
                  key={item.type}
                  style={[styles.coupleChip, isSelected && styles.chipSelected]}
                  onPress={() => setSelectedType(item.type)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.chipEmoji}>{item.emoji}</Text>
                  <Text style={[styles.chipLabel, isSelected && styles.chipLabelSelected]}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Occasion */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>What's the occasion?</Text>
          <View style={styles.occasionGrid}>
            {OCCASIONS.map((occ) => {
              const isSelected = selectedOccasion === occ;
              return (
                <TouchableOpacity
                  key={occ}
                  style={[styles.occasionChip, isSelected && styles.chipSelected]}
                  onPress={() => setSelectedOccasion(occ)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.occasionLabel, isSelected && styles.chipLabelSelected]}>
                    {occ}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </ScrollView>

      {/* Continue button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.continueButton, !canContinue && styles.buttonDisabled]}
          onPress={handleContinue}
          disabled={!canContinue}
          activeOpacity={0.85}
        >
          <Text style={styles.continueText}>Continue</Text>
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
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.xxl,
  },
  title: {
    fontFamily: Typography.heading,
    fontSize: Typography.xxxl,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: Typography.base,
    color: Colors.textSecondary,
  },
  section: {
    marginBottom: Spacing.xxl,
  },
  sectionTitle: {
    fontSize: Typography.md,
    color: Colors.textPrimary,
    fontWeight: Typography.semibold,
    marginBottom: Spacing.md,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  coupleChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    borderRadius: BorderRadius.pill,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
  },
  chipSelected: {
    borderColor: Colors.gold,
    backgroundColor: 'rgba(201, 168, 76, 0.12)',
  },
  chipEmoji: {
    fontSize: 16,
  },
  chipLabel: {
    color: Colors.textSecondary,
    fontSize: Typography.sm,
    fontWeight: Typography.medium,
  },
  chipLabelSelected: {
    color: Colors.gold,
    fontWeight: Typography.semibold,
  },
  occasionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  occasionChip: {
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    borderRadius: BorderRadius.pill,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
  },
  occasionLabel: {
    color: Colors.textSecondary,
    fontSize: Typography.sm,
    fontWeight: Typography.medium,
  },
  footer: {
    paddingHorizontal: Spacing.screen,
    paddingBottom: Spacing.xl,
    paddingTop: Spacing.md,
    backgroundColor: Colors.background,
    borderTopWidth: 1,
    borderTopColor: Colors.cardBorder,
  },
  continueButton: {
    backgroundColor: Colors.red,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.lg,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.45,
  },
  continueText: {
    color: Colors.white,
    fontSize: Typography.md,
    fontWeight: Typography.bold,
    letterSpacing: 0.5,
  },
});
