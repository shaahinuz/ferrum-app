// screens/LaborOrderFormScreen.js
import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet } from 'react-native';
import { getAuth } from 'firebase/auth';
import { addDoc, collection } from 'firebase/firestore';
import { firestore } from '../firebaseConfig';
import BackgroundWrapper from '../components/BackgroundWrapper';

export default function LaborOrderFormScreen({ route }) {
  const { laborType } = route.params;

  const [details, setDetails] = useState('');
  const [startPrice, setStartPrice] = useState('');
  const [uploading, setUploading] = useState(false);

  const handleSubmit = async () => {
    if (!details || !startPrice || isNaN(parseFloat(startPrice))) {
      Alert.alert('Error', 'Please fill out all fields with valid info.');
      return;
    }

    try {
      setUploading(true);
      const userId = getAuth().currentUser?.uid;

      await addDoc(collection(firestore, 'laborOrders'), {
        userId,
        laborType,
        details,
        startPrice: parseFloat(startPrice),
        status: 'Pending', // ✅ NEW
        createdAt: new Date(),
      });


      Alert.alert('✅ Success', 'Your labor request has been submitted.');
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
      <Text style={styles.title}>Labor Type: {laborType}</Text>

      <Text style={styles.label}>Work Details</Text>
      <TextInput
        placeholder="e.g. Weld 3 gates with steel rods"
        style={styles.input}
        value={details}
        onChangeText={setDetails}
        multiline
      />

      <Text style={styles.label}>Starting Auction Price (soums)</Text>
      <TextInput
        placeholder="e.g. 150000"
        style={styles.input}
        keyboardType="numeric"
        value={startPrice}
        onChangeText={setStartPrice}
      />

      <View style={{ marginTop: 20 }}>
        <Button
          title={uploading ? 'Submitting...' : 'Submit Request'}
          onPress={handleSubmit}
          disabled={uploading}
          color="#1976D2"
        />
      </View>
    </View>
  </BackgroundWrapper>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, flex: 1 },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 20 },
  label: { fontWeight: 'bold', marginBottom: 4 },
  input: {
    backgroundColor: '#fff',
    borderRadius: 6,
    padding: 10,
    marginBottom: 15,
  },
});







