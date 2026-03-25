import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Auth
import { LoginScreen } from '../screens/auth/LoginScreen';
import { SignupScreen } from '../screens/auth/SignupScreen';

// 9 main screens
import SplashScreen from '../screens/splash/SplashScreen';
import WhosPlanningScreen from '../screens/onboarding/WhosPlanningScreen';
import BudgetScreen from '../screens/onboarding/BudgetScreen';
import PartnerProfileScreen from '../screens/onboarding/PartnerProfileScreen';
import AIChatScreen from '../screens/chat/AIChatScreen';
import DateOptionsScreen from '../screens/dates/DateOptionsScreen';
import VendorMarketplaceScreen from '../screens/vendors/VendorMarketplaceScreen';
import InvitationCardScreen from '../screens/invitation/InvitationCardScreen';
import ConfirmationScreen from '../screens/confirmation/ConfirmationScreen';

export type RootStackParamList = {
  Splash: undefined;
  Login: undefined;
  Signup: undefined;
  WhoPlanning: undefined;
  Budget: { whoPlanning?: string; occasions?: string[] };
  PartnerProfile: { whoPlanning?: string; occasions?: string[]; budget?: number };
  AIChat: { budget?: number; city?: string; likes?: string[]; dislikes?: string[] };
  DateOptions: { budget?: number; city?: string; likes?: string[]; dislikes?: string[] };
  VendorMarketplace: { dateOption?: string; budget?: number; city?: string };
  InvitationCard: { vendors?: any[]; vendorTotal?: number };
  Confirmation: { vendors?: any[]; vendorTotal?: number };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Splash"
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
          contentStyle: { backgroundColor: '#000000' },
        }}
      >
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Signup" component={SignupScreen} />
        <Stack.Screen name="WhoPlanning" component={WhosPlanningScreen} />
        <Stack.Screen name="Budget" component={BudgetScreen} />
        <Stack.Screen name="PartnerProfile" component={PartnerProfileScreen} />
        <Stack.Screen name="AIChat" component={AIChatScreen} />
        <Stack.Screen name="DateOptions" component={DateOptionsScreen} />
        <Stack.Screen name="VendorMarketplace" component={VendorMarketplaceScreen} />
        <Stack.Screen name="InvitationCard" component={InvitationCardScreen} />
        <Stack.Screen name="Confirmation" component={ConfirmationScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
