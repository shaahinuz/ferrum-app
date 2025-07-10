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
        tabBarLabelStyle: { fontWeight: 'bold' },
        tabBarIndicatorStyle: { backgroundColor: '#1976D2' },
      }}
    >
      <Tab.Screen name="Products" component={CompanyProductOrdersTab} />
      <Tab.Screen name="Labor" component={CompanyLaborOrdersTab} />
    </Tab.Navigator>
  );
}
