// screens/CompanyOrdersScreen.js
import React from 'react';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import CompanyProductOrdersTab from './CompanyProductOrdersTab';
import CompanyLaborOrdersTab from './CompanyLaborOrdersTab';

const Tab = createMaterialTopTabNavigator();

export default function CompanyOrdersScreen() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarIndicatorStyle: { backgroundColor: '#1976D2' },
        tabBarLabelStyle: { fontWeight: 'bold' },
        tabBarStyle: { backgroundColor: '#fff' },
      }}
    >
      <Tab.Screen
        name="ProductOrders"
        component={CompanyProductOrdersTab}
        options={{ title: 'Продукты' }}
      />
      <Tab.Screen
        name="LaborOrders"
        component={CompanyLaborOrdersTab}
        options={{ title: 'Услуги' }}
      />
    </Tab.Navigator>
  );
}