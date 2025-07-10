// screens/ProductCategoryScreen.js
import React from 'react';
import { View, Button, StyleSheet, Text } from 'react-native';
import BackgroundWrapper from '../components/BackgroundWrapper';

export default function ProductCategoryScreen({ navigation }) {
  const categories = ['Metal Doors', 'Constructions', 'Billboards', 'Individual Products'];

  return (
  <BackgroundWrapper>
    <View style={styles.container}>
      <Text style={styles.title}>Select a Product</Text>
      {categories.map((type) => (
        <View style={styles.buttonWrapper} key={type}>
          <Button
            title={type}
            onPress={() => navigation.navigate('ProductOrderForm', { productType: type })}
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
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  buttonWrapper: { marginVertical: 8 },
});
