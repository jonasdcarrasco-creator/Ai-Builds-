import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius } from '../../constants';
import { RELATIONSHIP_TYPES } from '../../constants';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { useAuthStore } from '../../store';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface SignupScreenProps {
  navigation: any;
}

export const SignupScreen: React.FC<SignupScreenProps> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [relationshipType, setRelationshipType] = useState('');
  const [partnerName, setPartnerName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { setUser } = useAuthStore();

  const validateStep1 = () => {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = 'Name is required';
    if (!email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Invalid email address';
    if (!password) newErrors.password = 'Password is required';
    else if (password.length < 8) newErrors.password = 'Minimum 8 characters required';
    if (password !== confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    }
  };

  const handleSignup = async () => {
    if (!relationshipType) {
      setErrors({ relationshipType: 'Please select a relationship type' });
      return;
    }
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1200));
    setUser({
      id: Date.now().toString(),
      name: name.trim(),
      email,
      relationshipType: relationshipType as any,
      partnerName: partnerName || undefined,
      preferences: {
        categories: ['romantic', 'foodie'],
        budgetRange: 'moderate',
        notificationsEnabled: true,
        saveHistory: true,
      },
      createdAt: new Date().toISOString(),
    });
    setLoading(false);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <LinearGradient
        colors={['#9B59B6', '#6C3483']}
        style={[styles.header, { paddingTop: insets.top + Spacing.base }]}
      >
        <TouchableOpacity style={styles.backBtn} onPress={() => {
          if (step === 2) setStep(1);
          else navigation.goBack();
        }}>
          <Ionicons name="chevron-back" size={24} color={Colors.white} />
        </TouchableOpacity>

        <View style={styles.headerContent}>
          <Text style={styles.headerEmoji}>✨</Text>
          <Text style={styles.headerTitle}>
            {step === 1 ? 'Create Account' : 'About You'}
          </Text>
          <Text style={styles.headerSubtitle}>
            {step === 1
              ? 'Join thousands planning perfect dates'
              : 'Help us personalize your experience'}
          </Text>
        </View>

        {/* Progress */}
        <View style={styles.progressRow}>
          {[1, 2].map((s) => (
            <View
              key={s}
              style={[
                styles.progressBar,
                { flex: 1, opacity: s <= step ? 1 : 0.4 },
              ]}
            />
          ))}
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + Spacing['2xl'] }
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {step === 1 ? (
          <View style={styles.form}>
            <Input
              label="Full Name"
              placeholder="Your first & last name"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
              leftIcon="person-outline"
              error={errors.name}
              required
            />
            <Input
              label="Email Address"
              placeholder="you@example.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              leftIcon="mail-outline"
              error={errors.email}
              required
            />
            <Input
              label="Password"
              placeholder="Minimum 8 characters"
              value={password}
              onChangeText={setPassword}
              isPassword
              leftIcon="lock-closed-outline"
              error={errors.password}
              required
            />
            <Input
              label="Confirm Password"
              placeholder="Repeat your password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              isPassword
              leftIcon="lock-closed-outline"
              error={errors.confirmPassword}
              required
            />

            <Button title="Continue" onPress={handleNext} size="lg" />

            <TouchableOpacity
              style={styles.signInRow}
              onPress={() => navigation.navigate('Login')}
            >
              <Text style={styles.signInText}>Already have an account? </Text>
              <Text style={styles.signInLink}>Sign In</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.form}>
            <Text style={styles.sectionTitle}>Relationship Status</Text>
            <Text style={styles.sectionSubtitle}>
              This helps us suggest the right date ideas for you.
            </Text>

            <View style={styles.relationshipGrid}>
              {RELATIONSHIP_TYPES.map((type) => (
                <TouchableOpacity
                  key={type.id}
                  style={[
                    styles.relationshipCard,
                    relationshipType === type.id && styles.relationshipCardActive,
                  ]}
                  onPress={() => setRelationshipType(type.id)}
                >
                  <Text style={styles.relationshipEmoji}>{type.emoji}</Text>
                  <Text style={[
                    styles.relationshipLabel,
                    relationshipType === type.id && styles.relationshipLabelActive,
                  ]}>
                    {type.label}
                  </Text>
                  {relationshipType === type.id && (
                    <View style={styles.selectedCheck}>
                      <Ionicons name="checkmark-circle" size={16} color={Colors.primary} />
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>

            {errors.relationshipType && (
              <Text style={styles.errorText}>{errors.relationshipType}</Text>
            )}

            {(relationshipType === 'dating' || relationshipType === 'married') && (
              <Input
                label="Partner's Name (optional)"
                placeholder="What should we call them?"
                value={partnerName}
                onChangeText={setPartnerName}
                leftIcon="heart-outline"
              />
            )}

            <View style={styles.termsRow}>
              <Text style={styles.termsText}>
                By creating an account, you agree to our{' '}
                <Text style={styles.termsLink}>Terms of Service</Text>
                {' '}and{' '}
                <Text style={styles.termsLink}>Privacy Policy</Text>.
              </Text>
            </View>

            <Button
              title={loading ? 'Creating your account...' : 'Create Account 💕'}
              onPress={handleSignup}
              loading={loading}
              size="lg"
            />
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: Spacing.base,
    paddingBottom: Spacing['2xl'],
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.base,
  },
  headerContent: {
    alignItems: 'center',
    gap: 8,
    marginBottom: Spacing.xl,
  },
  headerEmoji: {
    fontSize: 40,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.white,
  },
  headerSubtitle: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
  },
  progressRow: {
    flexDirection: 'row',
    gap: 8,
  },
  progressBar: {
    height: 4,
    backgroundColor: Colors.white,
    borderRadius: 2,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing['2xl'],
  },
  form: {
    gap: 4,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: Spacing.lg,
    lineHeight: 20,
  },
  relationshipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: Spacing.base,
  },
  relationshipCard: {
    width: '47%',
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl,
    padding: Spacing.base,
    alignItems: 'center',
    gap: 8,
    borderWidth: 2,
    borderColor: Colors.gray200,
    position: 'relative',
  },
  relationshipCardActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.surfaceAlt,
  },
  relationshipEmoji: {
    fontSize: 28,
  },
  relationshipLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  relationshipLabelActive: {
    color: Colors.primary,
  },
  selectedCheck: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  errorText: {
    fontSize: 12,
    color: Colors.error,
    marginTop: -8,
    marginBottom: Spacing.sm,
  },
  termsRow: {
    marginVertical: Spacing.base,
  },
  termsText: {
    fontSize: 13,
    color: Colors.textMuted,
    lineHeight: 20,
    textAlign: 'center',
  },
  termsLink: {
    color: Colors.primary,
    fontWeight: '600',
  },
  signInRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.lg,
  },
  signInText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  signInLink: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.primary,
  },
});
