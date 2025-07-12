import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, Alert,
  StyleSheet, KeyboardAvoidingView, Platform, Image
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { auth, firestore } from '../firebaseConfig';

export default function RegisterScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('client');
  const [image, setImage] = useState(null);
  const [picking, setPicking] = useState(false);

  const pickImage = async () => {
    if (picking) return;
    setPicking(true);

    console.log("Opening image picker...");
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'We need access to your media library.');
      setPicking(false);
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: [ImagePicker.MediaType.IMAGE],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setImage(result.assets[0].uri);
      console.log("Selected image:", result.assets[0].uri);
    }

    setPicking(false);
  };

  const handleRegister = async () => {
    if (!email || !password || !name) {
      Alert.alert('Error', 'Please fill all required fields.');
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      let avatarUrl = 'https://cdn-icons-png.flaticon.com/512/149/149071.png';

      if (image) {
        const response = await fetch(image);
        const blob = await response.blob();
        const storageRef = ref(getStorage(), `avatars/${user.uid}.jpg`);
        await uploadBytes(storageRef, blob);
        avatarUrl = await getDownloadURL(storageRef);
        console.log("Uploaded avatar URL:", avatarUrl);
      }

      await setDoc(doc(firestore, 'users', user.uid), {
        email: user.email,
        name,
        role,
        avatarUrl,
      });

      await sendEmailVerification(user);
      Alert.alert('Success ✅', 'Verification email sent. Please check your inbox.');
      navigation.replace('VerifyEmail');

    } catch (error) {
      console.error("Registration error:", error);
      Alert.alert('Registration Failed', error.message);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <Text style={styles.title}>Create Account</Text>

      <TouchableOpacity onPress={pickImage} activeOpacity={0.7} style={styles.avatarContainer}>
        <Image
          source={{ uri: image || 'https://cdn-icons-png.flaticon.com/512/149/149071.png' }}
          style={styles.avatar}
        />
        <Text style={styles.changePhoto}>Tap to select profile photo</Text>
      </TouchableOpacity>

      <TextInput
        style={styles.input}
        placeholder="Name"
        value={name}
        onChangeText={setName}
      />

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <Text style={styles.roleLabel}>Registering as:</Text>
      <View style={styles.roleSelector}>
        <TouchableOpacity
          style={[styles.roleOption, role === 'client' && styles.roleSelected]}
          onPress={() => setRole('client')}
        >
          <Text style={[styles.roleText, role === 'client' && styles.roleTextSelected]}>Client</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.roleOption, role === 'company' && styles.roleSelected]}
          onPress={() => setRole('company')}
        >
          <Text style={[styles.roleText, role === 'company' && styles.roleTextSelected]}>Company</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.button} onPress={handleRegister}>
        <Text style={styles.buttonText}>Register</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Login')}>
        <Text style={styles.linkText}>Already have an account? Log in</Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, justifyContent: 'center', paddingHorizontal: 24, backgroundColor: '#fff'
  },
  title: {
    fontSize: 26, fontWeight: 'bold', marginBottom: 20, textAlign: 'center', color: '#333'
  },
  avatarContainer: {
    alignItems: 'center', marginBottom: 16,
  },
  avatar: {
    width: 100, height: 100, borderRadius: 50, marginBottom: 8
  },
  changePhoto: {
    textAlign: 'center', color: '#555'
  },
  input: {
    borderWidth: 1, borderColor: '#ccc', borderRadius: 10,
    padding: 14, fontSize: 16, marginBottom: 12, backgroundColor: '#f9f9f9'
  },
  roleLabel: {
    fontSize: 16, marginBottom: 6, fontWeight: 'bold', color: '#333'
  },
  roleSelector: {
    flexDirection: 'row', justifyContent: 'space-around', marginBottom: 15
  },
  roleOption: {
    paddingVertical: 10, paddingHorizontal: 20,
    borderWidth: 1, borderColor: '#1976D2', borderRadius: 10
  },
  roleSelected: {
    backgroundColor: '#1976D2'
  },
  roleText: {
    color: '#1976D2', fontWeight: '600'
  },
  roleTextSelected: {
    color: '#fff'
  },
  button: {
    backgroundColor: '#1976D2',
    padding: 14, borderRadius: 10, alignItems: 'center', marginBottom: 12
  },
  buttonText: {
    color: 'white', fontSize: 16, fontWeight: '600'
  },
  linkText: {
    color: '#1976D2', textAlign: 'center', fontSize: 14, marginTop: 10
  }
});
