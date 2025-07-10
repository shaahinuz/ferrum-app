import React, { useEffect, useState, useContext } from 'react';
import { View, Text, FlatList, Pressable, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';
import { firestore } from '../firebaseConfig';
import { UserContext } from '../context/UserContext';

export default function CompanyProductOrdersTab() {
  const user = useContext(UserContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const snapshot = await getDocs(collection(firestore, 'productOrders'));
        const pendingOrders = snapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .filter(order => (order.status || '').toLowerCase() === 'pending');

        setOrders(pendingOrders);
      } catch (err) {
        console.error('Error loading product orders:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const acceptOrder = async (orderId) => {
    try {
      await updateDoc(doc(firestore, 'productOrders', orderId), {
        status: 'Accepted',
        acceptedBy: user?.uid || user?.user?.uid,
      });
      Alert.alert('✅ Order Accepted');
      setOrders(prev => prev.filter(order => order.id !== orderId));
    } catch (err) {
      console.error('Error updating order:', err);
      Alert.alert('❌ Failed to accept order');
    }
  };

  if (loading) return <ActivityIndicator style={{ marginTop: 50 }} />;

  return (
    <View style={styles.container}>
      {orders.length === 0 ? (
        <Text style={styles.empty}>🎉 No pending product orders right now.</Text>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.title}>{item.productType}</Text>
              <Text style={styles.details}>
                {item.width}×{item.height}m, {item.depth}mm, Qty: {item.quantity}
              </Text>
              <Text style={styles.details}>
                Price: {item.calculatedPrice?.toLocaleString()} soums
              </Text>
              <Pressable
                style={styles.acceptButton}
                onPress={() => acceptOrder(item.id)}
              >
                <Text style={styles.acceptText}>Accept Order</Text>
              </Pressable>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  empty: { textAlign: 'center', marginTop: 40, fontSize: 16, color: '#666' },
  card: {
    backgroundColor: '#f1f1f1',
    padding: 14,
    borderRadius: 8,
    marginBottom: 12,
  },
  title: { fontWeight: 'bold', fontSize: 16, color: '#1976D2' },
  details: { fontSize: 14, marginVertical: 2 },
  acceptButton: {
    backgroundColor: '#4CAF50',
    marginTop: 10,
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  acceptText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
