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

type NavProp = NativeStackNavigationProp<DatefullyStackParamList, 'WhoPlanning'>;

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

const PLANNERS = ['A Man', 'A Woman', 'A Couple', 'Partners', 'Just Exploring'];
const OCCASIONS = [
  'Anniversary',
  'First Date',
  'Just Because',
  "Valentine's",
  'Chill at Home',
  'Surprise!',
  'Apology Date',
  'Teen Date',
  'Proposal',
];

export default function WhoPlanningScreen() {
  const navigation = useNavigation<NavProp>();
  const { planner, occasion, setPlanner, setOccasion } = useDatefullyStore();

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
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Heading */}
        <View style={styles.headingContainer}>
          <Text style={styles.headingWhite}>Who's planning</Text>
          <Text style={styles.headingGold}>the date?</Text>
        </View>

        {/* Section: I AM */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>I AM</Text>
          <View style={styles.chipsRow}>
            {PLANNERS.map((p) => (
              <Chip
                key={p}
                label={p}
                selected={planner === p}
                onPress={() => setPlanner(p)}
              />
            ))}
          </View>
        </View>

        {/* Section: THE OCCASION */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>THE OCCASION</Text>
          <View style={styles.chipsRow}>
            {OCCASIONS.map((o) => (
              <Chip
                key={o}
                label={o}
                selected={occasion === o}
                onPress={() => setOccasion(o)}
              />
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Bottom */}
      <View style={styles.bottom}>
        <TouchableOpacity
          style={styles.nextButton}
          onPress={() => navigation.navigate('Budget')}
          activeOpacity={0.85}
        >
          <Text style={styles.nextButtonText}>Next →</Text>
        </TouchableOpacity>
        <NavDots total={9} current={1} />
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
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  headingContainer: {
    marginBottom: 28,
  },
  headingWhite: {
    fontSize: 32,
    fontWeight: '800',
    color: '#ffffff',
  },
  headingGold: {
    fontSize: 32,
    fontWeight: '800',
    color: '#c9a84c',
  },
  section: {
    marginBottom: 28,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#c9a84c',
    letterSpacing: 1.5,
    marginBottom: 12,
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
