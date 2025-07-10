// screens/ProductOrderFormScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { addDoc, collection } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { firestore, storage } from '../firebaseConfig';
import { ref, uploadBytes } from 'firebase/storage';
import BackgroundWrapper from '../components/BackgroundWrapper';

export default function ProductOrderFormScreen({ route }) {
  const { productType } = route.params;
  const [width, setWidth] = useState('');
  const [height, setHeight] = useState('');
  const [depth, setDepth] = useState('');
  const [quantity, setQuantity] = useState('');
  const [file, setFile] = useState(null);
  const [price, setPrice] = useState(0);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const w = parseFloat(width);
    const h = parseFloat(height);
    const d = parseFloat(depth);
    const q = parseInt(quantity);

    if (w > 0 && h > 0 && d > 0 && q > 0) {
      const area = w * h;
      const basePrice = 1000000;
      const multiplier = d > 3 ? 1 + 0.3 * (d - 3) : 1;
      const total = Math.round(basePrice * area * q * multiplier);
      setPrice(total);
    } else {
      setPrice(0);
    }
  }, [width, height, depth, quantity]);

  const handleFilePick = async () => {
    const result = await DocumentPicker.getDocumentAsync({});
    if (result.assets && result.assets.length > 0) {
      setFile(result.assets[0]);
    }
  };

  const handleSubmit = async () => {
    if (!width || !height || !depth || !quantity || price === 0) {
      Alert.alert('Error', 'Please fill in all fields with valid values.');
      return;
    }

    try {
      setUploading(true);
      const auth = getAuth();
      const userId = auth.currentUser?.uid;
      let fileUrl = null;

      if (file) {
        const response = await fetch(file.uri);
        const blob = await response.blob();
        const fileRef = ref(storage, `orders/${Date.now()}_${file.name}`);
        await uploadBytes(fileRef, blob);
        fileUrl = fileRef.fullPath;
      }

      await addDoc(collection(firestore, 'productOrders'), {
        userId,
        productType,
        width: parseFloat(width),
        height: parseFloat(height),
        depth: parseFloat(depth),
        quantity: parseInt(quantity),
        calculatedPrice: price,
        fileUrl,
        status: 'Pending', // ✅ NEW
        createdAt: new Date(),
      });


      Alert.alert('✅ Success', 'Your product order has been submitted.');
    } catch (err) {
      console.error(err);
      Alert.alert('❌ Error', err.message || 'Something went wrong');
    } finally {
      setUploading(false);
    }
  };

  return (
    <BackgroundWrapper>
    <View style={styles.container}>
      <Text style={styles.title}>Product: {productType}</Text>

      <Text style={styles.label}>Width (meters)</Text>
      <TextInput style={styles.input} keyboardType="numeric" value={width} onChangeText={setWidth} />

      <Text style={styles.label}>Height (meters)</Text>
      <TextInput style={styles.input} keyboardType="numeric" value={height} onChangeText={setHeight} />

      <Text style={styles.label}>Depth (mm)</Text>
      <TextInput style={styles.input} keyboardType="numeric" value={depth} onChangeText={setDepth} />

      <Text style={styles.label}>Quantity</Text>
      <TextInput style={styles.input} keyboardType="numeric" value={quantity} onChangeText={setQuantity} />

      <Button title={file ? 'File Selected' : 'Upload Dimensions File'} onPress={handleFilePick} />

      <Text style={styles.price}>📦 Calculated Price: <Text style={{ fontWeight: 'bold' }}>{price.toLocaleString()} soums</Text></Text>

      <Button
        title={uploading ? 'Submitting...' : 'Submit Order'}
        onPress={handleSubmit}
        disabled={uploading}
        color="#1976D2"
      />
    </View>
  </BackgroundWrapper>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, flex: 1 },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 20 },
  label: { marginTop: 10, marginBottom: 4 },
  input: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 6,
    marginBottom: 8,
  },
  price: {
    marginVertical: 15,
    fontSize: 16,
  },
});






