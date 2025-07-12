import React, { useState } from 'react';
import { View, Text, Button, StyleSheet, Alert } from 'react-native';
import { auth } from '../firebaseConfig';

export default function VerifyEmailScreen() {
  const [checking, setChecking] = useState(false);

  const handleCheckVerification = async () => {
    try {
      setChecking(true);
      await auth.currentUser.reload();

      if (auth.currentUser.emailVerified) {
        Alert.alert('✅ Verified!', 'You can now use the app.');
        // DO NOT navigate manually – App.js will auto-redirect
      } else {
        Alert.alert('❗ Still not verified', 'Check your email again.');
      }
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Something went wrong.');
    } finally {
      setChecking(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📧 Verify Your Email</Text>
      <Text style={styles.text}>We sent a link to: {auth.currentUser?.email}</Text>
      <Button title={checking ? 'Checking...' : 'I verified my email'} onPress={handleCheckVerification} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20 },
  text: { fontSize: 16, textAlign: 'center', marginBottom: 20 },
});
