import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types';
import { Colors, Typography, Spacing, BorderRadius } from '../../constants/theme';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'LocationError'>;
};

export default function LocationErrorScreen({ navigation }: Props) {
  const openSettings = () => {
    Linking.openSettings();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.emoji}>📍</Text>
        <Text style={styles.title}>Location Needed</Text>
        <Text style={styles.message}>
          Datefully uses your location to find the best date spots near you in Philadelphia, PA.
          Please enable location access to continue.
        </Text>
        <TouchableOpacity
          style={styles.enableBtn}
          onPress={openSettings}
          activeOpacity={0.85}
        >
          <Text style={styles.enableBtnText}>Enable Location</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.skipBtn}
          onPress={() => navigation.navigate('WhosPlanning')}
          activeOpacity={0.7}
        >
          <Text style={styles.skipBtnText}>Continue Without Location</Text>
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
  enableBtn: {
    backgroundColor: Colors.red,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.xxxl,
    alignItems: 'center',
    marginTop: Spacing.md,
  },
  enableBtnText: { color: Colors.white, fontSize: Typography.base, fontWeight: Typography.bold },
  skipBtn: { paddingVertical: Spacing.sm },
  skipBtnText: { color: Colors.gold, fontSize: Typography.base },
});
