// screens/LaborTypeScreen.js
import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import BackgroundWrapper from '../components/BackgroundWrapper';

export default function LaborTypeScreen({ navigation }) {
  const laborTypes = ['Welder', 'Engineer', 'Others'];

  return (
  <BackgroundWrapper>
    <View style={styles.container}>
      <Text style={styles.title}>Select a Labor Type</Text>

      {laborTypes.map((type) => (
        <View key={type} style={styles.buttonWrapper}>
          <Button
            title={type}
            onPress={() => navigation.navigate('LaborOrderForm', { laborType: type })}
            color="#1976D2"
          />
        </View>
      ))}
    </View>
  </BackgroundWrapper>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20 },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  buttonWrapper: { marginVertical: 8 },
});




