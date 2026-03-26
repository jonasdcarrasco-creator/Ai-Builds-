import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Spacing, BorderRadius } from '../../constants';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { useAuthStore } from '../../store';

interface SignupScreenProps {
  navigation: any;
}

const RELATIONSHIP_TYPES = [
  { id: 'single', label: 'Single', emoji: '🦋', desc: 'Flying solo' },
  { id: 'dating', label: 'Dating', emoji: '💑', desc: 'In a relationship' },
  { id: 'married', label: 'Married', emoji: '💍', desc: 'Happily wed' },
  { id: 'friends', label: 'Friends', emoji: '👫', desc: 'Friend dates' },
];

export const SignupScreen: React.FC<SignupScreenProps> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { setUser, setToken } = useAuthStore();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [relationshipType, setRelationshipType] = useState('');
  const [partnerName, setPartnerName] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateStep1 = () => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = 'Name is required';
    if (!email.trim()) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = 'Enter a valid email';
    if (!password) e.password = 'Password is required';
    else if (password.length < 8) e.password = 'Minimum 8 characters';
    if (password !== confirm) e.confirm = 'Passwords do not match';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateStep2 = () => {
    const e: Record<string, string> = {};
    if (!relationshipType) e.relationship = 'Please select a relationship type';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = () => {
    if (validateStep1()) setStep(2);
  };

  const handleCreate = () => {
    if (!validateStep2()) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setToken('mock-token');
      setUser({
        id: '1',
        name,
        email,
        relationshipType: relationshipType as any,
        partnerName: partnerName || undefined,
        location: 'New York, NY',
        preferences: {
          categories: ['romantic', 'foodie'],
          budgetRange: '$$',
          notificationsEnabled: true,
          saveHistory: true,
        },
        createdAt: new Date().toISOString(),
      });
    }, 1500);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <LinearGradient
        colors={['rgba(139,0,0,0.35)', 'transparent']}
        style={styles.topGlow}
      />

      {/* Top bar */}
      <View style={[styles.topBar, { paddingTop: insets.top + 12 }]}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => (step === 1 ? navigation.goBack() : setStep(1))}
        >
          <Ionicons name="arrow-back" size={20} color={Colors.textPrimary} />
        </TouchableOpacity>

        <View style={styles.progressWrap}>
          <View style={styles.progressTrack}>
            <LinearGradient
              colors={['#8B0000', '#D4AF37']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[styles.progressFill, { width: step === 1 ? '50%' : '100%' }]}
            />
          </View>
          <Text style={styles.progressLabel}>Step {step} of 2</Text>
        </View>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 40 }]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Logo */}
          <View style={styles.logoRow}>
            <LinearGradient
              colors={['#8B0000', '#D4AF37']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.logoCircle}
            >
              <Ionicons name="heart" size={22} color="#fff" />
            </LinearGradient>
            <Text style={styles.appName}>datefully</Text>
          </View>

          {step === 1 ? (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Create Account</Text>
              <Text style={styles.cardSub}>Start planning unforgettable moments together</Text>

              <View style={styles.form}>
                <Input
                  label="Full Name"
                  placeholder="Your name"
                  value={name}
                  onChangeText={setName}
                  leftIcon="person-outline"
                  autoCapitalize="words"
                  error={errors.name}
                />
                <Input
                  label="Email"
                  placeholder="your@email.com"
                  value={email}
                  onChangeText={setEmail}
                  leftIcon="mail-outline"
                  keyboardType="email-address"
                  error={errors.email}
                />
                <Input
                  label="Password"
                  placeholder="Minimum 8 characters"
                  value={password}
                  onChangeText={setPassword}
                  leftIcon="lock-closed-outline"
                  secureTextEntry
                  error={errors.password}
                />
                <Input
                  label="Confirm Password"
                  placeholder="Repeat your password"
                  value={confirm}
                  onChangeText={setConfirm}
                  leftIcon="lock-closed-outline"
                  secureTextEntry
                  error={errors.confirm}
                />

                <Button title="Continue" onPress={handleNext} size="lg" />
              </View>
            </View>
          ) : (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>About You</Text>
              <Text style={styles.cardSub}>Personalize your Datefully experience</Text>

              {errors.relationship ? (
                <View style={styles.errorBanner}>
                  <Ionicons name="alert-circle" size={16} color={Colors.error} />
                  <Text style={styles.errorBannerText}>{errors.relationship}</Text>
                </View>
              ) : null}

              <Text style={styles.sectionLabel}>I am currently...</Text>

              <View style={styles.relGrid}>
                {RELATIONSHIP_TYPES.map((rt) => (
                  <TouchableOpacity
                    key={rt.id}
                    style={[
                      styles.relCard,
                      relationshipType === rt.id && styles.relCardActive,
                    ]}
                    onPress={() => setRelationshipType(rt.id)}
                    activeOpacity={0.8}
                  >
                    {relationshipType === rt.id && (
                      <View style={styles.relCheck}>
                        <Ionicons name="checkmark" size={11} color="#0A0A0A" />
                      </View>
                    )}
                    <Text style={styles.relEmoji}>{rt.emoji}</Text>
                    <Text
                      style={[
                        styles.relLabel,
                        relationshipType === rt.id && styles.relLabelActive,
                      ]}
                    >
                      {rt.label}
                    </Text>
                    <Text style={styles.relDesc}>{rt.desc}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {(relationshipType === 'dating' || relationshipType === 'married') && (
                <Input
                  label="Partner's Name"
                  placeholder="Their first name"
                  value={partnerName}
                  onChangeText={setPartnerName}
                  leftIcon="heart-outline"
                  autoCapitalize="words"
                />
              )}

              <Text style={styles.termsText}>
                By creating an account you agree to our{' '}
                <Text style={styles.termsLink}>Terms of Service</Text> and{' '}
                <Text style={styles.termsLink}>Privacy Policy</Text>
              </Text>

              <Button
                title="Create Account"
                onPress={handleCreate}
                loading={loading}
                size="lg"
              />
            </View>
          )}

          <View style={styles.loginRow}>
            <Text style={styles.loginText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.loginLink}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  topGlow: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    height: 200,
    zIndex: 0,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.base,
    paddingBottom: 8,
    gap: 14,
    zIndex: 10,
  },
  backBtn: {
    width: 42, height: 42,
    borderRadius: 21,
    backgroundColor: Colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressWrap: { flex: 1, gap: 5 },
  progressTrack: {
    height: 4,
    backgroundColor: Colors.surfaceAlt,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: { height: '100%', borderRadius: 2 },
  progressLabel: { fontSize: 12, color: Colors.textMuted },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: Spacing['2xl'],
    paddingTop: 16,
    gap: Spacing['2xl'],
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  logoCircle: {
    width: 46, height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
  },
  appName: { fontSize: 28, fontWeight: '800', color: Colors.textPrimary },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius['2xl'],
    padding: Spacing['2xl'],
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    gap: Spacing.lg,
  },
  cardTitle: { fontSize: 26, fontWeight: '800', color: Colors.textPrimary },
  cardSub: { fontSize: 14, color: Colors.textMuted, lineHeight: 20, marginTop: -8 },
  form: { gap: Spacing.base },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(231,76,60,0.1)',
    padding: 12,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(231,76,60,0.3)',
  },
  errorBannerText: { fontSize: 13, color: Colors.error },
  sectionLabel: { fontSize: 15, fontWeight: '700', color: Colors.textSecondary },
  relGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  relCard: {
    width: '47%',
    backgroundColor: Colors.surfaceAlt,
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
    borderWidth: 1.5,
    borderColor: Colors.inputBorder,
    gap: 4,
    position: 'relative',
  },
  relCardActive: {
    borderColor: Colors.primary,
    backgroundColor: 'rgba(212,175,55,0.07)',
  },
  relCheck: {
    position: 'absolute',
    top: 8, right: 8,
    width: 20, height: 20,
    borderRadius: 10,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  relEmoji: { fontSize: 28 },
  relLabel: { fontSize: 15, fontWeight: '700', color: Colors.textSecondary },
  relLabelActive: { color: Colors.primary },
  relDesc: { fontSize: 12, color: Colors.textMuted },
  termsText: { fontSize: 12, color: Colors.textMuted, lineHeight: 18, textAlign: 'center' },
  termsLink: { color: Colors.primary, fontWeight: '600' },
  loginRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  loginText: { fontSize: 14, color: Colors.textMuted },
  loginLink: { fontSize: 14, fontWeight: '700', color: Colors.primary },
});
