import React from 'react';
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

type Nav = NativeStackNavigationProp<DatefullyStackParamList, 'PartnerProfile'>;

const LOVE_CHIPS = [
  { label: 'Fine Dining', emoji: '🍽️' },
  { label: 'Outdoors', emoji: '🌿' },
  { label: 'Art & Culture', emoji: '🎭' },
  { label: 'Movies', emoji: '🎬' },
  { label: 'Music', emoji: '🎵' },
  { label: 'Spa & Wellness', emoji: '💆' },
  { label: 'Adventure', emoji: '🧗' },
  { label: 'Cozy Nights', emoji: '🛋️' },
  { label: 'Dancing', emoji: '💃' },
  { label: 'Cooking', emoji: '🍳' },
  { label: 'Sports', emoji: '⚽' },
  { label: 'Shopping', emoji: '🛍️' },
];

const DISLIKE_CHIPS = [
  { label: 'Loud Crowds', emoji: '📢' },
  { label: 'Spicy Food', emoji: '🌶️' },
  { label: 'Long Lines', emoji: '⏳' },
  { label: 'Heights', emoji: '🏔️' },
  { label: 'Cold Weather', emoji: '🥶' },
  { label: 'Seafood', emoji: '🦞' },
  { label: 'Outdoor Bugs', emoji: '🦟' },
  { label: 'Fast Pace', emoji: '⚡' },
];

const VIBE_CHIPS = [
  { label: 'Romantic', emoji: '🌹' },
  { label: 'Fun & Playful', emoji: '🎈' },
  { label: 'Chill & Cozy', emoji: '☕' },
  { label: 'Adventurous', emoji: '🚀' },
  { label: 'Elegant', emoji: '✨' },
  { label: 'Spontaneous', emoji: '⚡' },
];

export function PartnerProfileScreen() {
  const navigation = useNavigation<Nav>();
  const { loveChips, dislikeChips, vibeChips, toggleLoveChip, toggleDislikeChip, toggleVibeChip } =
    useDatePlannerStore();

  const canContinue = vibeChips.length > 0;

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.black} />
      <SafeAreaView style={styles.safe}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color={Colors.white} />
          </TouchableOpacity>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: '50%' }]} />
          </View>
          <Text style={styles.stepLabel}>Step 3 of 6</Text>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.title}>Partner Profile</Text>
          <Text style={styles.subtitle}>Help us understand what makes this night perfect.</Text>

          {/* What they love */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionIcon}>💛</Text>
              <Text style={styles.sectionTitle}>What do they love?</Text>
            </View>
            <View style={styles.chipsWrap}>
              {LOVE_CHIPS.map((item) => (
                <Chip
                  key={item.label}
                  label={item.label}
                  emoji={item.emoji}
                  selected={loveChips.includes(item.label)}
                  onPress={() => toggleLoveChip(item.label)}
                />
              ))}
            </View>
          </View>

          <View style={styles.sectionDivider} />

          {/* What they dislike */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionIcon}>🚫</Text>
              <Text style={styles.sectionTitle}>What don't they like?</Text>
            </View>
            <View style={styles.chipsWrap}>
              {DISLIKE_CHIPS.map((item) => (
                <Chip
                  key={item.label}
                  label={item.label}
                  emoji={item.emoji}
                  selected={dislikeChips.includes(item.label)}
                  onPress={() => toggleDislikeChip(item.label)}
                />
              ))}
            </View>
          </View>

          <View style={styles.sectionDivider} />

          {/* Tonight's vibe */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionIcon}>🎭</Text>
              <Text style={styles.sectionTitle}>Tonight's vibe?</Text>
            </View>
            <Text style={styles.vibeHint}>Pick at least one to continue</Text>
            <View style={styles.chipsWrap}>
              {VIBE_CHIPS.map((item) => (
                <Chip
                  key={item.label}
                  label={item.label}
                  emoji={item.emoji}
                  selected={vibeChips.includes(item.label)}
                  onPress={() => toggleVibeChip(item.label)}
                />
              ))}
            </View>
          </View>

          <View style={{ height: 120 }} />
        </ScrollView>

        {/* Footer */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.continueBtn, !canContinue && styles.continueBtnDisabled]}
            activeOpacity={canContinue ? 0.85 : 1}
            onPress={() => canContinue && navigation.navigate('Results')}
          >
            <Text style={styles.continueBtnText}>Find My Dates</Text>
            <Ionicons name="sparkles" size={18} color={Colors.white} />
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
  backBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  progressBar: { height: 3, backgroundColor: '#222', borderRadius: 2 },
  progressFill: { height: 3, backgroundColor: Colors.gold, borderRadius: 2 },
  stepLabel: { fontSize: 12, color: Colors.textDim, letterSpacing: 0.5 },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 24, paddingTop: 24 },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.white,
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  subtitle: { fontSize: 15, color: Colors.textMuted, marginBottom: 28 },
  section: { gap: 12 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sectionIcon: { fontSize: 20 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: Colors.white },
  chipsWrap: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -4 },
  sectionDivider: { height: 1, backgroundColor: '#1e1e1e', marginVertical: 24 },
  vibeHint: { fontSize: 13, color: Colors.textDim, marginTop: -4 },
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
