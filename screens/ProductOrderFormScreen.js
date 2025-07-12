// screens/ProductOrderFormScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  Alert,
  StyleSheet
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import {
  addDoc,
  collection,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { firestore } from '../firebaseConfig';

export default function ProductOrderFormScreen({ navigation }) {
  const [productType, setProductType] = useState('Metal Doors');
  const [width, setWidth] = useState('');
  const [height, setHeight] = useState('');
  const [depth, setDepth] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [maxPrice, setMaxPrice] = useState('');
  const [auctionDuration, setAuctionDuration] = useState('60'); // минуты

  const calculatePrice = () => {
    const w = parseFloat(width) || 0;
    const h = parseFloat(height) || 0;
    const d = parseFloat(depth) || 0;
    const area = w * h;
    const baseMm = 3;
    const basePrice = 1000000; // сум за м² при 3 мм
    const extra = Math.max(0, d - baseMm);
    const unit = basePrice * Math.pow(1.3, extra);
    return Math.round(unit * area * (parseInt(quantity, 10) || 1));
  };

  const handleSubmit = async () => {
    const durationMin = parseInt(auctionDuration, 10);
    if (isNaN(durationMin) || durationMin <= 0) {
      Alert.alert('Ошибка', 'Введите корректную длительность аукциона');
      return;
    }
    const endDate = new Date(Date.now() + durationMin * 60000);
    try {
      await addDoc(collection(firestore, 'productOrders'), {
        productType,
        width: parseFloat(width),
        height: parseFloat(height),
        depth: parseFloat(depth),
        quantity: parseInt(quantity, 10),
        calculatedPrice: calculatePrice(),
        maxPrice: parseFloat(maxPrice) || null,
        auctionDurationMin: durationMin,
        auctionEndTime: Timestamp.fromDate(endDate),
        status: 'pending',
        createdAt: serverTimestamp()
      });
      Alert.alert('✅ Заказ создан');
      navigation.goBack();
    } catch (err) {
      console.error(err);
      Alert.alert('Ошибка при создании заказа', err.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Тип продукта</Text>
      <Picker
        selectedValue={productType}
        onValueChange={setProductType}
        style={styles.picker}
      >
        <Picker.Item label="Metal Doors" value="Metal Doors" />
        <Picker.Item label="Constructions" value="Constructions" />
        <Picker.Item label="Billboards" value="Billboards" />
        <Picker.Item label="Individual Products" value="Individual Products" />
      </Picker>

      <Text style={styles.label}>Ширина (м)</Text>
      <TextInput
        style={styles.input}
        value={width}
        onChangeText={setWidth}
        keyboardType="numeric"
      />

      <Text style={styles.label}>Высота (м)</Text>
      <TextInput
        style={styles.input}
        value={height}
        onChangeText={setHeight}
        keyboardType="numeric"
      />

      <Text style={styles.label}>Глубина (мм)</Text>
      <TextInput
        style={styles.input}
        value={depth}
        onChangeText={setDepth}
        keyboardType="numeric"
      />

      <Text style={styles.label}>Количество</Text>
      <TextInput
        style={styles.input}
        value={quantity}
        onChangeText={setQuantity}
        keyboardType="numeric"
      />

      <Text style={styles.label}>Макс. цена (сум)</Text>
      <TextInput
        style={styles.input}
        value={maxPrice}
        onChangeText={setMaxPrice}
        keyboardType="numeric"
      />

      <Text style={styles.label}>Длительность аукциона (мин)</Text>
      <TextInput
        style={styles.input}
        value={auctionDuration}
        onChangeText={setAuctionDuration}
        keyboardType="numeric"
      />

      <View style={styles.button}>
        <Button title="Создать заказ" onPress={handleSubmit} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  label: { marginTop: 12, fontSize: 14, fontWeight: '500' },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 8,
    marginTop: 4
  },
  picker: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    marginTop: 4
  },
  button: { marginTop: 24 }
});
