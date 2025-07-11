// screens/LaborOrderFormScreen.js
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

export default function LaborOrderFormScreen({ navigation }) {
  const [laborType, setLaborType] = useState('Welder');
  const [details, setDetails] = useState('');
  const [startingPrice, setStartingPrice] = useState('');
  const [auctionDuration, setAuctionDuration] = useState('60');

  const handleSubmit = async () => {
    const durationMin = parseInt(auctionDuration, 10);
    if (isNaN(durationMin) || durationMin <= 0) {
      Alert.alert('Ошибка', 'Введите корректную длительность аукциона');
      return;
    }
    if (!details.trim()) {
      Alert.alert('Ошибка', 'Опишите работу подробнее');
      return;
    }
    const endDate = new Date(Date.now() + durationMin * 60000);
    try {
      await addDoc(collection(firestore, 'laborOrders'), {
        laborType,
        details,
        startingPrice: parseFloat(startingPrice) || null,
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
      <Text style={styles.label}>Тип работы</Text>
      <Picker
        selectedValue={laborType}
        onValueChange={setLaborType}
        style={styles.picker}
      >
        <Picker.Item label="Welder" value="Welder" />
        <Picker.Item label="Engineer" value="Engineer" />
        <Picker.Item label="Other" value="Other" />
      </Picker>

      <Text style={styles.label}>Описание работы</Text>
      <TextInput
        style={[styles.input, { height: 100 }]}
        value={details}
        onChangeText={setDetails}
        multiline
      />

      <Text style={styles.label}>Начальная цена (сум)</Text>
      <TextInput
        style={styles.input}
        value={startingPrice}
        onChangeText={setStartingPrice}
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
