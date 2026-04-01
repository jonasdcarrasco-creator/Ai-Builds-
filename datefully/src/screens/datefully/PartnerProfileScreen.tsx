import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { DatefullyStackParamList } from '../../navigation/DatefullyNavigator';
import { useDatefullyStore } from '../../stores/datefullyStore';

type NavProp = NativeStackNavigationProp<DatefullyStackParamList, 'PartnerProfile'>;

const NavDots = ({ total, current }: { total: number; current: number }) => (
  <View style={styles.navDotsContainer}>
    {Array.from({ length: total }).map((_, i) => (
      <View
        key={i}
        style={[
          styles.dot,
          {
            width: i === current ? 16 : 6,
            backgroundColor: i === current ? '#c0392b' : '#333',
          },
        ]}
      />
    ))}
  </View>
);

const Chip = ({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) => (
  <TouchableOpacity
    onPress={onPress}
    activeOpacity={0.75}
    style={[
      styles.chip,
      {
        backgroundColor: selected ? '#c0392b' : '#111',
        borderColor: selected ? '#c0392b' : '#555',
      },
    ]}
  >
    <Text
      style={[
        styles.chipText,
        { color: selected ? '#fff' : '#888', fontWeight: selected ? '600' : '400' },
      ]}
    >
      {label}
    </Text>
  </TouchableOpacity>
);

const FOOD_OPTIONS = [
  'Italian', 'Sushi', 'Mexican', 'Steakhouse', 'Vegan',
  'Wine', 'Cocktails', 'Desserts', 'Brunch', 'Seafood', 'Pizza', 'Coffee',
];
const ACTIVITY_OPTIONS = [
  'Live music', 'Dancing', 'Comedy show', 'Movies', 'Art gallery',
  'Escape room', 'Cooking class', 'Karaoke', 'Bowling', 'Theater',
];
const OUTDOOR_OPTIONS = [
  'Sunset walks', 'Hiking', 'Beach', 'Picnic',
  'Rooftop bars', 'Stargazing', 'Bike rides', 'Park visits',
];
const STAY_HOME_OPTIONS = [
  'Cozy movie night', 'Cook together', 'Game night',
  'Spa night', 'Order takeout', 'Dance at home',
];
const PERSONALITY_OPTIONS = [
  'Romantic', 'Loves surprises', 'Shy', 'Adventurous',
  'Outgoing', 'Creative', 'Sporty', 'Laid back',
];
const NOT_FAN_OPTIONS = [
  'Crowds', 'Spicy food', 'Loud bars', 'Horror',
  'Heights', 'Long walks', 'Early mornings',
];
const ACCESSIBILITY_OPTIONS = [
  'Wheelchair friendly', 'No stairs', 'Quiet spaces', 'Pet friendly',
];

export default function PartnerProfileScreen() {
  const navigation = useNavigation<NavProp>();
  const {
    partnerPrefs,
    toggleFoodPref,
    toggleActivityPref,
    toggleOutdoorPref,
    toggleStayHomePref,
    togglePersonalityPref,
    toggleNotFanPref,
    toggleAccessibilityPref,
  } = useDatefullyStore();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={26} color="#ffffff" />
        </TouchableOpacity>
        <View style={styles.autoSaveBadge}>
          <Text style={styles.autoSaveText}>✦ Auto-saved</Text>
        </View>
      </View>

      {/* Scrollable Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Heading */}
        <Text style={styles.heading}>Tell us about your date</Text>

        {/* Section: Food & Drinks */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>🍽 Food & Drinks</Text>
          <View style={styles.chipsRow}>
            {FOOD_OPTIONS.map((item) => (
              <Chip
                key={item}
                label={item}
                selected={partnerPrefs.food.includes(item)}
                onPress={() => toggleFoodPref(item)}
              />
            ))}
          </View>
        </View>

        {/* Section: Activities */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>🎭 Activities</Text>
          <View style={styles.chipsRow}>
            {ACTIVITY_OPTIONS.map((item) => (
              <Chip
                key={item}
                label={item}
                selected={partnerPrefs.activities.includes(item)}
                onPress={() => toggleActivityPref(item)}
              />
            ))}
          </View>
        </View>

        {/* Section: Outdoors */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>🌿 Outdoors</Text>
          <View style={styles.chipsRow}>
            {OUTDOOR_OPTIONS.map((item) => (
              <Chip
                key={item}
                label={item}
                selected={partnerPrefs.outdoors.includes(item)}
                onPress={() => toggleOutdoorPref(item)}
              />
            ))}
          </View>
        </View>

        {/* Section: Stay at Home */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>🏠 Stay at Home</Text>
          <View style={styles.chipsRow}>
            {STAY_HOME_OPTIONS.map((item) => (
              <Chip
                key={item}
                label={item}
                selected={partnerPrefs.stayHome.includes(item)}
                onPress={() => toggleStayHomePref(item)}
              />
            ))}
          </View>
        </View>

        {/* Section: Their Personality */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>💫 Their Personality</Text>
          <View style={styles.chipsRow}>
            {PERSONALITY_OPTIONS.map((item) => (
              <Chip
                key={item}
                label={item}
                selected={partnerPrefs.personality.includes(item)}
                onPress={() => togglePersonalityPref(item)}
              />
            ))}
          </View>
        </View>

        {/* Section: Not a Fan Of */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>🚫 Not a Fan Of</Text>
          <View style={styles.chipsRow}>
            {NOT_FAN_OPTIONS.map((item) => (
              <Chip
                key={item}
                label={item}
                selected={partnerPrefs.notAFan.includes(item)}
                onPress={() => toggleNotFanPref(item)}
              />
            ))}
          </View>
        </View>

        {/* Section: Accessibility */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>♿ Accessibility</Text>
          <View style={styles.chipsRow}>
            {ACCESSIBILITY_OPTIONS.map((item) => (
              <Chip
                key={item}
                label={item}
                selected={partnerPrefs.accessibility.includes(item)}
                onPress={() => toggleAccessibilityPref(item)}
              />
            ))}
          </View>
        </View>

        <View style={{ height: 16 }} />
      </ScrollView>

      {/* Sticky Bottom */}
      <View style={styles.bottom}>
        <TouchableOpacity
          style={styles.nextButton}
          onPress={() => navigation.navigate('AIChat')}
          activeOpacity={0.85}
        >
          <Text style={styles.nextButtonText}>Build My Date →</Text>
        </TouchableOpacity>
        <NavDots total={9} current={3} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  autoSaveBadge: {
    borderWidth: 1,
    borderColor: '#c9a84c',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginRight: 8,
  },
  autoSaveText: {
    color: '#c9a84c',
    fontSize: 11,
    fontWeight: '500',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 8,
  },
  heading: {
    fontSize: 30,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#c9a84c',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    margin: 4,
  },
  chipText: {
    fontSize: 13,
  },
  bottom: {
    paddingHorizontal: 24,
    paddingTop: 8,
    backgroundColor: '#000000',
    borderTopWidth: 1,
    borderTopColor: '#111111',
  },
  nextButton: {
    backgroundColor: '#c0392b',
    height: 56,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  nextButtonText: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '700',
  },
  navDotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    paddingBottom: 20,
  },
  dot: {
    height: 6,
    borderRadius: 3,
  },
});
