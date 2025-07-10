// App.js
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import HomeScreen from './screens/HomeScreen';
import ProductCategoryScreen from './screens/ProductCategoryScreen';
import ProductOrderFormScreen from './screens/ProductOrderFormScreen';
import LaborTypeScreen from './screens/LaborTypeScreen';
import LaborOrderFormScreen from './screens/LaborOrderFormScreen';
import MyOrdersScreen from './screens/MyOrdersScreen';
import AllOrdersScreen from './screens/AllOrdersScreen'; // Admin only
import CompanyOrdersScreen from './screens/CompanyOrdersScreen'; // Company only
import CompanyAcceptedOrdersScreen from './screens/CompanyAcceptedOrdersScreen';



import UserProvider from './context/UserProvider';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <UserProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Login">
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="ProductCategory" component={ProductCategoryScreen} />
          <Stack.Screen name="ProductOrderForm" component={ProductOrderFormScreen} />
          <Stack.Screen name="LaborType" component={LaborTypeScreen} />
          <Stack.Screen name="LaborOrderForm" component={LaborOrderFormScreen} />
          <Stack.Screen name="MyOrders" component={MyOrdersScreen} />
          <Stack.Screen name="CompanyAcceptedOrders" component={CompanyAcceptedOrdersScreen} />
          <Stack.Screen name="AllOrders" component={AllOrdersScreen} />
          <Stack.Screen name="CompanyOrders" component={CompanyOrdersScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </UserProvider>
  );
}
