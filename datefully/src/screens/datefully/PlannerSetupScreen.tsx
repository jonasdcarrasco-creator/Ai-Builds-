import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { DatefullyStackParamList } from '../../types';
import { useDatePlannerStore } from '../../store/datePlannerStore';
import { Chip } from '../../components/common/Chip';
import { Colors } from '../../constants/colors';

type Nav = NativeStackNavigationProp<DatefullyStackParamList, 'PlannerSetup'>;

const PLANNER_TYPES = [
  { label: 'A Man', emoji: '🤵' },
  { label: 'A Woman', emoji: '👗' },
  { label: 'A Couple', emoji: '💑' },
  { label: 'Partners', emoji: '🏳️‍🌈' },
  { label: 'Just Exploring', emoji: '🔍' },
];

const OCCASIONS = [
  { label: 'Anniversary', emoji: '🎂' },
  { label: 'First Date', emoji: '🌹' },
  { label: 'Just Because', emoji: '✨' },
  { label: "Valentine's", emoji: '💝' },
  { label: 'Chill at Home', emoji: '🛋️' },
  { label: 'Surprise', emoji: '🎉' },
  { label: 'Apology Date', emoji: '🙏' },
];

export function PlannerSetupScreen() {
  const navigation = useNavigation<Nav>();
  const { plannerType, occasion, setPlannerType, setOccasion } = useDatePlannerStore();

  const canContinue = !!plannerType && !!occasion;

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.black} />
      <SafeAreaView style={styles.safe}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: '16%' }]} />
          </View>
          <Text style={styles.stepLabel}>Step 1 of 6</Text>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Title */}
          <Text style={styles.title}>Who's planning?</Text>
          <Text style={styles.subtitle}>Tell us a bit about who you are.</Text>

          {/* Planner type chips */}
          <View style={styles.chipsWrap}>
            {PLANNER_TYPES.map((item) => (
              <Chip
                key={item.label}
                label={item.label}
                emoji={item.emoji}
                selected={plannerType === item.label}
                onPress={() => setPlannerType(item.label)}
              />
            ))}
          </View>

          {/* Divider */}
          <View style={styles.sectionDivider} />

          {/* Occasion */}
          <Text style={styles.title}>What's the occasion?</Text>
          <Text style={styles.subtitle}>This helps us tailor the perfect date.</Text>

          <View style={styles.chipsWrap}>
            {OCCASIONS.map((item) => (
              <Chip
                key={item.label}
                label={item.label}
                emoji={item.emoji}
                selected={occasion === item.label}
                onPress={() => setOccasion(item.label)}
              />
            ))}
          </View>

          <View style={{ height: 120 }} />
        </ScrollView>

        {/* Sticky footer */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.continueBtn, !canContinue && styles.continueBtnDisabled]}
            activeOpacity={canContinue ? 0.85 : 1}
            onPress={() => canContinue && navigation.navigate('Budget')}
          >
            <Text style={styles.continueBtnText}>Continue</Text>
            <Ionicons name="arrow-forward" size={18} color={Colors.white} />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.black },
  safe: { flex: 1 },
  header: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 8,
    gap: 6,
  },
  progressBar: {
    height: 3,
    backgroundColor: '#222',
    borderRadius: 2,
  },
  progressFill: {
    height: 3,
    backgroundColor: Colors.gold,
    borderRadius: 2,
  },
  stepLabel: {
    fontSize: 12,
    color: Colors.textDim,
    letterSpacing: 0.5,
  },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 24, paddingTop: 24 },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.white,
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 15,
    color: Colors.textMuted,
    marginBottom: 20,
  },
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  sectionDivider: {
    height: 1,
    backgroundColor: '#1e1e1e',
    marginVertical: 28,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    paddingBottom: 36,
    paddingTop: 16,
    backgroundColor: Colors.black,
    borderTopWidth: 1,
    borderTopColor: '#1a1a1a',
  },
  continueBtn: {
    backgroundColor: Colors.deepRed,
    height: 56,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: Colors.deepRed,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 14,
    elevation: 8,
  },
  continueBtnDisabled: {
    backgroundColor: '#2a2a2a',
    shadowOpacity: 0,
    elevation: 0,
  },
  continueBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.white,
    letterSpacing: 0.4,
  },
});
