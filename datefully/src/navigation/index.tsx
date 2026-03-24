import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { Colors, Spacing, BorderRadius, Shadow } from '../constants';
import { useAuthStore } from '../store';

// Auth Screens
import { WelcomeScreen } from '../screens/auth/WelcomeScreen';
import { LoginScreen } from '../screens/auth/LoginScreen';
import { SignupScreen } from '../screens/auth/SignupScreen';

// Main Screens
import { HomeScreen } from '../screens/home/HomeScreen';
import { DateIdeaDetailScreen } from '../screens/home/DateIdeaDetailScreen';
import { ExploreScreen } from '../screens/explore/ExploreScreen';
import { PlanScreen } from '../screens/plan/PlanScreen';
import { ReservationsScreen } from '../screens/reservations/ReservationsScreen';
import { RestaurantDetailScreen } from '../screens/reservations/RestaurantDetailScreen';
import { ReservationConfirmationScreen } from '../screens/reservations/ReservationConfirmationScreen';
import { ProfileScreen } from '../screens/profile/ProfileScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const HomeStack = createNativeStackNavigator();
const ExploreStack = createNativeStackNavigator();
const ReservationsStack = createNativeStackNavigator();

const TAB_CONFIG = [
  { name: 'HomeTab', label: 'Home', icon: 'home', iconOutline: 'home-outline' },
  { name: 'ExploreTab', label: 'Explore', icon: 'compass', iconOutline: 'compass-outline' },
  { name: 'Plan', label: 'Plan', icon: 'calendar', iconOutline: 'calendar-outline', center: true },
  { name: 'ReservationsTab', label: 'Reserve', icon: 'restaurant', iconOutline: 'restaurant-outline' },
  { name: 'Profile', label: 'You', icon: 'person', iconOutline: 'person-outline' },
];

const CustomTabBar = ({ state, descriptors, navigation }: any) => {
  return (
    <View style={tabStyles.container}>
      <View style={tabStyles.tabBar}>
        {state.routes.map((route: any, index: number) => {
          const { options } = descriptors[route.key];
          const config = TAB_CONFIG.find((t) => t.name === route.name);
          const isFocused = state.index === index;
          const isCenter = config?.center;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });
            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          if (isCenter) {
            return (
              <TouchableOpacity key={route.key} onPress={onPress} style={tabStyles.centerTab}>
                <LinearGradient
                  colors={isFocused ? ['#FF6B9D', '#E85585'] : ['#9B59B6', '#6C3483']}
                  style={tabStyles.centerButton}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Ionicons
                    name={(isFocused ? config?.icon : config?.iconOutline) as any}
                    size={24}
                    color={Colors.white}
                  />
                </LinearGradient>
                <Text style={[tabStyles.centerLabel, isFocused && tabStyles.labelActive]}>
                  {config?.label}
                </Text>
              </TouchableOpacity>
            );
          }

          return (
            <TouchableOpacity
              key={route.key}
              onPress={onPress}
              style={tabStyles.tab}
              activeOpacity={0.8}
            >
              <View style={[tabStyles.iconContainer, isFocused && tabStyles.iconContainerActive]}>
                <Ionicons
                  name={(isFocused ? config?.icon : config?.iconOutline) as any}
                  size={22}
                  color={isFocused ? Colors.primary : Colors.tabInactive}
                />
              </View>
              <Text style={[tabStyles.label, isFocused && tabStyles.labelActive]}>
                {config?.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

// --- Nested Stacks ---

const HomeNavigator = () => (
  <HomeStack.Navigator screenOptions={{ headerShown: false }}>
    <HomeStack.Screen name="HomeScreen" component={HomeScreen} />
    <HomeStack.Screen
      name="DateIdeaDetail"
      component={DateIdeaDetailScreen}
      options={{ animation: 'slide_from_right' }}
    />
  </HomeStack.Navigator>
);

const ExploreNavigator = () => (
  <ExploreStack.Navigator screenOptions={{ headerShown: false }}>
    <ExploreStack.Screen name="ExploreScreen" component={ExploreScreen} />
    <ExploreStack.Screen
      name="DateIdeaDetail"
      component={DateIdeaDetailScreen}
      options={{ animation: 'slide_from_right' }}
    />
  </ExploreStack.Navigator>
);

const ReservationsNavigator = () => (
  <ReservationsStack.Navigator screenOptions={{ headerShown: false }}>
    <ReservationsStack.Screen name="ReservationsScreen" component={ReservationsScreen} />
    <ReservationsStack.Screen
      name="RestaurantDetail"
      component={RestaurantDetailScreen}
      options={{ animation: 'slide_from_right' }}
    />
    <ReservationsStack.Screen
      name="BookTable"
      component={RestaurantDetailScreen}
      options={{ animation: 'slide_from_bottom' }}
    />
    <ReservationsStack.Screen
      name="ReservationConfirmation"
      component={ReservationConfirmationScreen}
      options={{ animation: 'fade' }}
    />
  </ReservationsStack.Navigator>
);

// --- Main Tabs ---

const MainTabs = () => {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="HomeTab" component={HomeNavigator} />
      <Tab.Screen name="ExploreTab" component={ExploreNavigator} />
      <Tab.Screen name="Plan" component={PlanScreen} />
      <Tab.Screen name="ReservationsTab" component={ReservationsNavigator} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

export const AppNavigator = () => {
  const { isAuthenticated } = useAuthStore();

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          <>
            <Stack.Screen name="Welcome" component={WelcomeScreen} />
            <Stack.Screen
              name="Login"
              component={LoginScreen}
              options={{ animation: 'slide_from_right' }}
            />
            <Stack.Screen
              name="Signup"
              component={SignupScreen}
              options={{ animation: 'slide_from_right' }}
            />
          </>
        ) : (
          <Stack.Screen name="MainTabs" component={MainTabs} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const tabStyles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'transparent',
    paddingHorizontal: Spacing.base,
    paddingBottom: 20,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderRadius: 28,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: 'center',
    ...Shadow.lg,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
    paddingVertical: 4,
  },
  centerTab: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
    marginTop: -24,
  },
  iconContainer: {
    width: 44,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BorderRadius.lg,
  },
  iconContainerActive: {
    backgroundColor: Colors.surfaceAlt,
  },
  centerButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.md,
  },
  label: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.tabInactive,
  },
  labelActive: {
    color: Colors.primary,
  },
  centerLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.textMuted,
    marginTop: 2,
  },
});
