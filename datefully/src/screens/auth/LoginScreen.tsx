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
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types';
import { useAuthStore, useDateStore } from '../../store';
import { signIn } from '../../lib/supabase';
import { Colors, Typography, Spacing, BorderRadius } from '../../constants/theme';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Login'>;
};

const { width } = Dimensions.get('window');

export default function LoginScreen({ navigation }: Props) {
  const { setAuthenticated } = useAuthStore();
  const { setUserEmail, setUserName } = useDateStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  const handleSignIn = async () => {
    if (!email.trim() || !password) {
      setError('Please enter your email and password.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const { data, error: authError } = await signIn(email.trim(), password);
      if (authError) {
        setError(authError.message || 'Sign in failed. Check your credentials.');
      } else if (data.user) {
        setUserEmail(data.user.email || email);
        setAuthenticated(true, data.user.email);
        navigation.navigate('WhosPlanning');
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

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
          <Text style={styles.heading}>Welcome back</Text>
          <Text style={styles.subheading}>Sign in to your account</Text>

          {/* Form */}
          <View style={styles.form}>
            {/* Email */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={[styles.input, emailFocused && styles.inputFocused]}
                value={email}
                onChangeText={setEmail}
                placeholder="you@example.com"
                placeholderTextColor={Colors.textMuted}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                onFocus={() => setEmailFocused(true)}
                onBlur={() => setEmailFocused(false)}
              />
            </View>

            {/* Password */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <View style={[styles.inputWrapper, passwordFocused && styles.inputFocused]}>
                <TextInput
                  style={styles.inputInner}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Your password"
                  placeholderTextColor={Colors.textMuted}
                  secureTextEntry={!showPassword}
                  onFocus={() => setPasswordFocused(true)}
                  onBlur={() => setPasswordFocused(false)}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword((v) => !v)}
                  style={styles.eyeBtn}
                >
                  <Text style={styles.eyeText}>{showPassword ? '🙈' : '👁'}</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Forgot */}
            <TouchableOpacity style={styles.forgotRow}>
              <Text style={styles.forgotText}>Forgot password?</Text>
            </TouchableOpacity>

            {/* Error */}
            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            {/* Sign In button */}
            <TouchableOpacity
              style={[styles.signInBtn, loading && styles.btnDisabled]}
              onPress={handleSignIn}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading ? (
                <ActivityIndicator color={Colors.white} size="small" />
              ) : (
                <Text style={styles.signInBtnText}>Sign In</Text>
              )}
            </TouchableOpacity>

            {/* Sign up link */}
            <View style={styles.signupRow}>
              <Text style={styles.signupText}>Don't have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
                <Text style={styles.signupLink}>Sign Up</Text>
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
    minHeight: '100%',
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
  forgotRow: { alignSelf: 'flex-end', marginTop: -Spacing.xs },
  forgotText: { color: Colors.gold, fontSize: Typography.sm, fontWeight: Typography.semibold },
  errorText: {
    color: Colors.error,
    fontSize: Typography.sm,
    textAlign: 'center',
    backgroundColor: 'rgba(231,76,60,0.1)',
    borderRadius: BorderRadius.sm,
    padding: Spacing.sm,
  },
  signInBtn: {
    backgroundColor: Colors.red,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.lg,
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  btnDisabled: { opacity: 0.6 },
  signInBtnText: { color: Colors.white, fontSize: Typography.md, fontWeight: Typography.bold, letterSpacing: 0.5 },
  signupRow: { flexDirection: 'row', justifyContent: 'center', paddingTop: Spacing.md },
  signupText: { color: Colors.textSecondary, fontSize: Typography.sm },
  signupLink: { color: Colors.gold, fontSize: Typography.sm, fontWeight: Typography.bold },
});
