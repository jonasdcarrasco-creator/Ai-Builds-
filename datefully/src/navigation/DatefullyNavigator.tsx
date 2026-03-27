import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SplashScreen from '../screens/datefully/SplashScreen';
import WhoPlanningScreen from '../screens/datefully/WhoPlanningScreen';
import BudgetScreen from '../screens/datefully/BudgetScreen';
import PartnerProfileScreen from '../screens/datefully/PartnerProfileScreen';
import AIChatScreen from '../screens/datefully/AIChatScreen';
import DateOptionsScreen from '../screens/datefully/DateOptionsScreen';
import MarketplaceScreen from '../screens/datefully/MarketplaceScreen';
import InvitationCardScreen from '../screens/datefully/InvitationCardScreen';
import ConfirmationScreen from '../screens/datefully/ConfirmationScreen';

export type DatefullyStackParamList = {
  Splash: undefined;
  WhoPlanning: undefined;
  Budget: undefined;
  PartnerProfile: undefined;
  AIChat: undefined;
  DateOptions: undefined;
  Marketplace: undefined;
  InvitationCard: undefined;
  Confirmation: undefined;
};

const Stack = createNativeStackNavigator<DatefullyStackParamList>();

export function DatefullyNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Splash"
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        contentStyle: { backgroundColor: '#000000' },
      }}
    >
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="WhoPlanning" component={WhoPlanningScreen} />
      <Stack.Screen name="Budget" component={BudgetScreen} />
      <Stack.Screen name="PartnerProfile" component={PartnerProfileScreen} />
      <Stack.Screen name="AIChat" component={AIChatScreen} />
      <Stack.Screen name="DateOptions" component={DateOptionsScreen} />
      <Stack.Screen name="Marketplace" component={MarketplaceScreen} />
      <Stack.Screen name="InvitationCard" component={InvitationCardScreen} />
      <Stack.Screen name="Confirmation" component={ConfirmationScreen} />
    </Stack.Navigator>
  );
}
