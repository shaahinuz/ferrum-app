import React, { useContext } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { getAuth, signOut } from 'firebase/auth';
import BackgroundWrapper from '../components/BackgroundWrapper';
import { UserContext } from '../context/UserContext';

export default function HomeScreen({ navigation }) {
  const user = useContext(UserContext);

  const handleLogout = () => {
    const auth = getAuth();
    signOut(auth);
    navigation.replace('Login');
  };

  return (
    <BackgroundWrapper>
      <View style={styles.container}>
        <Text style={styles.title}>Welcome to Ferrum</Text>

        {/* Company: Prioritized buttons first */}
        {user?.role === 'company' && (
          <>
            <View style={styles.buttonContainer}>
              <Button
                title="Company Orders"
                onPress={() => navigation.navigate('CompanyOrders')}
                color="#1e90ff"
              />
            </View>
            <View style={styles.buttonContainer}>
              <Button
                title="My Accepted Orders"
                onPress={() => navigation.navigate('CompanyAcceptedOrders')}
                color="#4CAF50"
              />
            </View>
          </>
        )}

        {/* My Orders (everyone) */}
        <View style={styles.buttonContainer}>
          <Button
            title="My Orders"
            onPress={() => navigation.navigate('MyOrders')}
          />
        </View>

        {/* Clients & Companies: Place Orders */}
        <View style={styles.buttonContainer}>
          <Button
            title="Order a Product"
            onPress={() => navigation.navigate('ProductCategory')}
          />
        </View>

        <View style={styles.buttonContainer}>
          <Button
            title="Hire Labor"
            onPress={() => navigation.navigate('LaborType')}
          />
        </View>

        {/* Admins only */}
        {user?.role === 'admin' && (
          <View style={styles.buttonContainer}>
            <Button
              title="Manage All Orders"
              onPress={() => navigation.navigate('AllOrders')}
              color="#1e90ff"
            />
          </View>
        )}

        {/* Logout */}
        <View style={[styles.buttonContainer, { marginTop: 40 }]}>
          <Button title="Log Out" onPress={handleLogout} color="#b22222" />
        </View>
      </View>
    </BackgroundWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 30,
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 40,
    color: '#222',
  },
  buttonContainer: {
    marginBottom: 20,
  },
});
