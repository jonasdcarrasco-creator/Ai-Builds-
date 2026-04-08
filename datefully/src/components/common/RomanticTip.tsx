import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Typography, Spacing, BorderRadius } from '../../constants/theme';
import { RomanticTip as TipType } from '../../data/romanticTips';

interface Props {
  tip: TipType | null;
  pairedTip?: TipType | null;
}

export default function RomanticTipCard({ tip, pairedTip }: Props) {
  if (!tip) return null;
  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Text style={styles.icon}>💛</Text>
        <View style={styles.textContainer}>
          <Text style={styles.label}>Date Tip</Text>
          <Text style={styles.text}>"{tip.text}"</Text>
        </View>
      </View>
      {pairedTip && (
        <View style={styles.pairedRow}>
          <Text style={styles.pairedText}>"{pairedTip.text}"</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(201,168,76,0.07)',
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: 'rgba(201,168,76,0.2)',
    padding: Spacing.md,
    marginHorizontal: Spacing.screen,
    marginBottom: Spacing.md,
  },
  row: { flexDirection: 'row', gap: Spacing.sm, alignItems: 'flex-start' },
  icon: { fontSize: 18, marginTop: 2 },
  textContainer: { flex: 1, gap: 4 },
  label: {
    color: Colors.gold,
    fontSize: Typography.xs,
    fontWeight: Typography.semibold,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  text: {
    color: Colors.textSecondary,
    fontSize: Typography.sm,
    fontStyle: 'italic',
    lineHeight: 20,
  },
  pairedRow: {
    marginTop: Spacing.sm,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(201,168,76,0.15)',
  },
  pairedText: {
    color: Colors.textMuted,
    fontSize: Typography.xs,
    fontStyle: 'italic',
    lineHeight: 18,
  },
});
