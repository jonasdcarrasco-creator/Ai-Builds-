import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types';
import { Colors, Typography, Spacing, BorderRadius } from '../../constants/theme';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'BudgetTooLow'>;
};

export default function BudgetTooLowScreen({ navigation }: Props) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.emoji}>💸</Text>
        <Text style={styles.title}>Budget Too Low for Philadelphia</Text>
        <Text style={styles.message}>
          Philadelphia's date scene is amazing, but we recommend at least $20 to plan a
          meaningful experience. Adjust your budget and we'll find something perfect.
        </Text>
        <View style={styles.tipsBox}>
          <Text style={styles.tipsTitle}>Free date ideas 💡</Text>
          <Text style={styles.tip}>• Explore Rittenhouse Square at sunset</Text>
          <Text style={styles.tip}>• Visit Penn's Landing waterfront</Text>
          <Text style={styles.tip}>• Walk through Old City galleries</Text>
          <Text style={styles.tip}>• Fairmount Park picnic date</Text>
        </View>
        <TouchableOpacity
          style={styles.adjustBtn}
          onPress={() => navigation.navigate('Budget')}
          activeOpacity={0.85}
        >
          <Text style={styles.adjustBtnText}>Adjust Budget</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.continueBtn}
          onPress={() => navigation.navigate('PartnerProfile')}
          activeOpacity={0.7}
        >
          <Text style={styles.continueBtnText}>Continue with $0 budget →</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.screen,
    gap: Spacing.lg,
  },
  emoji: { fontSize: 64 },
  title: {
    fontFamily: Typography.heading,
    fontSize: Typography.xl,
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  message: {
    color: Colors.textSecondary,
    fontSize: Typography.base,
    textAlign: 'center',
    lineHeight: 24,
  },
  tipsBox: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    alignSelf: 'stretch',
    gap: Spacing.xs,
  },
  tipsTitle: {
    color: Colors.gold,
    fontSize: Typography.base,
    fontWeight: Typography.semibold,
    marginBottom: Spacing.xs,
  },
  tip: { color: Colors.textSecondary, fontSize: Typography.sm, lineHeight: 20 },
  adjustBtn: {
    backgroundColor: Colors.red,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.xxxl,
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  adjustBtnText: { color: Colors.white, fontSize: Typography.base, fontWeight: Typography.bold },
  continueBtn: { paddingVertical: Spacing.sm },
  continueBtnText: { color: Colors.textMuted, fontSize: Typography.sm },
});
