import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Spacing, BorderRadius } from '../../constants';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { useAuthStore } from '../../store';

interface LoginScreenProps {
  navigation: any;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { setUser, setToken } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const validate = () => {
    const e: typeof errors = {};
    if (!email.trim()) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = 'Enter a valid email';
    if (!password) e.password = 'Password is required';
    else if (password.length < 6) e.password = 'Minimum 6 characters';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleLogin = () => {
    if (!validate()) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setToken('mock-token');
      setUser({
        id: '1',
        name: 'Alex Morgan',
        email,
        relationshipType: 'dating',
        partnerName: 'Jordan',
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

      <TouchableOpacity
        style={[styles.backBtn, { top: insets.top + 14 }]}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back" size={20} color={Colors.textPrimary} />
      </TouchableOpacity>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 40 }]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Logo / Hero */}
          <View style={styles.hero}>
            <LinearGradient
              colors={['#8B0000', '#D4AF37']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.logoCircle}
            >
              <Ionicons name="heart" size={26} color="#fff" />
            </LinearGradient>
            <Text style={styles.appName}>datefully</Text>
            <Text style={styles.tagline}>Welcome back, romanticist</Text>
          </View>

          {/* Card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Sign In</Text>
            <Text style={styles.cardSub}>Continue your journey of unforgettable moments</Text>

            <View style={styles.form}>
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
                placeholder="Enter your password"
                value={password}
                onChangeText={setPassword}
                leftIcon="lock-closed-outline"
                secureTextEntry
                error={errors.password}
              />

              <TouchableOpacity
                onPress={() => Alert.alert('Reset Password', 'Check your inbox for reset instructions.')}
                style={styles.forgotRow}
              >
                <Text style={styles.forgotText}>Forgot Password?</Text>
              </TouchableOpacity>

              <Button title="Sign In" onPress={handleLogin} loading={loading} size="lg" />
            </View>

            <View style={styles.dividerRow}>
              <View style={styles.divLine} />
              <Text style={styles.divLabel}>or continue with</Text>
              <View style={styles.divLine} />
            </View>

            <View style={styles.socialRow}>
              <TouchableOpacity style={styles.socialBtn} activeOpacity={0.8}>
                <Ionicons name="logo-google" size={20} color={Colors.textPrimary} />
                <Text style={styles.socialLabel}>Google</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.socialBtn} activeOpacity={0.8}>
                <Ionicons name="logo-apple" size={20} color={Colors.textPrimary} />
                <Text style={styles.socialLabel}>Apple</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.signupRow}>
            <Text style={styles.signupText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
              <Text style={styles.signupLink}>Create one</Text>
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
    height: 220,
    zIndex: 0,
  },
  backBtn: {
    position: 'absolute',
    left: 20,
    width: 42, height: 42,
    borderRadius: 21,
    backgroundColor: Colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: Spacing['2xl'],
    paddingTop: 72,
    gap: Spacing['2xl'],
  },
  hero: {
    alignItems: 'center',
    gap: 12,
    paddingTop: 20,
  },
  logoCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    alignItems: 'center',
    justifyContent: 'center',
  },
  appName: {
    fontSize: 34,
    fontWeight: '800',
    color: Colors.textPrimary,
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: 14,
    color: Colors.textMuted,
    letterSpacing: 0.5,
    fontStyle: 'italic',
  },
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
  forgotRow: { alignSelf: 'flex-end' },
  forgotText: { fontSize: 13, color: Colors.primary, fontWeight: '600' },
  dividerRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  divLine: { flex: 1, height: 1, backgroundColor: Colors.inputBorder },
  divLabel: { fontSize: 12, color: Colors.textMuted },
  socialRow: { flexDirection: 'row', gap: 12 },
  socialBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 50,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.surfaceAlt,
    borderWidth: 1,
    borderColor: Colors.inputBorder,
  },
  socialLabel: { fontSize: 14, fontWeight: '600', color: Colors.textPrimary },
  signupRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  signupText: { fontSize: 14, color: Colors.textMuted },
  signupLink: { fontSize: 14, fontWeight: '700', color: Colors.primary },
});
