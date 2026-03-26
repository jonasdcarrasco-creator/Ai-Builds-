import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Spacing, BorderRadius } from '../../constants';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
}

const SIZE_MAP = {
  sm: { height: 36, px: 16, fontSize: 13 },
  md: { height: 44, px: 20, fontSize: 15 },
  lg: { height: 52, px: 24, fontSize: 16 },
  xl: { height: 60, px: 28, fontSize: 17 },
};

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon,
  iconPosition = 'left',
  fullWidth = true,
}) => {
  const isDisabled = disabled || loading;
  const s = SIZE_MAP[size];

  const content = loading ? (
    <ActivityIndicator
      color={variant === 'primary' ? Colors.black : Colors.primary}
      size="small"
    />
  ) : (
    <View style={styles.row}>
      {icon && iconPosition === 'left' && <View style={styles.iconLeft}>{icon}</View>}
      <Text
        style={[
          styles.text,
          { fontSize: s.fontSize },
          variant === 'primary' && styles.textBlack,
          variant === 'secondary' && styles.textWhite,
          variant === 'outline' && styles.textGold,
          variant === 'danger' && styles.textWhite,
          variant === 'ghost' && styles.textMuted,
        ]}
      >
        {title}
      </Text>
      {icon && iconPosition === 'right' && <View style={styles.iconRight}>{icon}</View>}
    </View>
  );

  if (variant === 'primary') {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={isDisabled}
        style={[styles.wrapper, fullWidth && styles.fullWidth, isDisabled && styles.disabled]}
        activeOpacity={0.85}
      >
        <LinearGradient
          colors={isDisabled ? ['#444', '#333'] : ['#D4AF37', '#B8942A']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.base, { height: s.height, paddingHorizontal: s.px }]}
        >
          {content}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.85}
      style={[
        styles.base,
        { height: s.height, paddingHorizontal: s.px },
        fullWidth && styles.fullWidth,
        isDisabled && styles.disabled,
        variant === 'secondary' && styles.secondary,
        variant === 'outline' && styles.outline,
        variant === 'danger' && styles.danger,
      ]}
    >
      {content}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
  },
  base: {
    borderRadius: BorderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  fullWidth: { width: '100%' },
  disabled: { opacity: 0.5 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  iconLeft: { marginRight: 8 },
  iconRight: { marginLeft: 8 },
  text: { fontWeight: '700', letterSpacing: 0.3 },
  textBlack: { color: '#0A0A0A' },
  textWhite: { color: '#FFFFFF' },
  textGold: { color: Colors.primary },
  textMuted: { color: Colors.textMuted },
  secondary: { backgroundColor: Colors.secondary },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: Colors.primary,
  },
  danger: { backgroundColor: Colors.error },
});
