import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Animated,
  Linking,
  ScrollView,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { DatefullyStackParamList } from '../../navigation/DatefullyNavigator';
import { useDatefullyStore } from '../../stores/datefullyStore';

const GOLD = '#c9a84c';
const RED = '#c0392b';
const GREEN = '#27ae60';

type Nav = NativeStackNavigationProp<DatefullyStackParamList, 'Confirmation'>;

// ── animated floating pin ────────────────────────────────────────────────
const FloatingPin = () => {
  const floatAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, { toValue: 1, duration: 1200, useNativeDriver: true }),
        Animated.timing(floatAnim, { toValue: 0, duration: 1200, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const translateY = floatAnim.interpolate({ inputRange: [0, 1], outputRange: [0, -12] });

  return (
    <Animated.View style={[styles.pinContainer, { transform: [{ translateY }] }]}>
      <Text style={styles.sparkleLeft}>✨</Text>
      <View style={styles.pinBubble}>
        <Text style={styles.pinHeart}>❤️</Text>
        <Text style={styles.pinIcon}>📍</Text>
      </View>
      <Text style={styles.sparkleRight}>✨</Text>
    </Animated.View>
  );
};

// ── nav dots ─────────────────────────────────────────────────────────────
const NavDots = ({ total, current }: { total: number; current: number }) => (
  <View style={styles.dots}>
    {Array.from({ length: total }).map((_, i) => (
      <View key={i} style={[styles.dot, { width: i === current ? 16 : 6, backgroundColor: i === current ? RED : '#333' }]} />
    ))}
  </View>
);

// ── transport button ──────────────────────────────────────────────────────
const TransportBtn = ({ icon, label, onPress }: { icon: string; label: string; onPress: () => void }) => (
  <TouchableOpacity style={styles.transportBtn} onPress={onPress} activeOpacity={0.75}>
    <Text style={styles.transportIcon}>{icon}</Text>
    <Text style={styles.transportLabel}>{label}</Text>
  </TouchableOpacity>
);

export default function ConfirmationScreen() {
  const navigation = useNavigation<Nav>();
  const { selectedVendors, invitationSent, dateRating, setDateRating, reset } = useDatefullyStore();
  const hasVendors = selectedVendors.length > 0;
  const [ratingMsg, setRatingMsg] = useState('');

  const handleRating = (star: number) => {
    setDateRating(star);
    setRatingMsg(star >= 5 ? "You're a 5-star planner! 💛" : star >= 4 ? 'Amazing — almost perfect! ✨' : star >= 3 ? 'Good times ahead! 🌟' : 'We\'ll do better next time 💪');
  };

  const openApp = (url: string, friendlyName: string) => {
    Linking.canOpenURL(url)
      .then((supported) => {
        if (supported) {
          Linking.openURL(url);
        } else {
          Alert.alert('Datefully', `Opening ${friendlyName}...`, [{ text: 'OK' }]);
        }
      })
      .catch(() => {
        Alert.alert('Datefully', `Opening ${friendlyName}...`, [{ text: 'OK' }]);
      });
  };

  const handlePlanAnother = () => {
    reset();
    navigation.navigate('Splash');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* animated pin */}
        <FloatingPin />

        {/* heading */}
        <Text style={styles.heading}>
          You're all set<Text style={{ color: GOLD }}>!</Text>
        </Text>

        {/* summary card */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Your Date</Text>
          <Text style={styles.summaryTime}>Saturday • 6:00 PM</Text>
          <Text style={styles.summaryCity}>📍 Philadelphia, PA</Text>
        </View>

        {/* checklist */}
        <View style={styles.checklist}>
          <View style={styles.checkRow}>
            <Text style={styles.checkIcon}>✅</Text>
            <Text style={[styles.checkText, { color: GOLD }]}>Confirmation email sent</Text>
          </View>
          <View style={styles.checkRow}>
            <Text style={styles.checkIcon}>✅</Text>
            <Text style={[styles.checkText, { color: GREEN }]}>Added to calendar</Text>
          </View>
          {invitationSent && (
            <View style={styles.checkRow}>
              <Text style={styles.checkIcon}>💌</Text>
              <Text style={[styles.checkText, { color: GOLD }]}>Invitation card sent</Text>
            </View>
          )}
          {hasVendors && (
            <View style={styles.checkRow}>
              <Text style={styles.checkIcon}>🎁</Text>
              <Text style={[styles.checkText, { color: RED }]}>Vendor extras confirmed</Text>
            </View>
          )}
        </View>

        <Text style={styles.focusText}>we got you — focus on the moment ✦</Text>

        {/* GET THERE */}
        <Text style={styles.sectionLabel}>GET THERE</Text>
        <View style={styles.transportRow}>
          <TransportBtn icon="🚶" label="Walk" onPress={() => Alert.alert('Datefully', 'Walking directions opening...')} />
          <TransportBtn icon="🚗" label="Uber" onPress={() => openApp('uber://', 'Uber')} />
          <TransportBtn icon="🚕" label="Lyft" onPress={() => openApp('lyft://', 'Lyft')} />
          <TransportBtn icon="🚖" label="Taxi" onPress={() => Alert.alert('Datefully', 'Opening taxi options...')} />
          <TransportBtn icon="🚇" label="Transit" onPress={() => Alert.alert('Datefully', 'Opening transit options...')} />
        </View>

        {/* rate your date */}
        <View style={styles.ratingSection}>
          <Text style={styles.ratingTitle}>Rate Your Date</Text>
          <View style={styles.starsRow}>
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity key={star} onPress={() => handleRating(star)} activeOpacity={0.7}>
                <Text style={[styles.star, { color: dateRating >= star ? GOLD : '#333' }]}>★</Text>
              </TouchableOpacity>
            ))}
          </View>
          {ratingMsg ? <Text style={styles.ratingMsg}>{ratingMsg}</Text> : null}
        </View>

        {/* plan another */}
        <TouchableOpacity style={styles.planAnotherBtn} onPress={handlePlanAnother} activeOpacity={0.7}>
          <Text style={styles.planAnotherText}>Plan Another Date →</Text>
        </TouchableOpacity>

        <View style={{ height: 10 }} />
      </ScrollView>

      <NavDots total={9} current={8} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  scroll: { paddingHorizontal: 24, paddingTop: 20, paddingBottom: 10, alignItems: 'center' },
  pinContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  pinBubble: { alignItems: 'center', justifyContent: 'center', width: 64, height: 64 },
  pinHeart: { fontSize: 20, position: 'absolute', top: 6 },
  pinIcon: { fontSize: 52 },
  sparkleLeft: { fontSize: 22, marginRight: 8, marginTop: -16 },
  sparkleRight: { fontSize: 22, marginLeft: 8, marginTop: -16 },
  heading: { color: '#fff', fontSize: 30, fontWeight: '800', textAlign: 'center', marginBottom: 24 },
  summaryCard: {
    backgroundColor: '#1a0505',
    borderRadius: 14,
    paddingHorizontal: 28,
    paddingVertical: 20,
    alignItems: 'center',
    width: '100%',
    marginBottom: 24,
  },
  summaryTitle: { color: GOLD, fontSize: 13, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 },
  summaryTime: { color: '#fff', fontSize: 20, fontWeight: '700', marginBottom: 6 },
  summaryCity: { color: GOLD, fontSize: 14 },
  checklist: { alignSelf: 'stretch', marginBottom: 16 },
  checkRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  checkIcon: { fontSize: 18, marginRight: 12 },
  checkText: { fontSize: 15, fontWeight: '500' },
  focusText: { color: GOLD, fontSize: 13, fontStyle: 'italic', marginBottom: 28 },
  sectionLabel: { color: '#fff', fontSize: 13, fontWeight: '700', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 14, alignSelf: 'flex-start' },
  transportRow: { flexDirection: 'row', justifyContent: 'center', gap: 8, width: '100%', marginBottom: 28 },
  transportBtn: {
    flex: 1,
    backgroundColor: '#111',
    borderWidth: 1,
    borderColor: GOLD,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  transportIcon: { fontSize: 18, marginBottom: 4 },
  transportLabel: { color: '#fff', fontSize: 11, fontWeight: '600' },
  ratingSection: { alignItems: 'center', marginBottom: 24, width: '100%' },
  ratingTitle: { color: '#fff', fontSize: 16, fontWeight: '700', marginBottom: 12 },
  starsRow: { flexDirection: 'row', gap: 8 },
  star: { fontSize: 38 },
  ratingMsg: { color: GOLD, fontSize: 14, marginTop: 12, fontStyle: 'italic', textAlign: 'center' },
  planAnotherBtn: { paddingVertical: 14 },
  planAnotherText: { color: GOLD, fontSize: 15, fontWeight: '600' },
  dots: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6, paddingBottom: 16 },
  dot: { height: 6, borderRadius: 3 },
});
