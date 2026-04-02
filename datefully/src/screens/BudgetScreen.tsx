import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  PanResponder,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { useDateStore } from '../store';
import { Colors, Typography, Spacing, BorderRadius } from '../constants/theme';

const { width } = Dimensions.get('window');
const SLIDER_MAX = 500;
const SLIDER_TRACK_WIDTH = width - Spacing.screen * 2 - Spacing.xl * 2;

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Budget'>;
};

const QUICK_PICKS = [
  { label: 'Free', min: 0, max: 0, display: '$0' },
  { label: 'Under $50', min: 0, max: 50, display: '<$50' },
  { label: '$50–$150', min: 50, max: 150, display: '$50-$150' },
  { label: '$150–$300', min: 150, max: 300, display: '$150-$300' },
  { label: '$300+ Splurge', min: 300, max: 500, display: '$300+' },
];

export default function BudgetScreen({ navigation }: Props) {
  const { budget, setBudget } = useDateStore();
  const [currentBudget, setCurrentBudget] = useState(budget);
  const [activeQuick, setActiveQuick] = useState<number | null>(null);
  const [sliderX, setSliderX] = useState(0);

  const updateBudget = useCallback(
    (value: number) => {
      const clamped = Math.max(0, Math.min(SLIDER_MAX, Math.round(value)));
      setCurrentBudget(clamped);
      setActiveQuick(null);
    },
    []
  );

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: (evt) => {
      const x = evt.nativeEvent.locationX;
      const val = (x / SLIDER_TRACK_WIDTH) * SLIDER_MAX;
      updateBudget(val);
      setSliderX(x);
    },
    onPanResponderMove: (evt, gestureState) => {
      const newX = sliderX + gestureState.dx;
      const val = (newX / SLIDER_TRACK_WIDTH) * SLIDER_MAX;
      updateBudget(val);
    },
  });

  const handleQuickPick = (pick: (typeof QUICK_PICKS)[0], idx: number) => {
    const midValue = pick.min === pick.max ? pick.min : Math.round((pick.min + pick.max) / 2);
    const finalVal = pick.max === 500 ? 400 : midValue;
    setCurrentBudget(finalVal);
    setActiveQuick(idx);
  };

  const handleContinue = () => {
    setBudget(currentBudget);
    if (currentBudget < 20) {
      navigation.navigate('BudgetTooLow');
    } else {
      navigation.navigate('PartnerProfile');
    }
  };

  const sliderPercent = Math.min((currentBudget / SLIDER_MAX) * 100, 100);
  const budgetDisplay = currentBudget >= SLIDER_MAX ? '$500+' : `$${currentBudget}`;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>What's your budget?</Text>
        <Text style={styles.subtitle}>We'll plan around what works for you</Text>
      </View>

      {/* Budget display */}
      <View style={styles.budgetDisplay}>
        <Text style={styles.budgetAmount}>{budgetDisplay}</Text>
        <Text style={styles.budgetLabel}>per date</Text>
      </View>

      {/* Slider */}
      <View style={styles.sliderContainer}>
        <View style={styles.sliderTrack} {...panResponder.panHandlers}>
          {/* Filled portion */}
          <View style={[styles.sliderFill, { width: `${sliderPercent}%` }]} />
          {/* Thumb */}
          <View
            style={[
              styles.sliderThumb,
              { left: `${sliderPercent}%`, marginLeft: -14 },
            ]}
          />
        </View>
        <View style={styles.sliderLabels}>
          <Text style={styles.sliderMin}>$0</Text>
          <Text style={styles.sliderMax}>$500+</Text>
        </View>
      </View>

      {/* Quick picks */}
      <View style={styles.quickPicks}>
        <Text style={styles.quickLabel}>Quick pick</Text>
        <View style={styles.quickGrid}>
          {QUICK_PICKS.map((pick, idx) => (
            <TouchableOpacity
              key={pick.label}
              style={[
                styles.quickCard,
                activeQuick === idx && styles.quickCardActive,
              ]}
              onPress={() => handleQuickPick(pick, idx)}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.quickCardText,
                  activeQuick === idx && styles.quickCardTextActive,
                ]}
              >
                {pick.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Continue */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.continueButton}
          onPress={handleContinue}
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
    paddingHorizontal: Spacing.screen,
  },
  header: {
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xl,
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
  },
  budgetDisplay: {
    alignItems: 'center',
    marginBottom: Spacing.xxl,
  },
  budgetAmount: {
    fontFamily: Typography.heading,
    fontSize: 64,
    color: Colors.gold,
    fontWeight: Typography.bold,
  },
  budgetLabel: {
    fontSize: Typography.sm,
    color: Colors.textMuted,
    marginTop: -4,
  },
  sliderContainer: {
    marginBottom: Spacing.xxl,
    paddingHorizontal: Spacing.xl,
  },
  sliderTrack: {
    height: 8,
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.pill,
    overflow: 'visible',
    position: 'relative',
  },
  sliderFill: {
    height: '100%',
    backgroundColor: Colors.gold,
    borderRadius: BorderRadius.pill,
  },
  sliderThumb: {
    position: 'absolute',
    top: -10,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.gold,
    borderWidth: 3,
    borderColor: Colors.background,
    shadowColor: Colors.gold,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 6,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Spacing.md,
  },
  sliderMin: {
    color: Colors.textMuted,
    fontSize: Typography.sm,
  },
  sliderMax: {
    color: Colors.textMuted,
    fontSize: Typography.sm,
  },
  quickPicks: {
    flex: 1,
  },
  quickLabel: {
    fontSize: Typography.sm,
    color: Colors.textSecondary,
    fontWeight: Typography.semibold,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: Spacing.md,
  },
  quickGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  quickCard: {
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
  },
  quickCardActive: {
    borderColor: Colors.gold,
    backgroundColor: 'rgba(201, 168, 76, 0.12)',
  },
  quickCardText: {
    color: Colors.textSecondary,
    fontSize: Typography.sm,
    fontWeight: Typography.medium,
  },
  quickCardTextActive: {
    color: Colors.gold,
    fontWeight: Typography.semibold,
  },
  footer: {
    paddingBottom: Spacing.xl,
    paddingTop: Spacing.md,
  },
  continueButton: {
    backgroundColor: Colors.red,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.lg,
    alignItems: 'center',
  },
  continueText: {
    color: Colors.white,
    fontSize: Typography.md,
    fontWeight: Typography.bold,
    letterSpacing: 0.5,
  },
});
