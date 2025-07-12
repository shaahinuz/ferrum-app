import React, { useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import ForgotPasswordScreen from './screens/ForgotPasswordScreen';
import HomeScreen from './screens/HomeScreen';
import ProductCategoryScreen from './screens/ProductCategoryScreen';
import ProductOrderFormScreen from './screens/ProductOrderFormScreen';
import LaborTypeScreen from './screens/LaborTypeScreen';
import LaborOrderFormScreen from './screens/LaborOrderFormScreen';
import MyOrdersScreen from './screens/MyOrdersScreen';
import AllOrdersScreen from './screens/AllOrdersScreen'; // Admin only
import CompanyOrdersScreen from './screens/CompanyOrdersScreen'; // Company only
import CompanyAcceptedOrdersScreen from './screens/CompanyAcceptedOrdersScreen';
import VerifyEmailScreen from './screens/VerifyEmailScreen';

import UserProvider from './context/UserProvider';
import { UserContext } from './context/UserContext';

const Stack = createNativeStackNavigator();

function AppNavigator() {
  const user = useContext(UserContext);

  if (!user) {
    return (
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      </Stack.Navigator>
    );
  }

  if (!user.emailVerified) {
    return (
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="VerifyEmail" component={VerifyEmailScreen} />
      </Stack.Navigator>
    );
  }

  return (
    <Stack.Navigator>
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="ProductCategory" component={ProductCategoryScreen} />
      <Stack.Screen name="ProductOrderForm" component={ProductOrderFormScreen} />
      <Stack.Screen name="LaborType" component={LaborTypeScreen} />
      <Stack.Screen name="LaborOrderForm" component={LaborOrderFormScreen} />
      <Stack.Screen name="MyOrders" component={MyOrdersScreen} />
      <Stack.Screen name="CompanyAcceptedOrders" component={CompanyAcceptedOrdersScreen} />
      <Stack.Screen name="CompanyOrders" component={CompanyOrdersScreen} />
      <Stack.Screen name="AllOrders" component={AllOrdersScreen} />
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <UserProvider>
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
    </UserProvider>
  );
}

