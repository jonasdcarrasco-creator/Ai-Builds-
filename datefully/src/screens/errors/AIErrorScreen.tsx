import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types';
import { Colors, Typography, Spacing, BorderRadius } from '../../constants/theme';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'AIError'>;
};

export default function AIErrorScreen({ navigation }: Props) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.emoji}>🤖</Text>
        <Text style={styles.title}>Our AI is taking a break</Text>
        <Text style={styles.message}>
          The AI concierge is temporarily unavailable. Please check your connection and try again.
        </Text>
        <TouchableOpacity
          style={styles.retryBtn}
          onPress={() => navigation.navigate('AIChat')}
          activeOpacity={0.85}
        >
          <Text style={styles.retryBtnText}>Try Again</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.navigate('PartnerProfile')}
          activeOpacity={0.7}
        >
          <Text style={styles.backBtnText}>← Go Back</Text>
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
    fontSize: Typography.xxl,
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  message: {
    color: Colors.textSecondary,
    fontSize: Typography.base,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: Spacing.xl,
  },
  retryBtn: {
    backgroundColor: Colors.red,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.xxxl,
    alignItems: 'center',
    marginTop: Spacing.md,
  },
  retryBtnText: { color: Colors.white, fontSize: Typography.base, fontWeight: Typography.bold },
  backBtn: { paddingVertical: Spacing.sm },
  backBtnText: { color: Colors.gold, fontSize: Typography.base },
});
