import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types';
import { useAuthStore, useDateStore } from '../../store';
import { signUp } from '../../lib/supabase';
import { Colors, Typography, Spacing, BorderRadius } from '../../constants/theme';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Signup'>;
};

export default function SignupScreen({ navigation }: Props) {
  const { setAuthenticated } = useAuthStore();
  const { setUserEmail, setUserName } = useDateStore();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [focusedField, setFocusedField] = useState('');

  const validate = () => {
    if (!name.trim()) return 'Name is required.';
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) return 'Enter a valid email.';
    if (password.length < 8) return 'Password must be at least 8 characters.';
    if (password !== confirmPassword) return 'Passwords do not match.';
    return null;
  };

  const handleSignUp = async () => {
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    setError('');
    setLoading(true);
    try {
      const { data, error: authError } = await signUp(email.trim(), password, name.trim());
      if (authError) {
        setError(authError.message || 'Sign up failed. Please try again.');
      } else if (data.user) {
        setUserEmail(email.trim());
        setUserName(name.trim());
        setAuthenticated(true, email.trim());
        navigation.navigate('WhosPlanning');
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = (field: string) => [
    styles.input,
    focusedField === field && styles.inputFocused,
  ];

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Back */}
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>

          {/* Logo */}
          <View style={styles.logoArea}>
            <Text style={styles.logoText}>Datefully</Text>
            <View style={styles.logoLine} />
          </View>

          {/* Heading */}
          <Text style={styles.heading}>Create your account</Text>
          <Text style={styles.subheading}>Join Datefully and start planning</Text>

          {/* Form */}
          <View style={styles.form}>
            {/* Name */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Full Name</Text>
              <TextInput
                style={inputStyle('name')}
                value={name}
                onChangeText={setName}
                placeholder="Your name"
                placeholderTextColor={Colors.textMuted}
                autoCapitalize="words"
                onFocus={() => setFocusedField('name')}
                onBlur={() => setFocusedField('')}
              />
            </View>

            {/* Email */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={inputStyle('email')}
                value={email}
                onChangeText={setEmail}
                placeholder="you@example.com"
                placeholderTextColor={Colors.textMuted}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                onFocus={() => setFocusedField('email')}
                onBlur={() => setFocusedField('')}
              />
            </View>

            {/* Password */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <View style={[styles.inputWrapper, focusedField === 'password' && styles.inputFocused]}>
                <TextInput
                  style={styles.inputInner}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="At least 8 characters"
                  placeholderTextColor={Colors.textMuted}
                  secureTextEntry={!showPassword}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField('')}
                />
                <TouchableOpacity onPress={() => setShowPassword((v) => !v)} style={styles.eyeBtn}>
                  <Text style={styles.eyeText}>{showPassword ? '🙈' : '👁'}</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Confirm Password */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Confirm Password</Text>
              <TextInput
                style={inputStyle('confirm')}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Repeat your password"
                placeholderTextColor={Colors.textMuted}
                secureTextEntry={!showPassword}
                onFocus={() => setFocusedField('confirm')}
                onBlur={() => setFocusedField('')}
              />
            </View>

            {/* Error */}
            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            {/* Create Account button */}
            <TouchableOpacity
              style={[styles.createBtn, loading && styles.btnDisabled]}
              onPress={handleSignUp}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading ? (
                <ActivityIndicator color={Colors.white} size="small" />
              ) : (
                <Text style={styles.createBtnText}>Create Account</Text>
              )}
            </TouchableOpacity>

            {/* Terms note */}
            <Text style={styles.termsText}>
              By signing up, you agree to our Terms of Service and Privacy Policy.
            </Text>

            {/* Sign in link */}
            <View style={styles.signinRow}>
              <Text style={styles.signinText}>Already have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={styles.signinLink}>Sign In</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  flex: { flex: 1 },
  scrollContent: {
    paddingHorizontal: Spacing.screen,
    paddingBottom: Spacing.xxxl,
  },
  backBtn: { paddingTop: Spacing.md, paddingBottom: Spacing.lg },
  backText: { color: Colors.gold, fontSize: Typography.base },
  logoArea: { alignItems: 'center', marginBottom: Spacing.xxl, marginTop: Spacing.xl },
  logoText: {
    fontFamily: Typography.heading,
    fontSize: Typography.xxxl,
    color: Colors.gold,
    fontStyle: 'italic',
  },
  logoLine: { width: 60, height: 2, backgroundColor: Colors.gold, marginTop: Spacing.xs, opacity: 0.5 },
  heading: {
    fontFamily: Typography.heading,
    fontSize: Typography.xxl,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  subheading: { color: Colors.textSecondary, fontSize: Typography.base, marginBottom: Spacing.xxl },
  form: { gap: Spacing.md },
  inputGroup: { gap: Spacing.xs },
  label: { color: Colors.textSecondary, fontSize: Typography.sm, fontWeight: Typography.semibold },
  input: {
    backgroundColor: Colors.inputBackground,
    borderWidth: 1,
    borderColor: Colors.inputBorder,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    color: Colors.textPrimary,
    fontSize: Typography.base,
  },
  inputFocused: { borderColor: Colors.inputBorderFocus },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.inputBackground,
    borderWidth: 1,
    borderColor: Colors.inputBorder,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
  },
  inputInner: {
    flex: 1,
    paddingVertical: Spacing.md,
    color: Colors.textPrimary,
    fontSize: Typography.base,
  },
  eyeBtn: { padding: Spacing.xs },
  eyeText: { fontSize: 16 },
  errorText: {
    color: Colors.error,
    fontSize: Typography.sm,
    textAlign: 'center',
    backgroundColor: 'rgba(231,76,60,0.1)',
    borderRadius: BorderRadius.sm,
    padding: Spacing.sm,
  },
  createBtn: {
    backgroundColor: Colors.red,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.lg,
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  btnDisabled: { opacity: 0.6 },
  createBtnText: { color: Colors.white, fontSize: Typography.md, fontWeight: Typography.bold, letterSpacing: 0.5 },
  termsText: {
    color: Colors.textMuted,
    fontSize: Typography.xs,
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: Spacing.md,
  },
  signinRow: { flexDirection: 'row', justifyContent: 'center', paddingTop: Spacing.sm },
  signinText: { color: Colors.textSecondary, fontSize: Typography.sm },
  signinLink: { color: Colors.gold, fontSize: Typography.sm, fontWeight: Typography.bold },
});
