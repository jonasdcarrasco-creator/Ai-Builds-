import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { Colors } from '../../constants/colors';

interface ChipProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  style?: ViewStyle;
  textStyle?: TextStyle;
  emoji?: string;
}

export function Chip({ label, selected = false, onPress, style, textStyle, emoji }: ChipProps) {
  return (
    <TouchableOpacity
      activeOpacity={0.75}
      onPress={onPress}
      style={[styles.chip, selected && styles.chipSelected, style]}
    >
      {emoji ? (
        <Text style={[styles.label, selected && styles.labelSelected, textStyle]}>
          {emoji} {label}
        </Text>
      ) : (
        <Text style={[styles.label, selected && styles.labelSelected, textStyle]}>
          {label}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 100,
    borderWidth: 1.5,
    borderColor: Colors.chipBorder,
    backgroundColor: 'transparent',
    margin: 4,
  },
  chipSelected: {
    borderColor: Colors.gold,
    backgroundColor: Colors.chipBgSelected,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textMuted,
    letterSpacing: 0.2,
  },
  labelSelected: {
    color: Colors.gold,
    fontWeight: '700',
  },
});
