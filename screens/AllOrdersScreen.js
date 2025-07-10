import React, { useContext, useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  Pressable,
  Alert,
} from 'react-native';
import {
  collection,
  getDocs,
  updateDoc,
  doc,
} from 'firebase/firestore';
import { firestore } from '../firebaseConfig';
import BackgroundWrapper from '../components/BackgroundWrapper';
import { UserContext } from '../context/UserContext';

export default function AllOrdersScreen() {
  const user = useContext(UserContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  if (!user || (user.role !== 'admin' && user.role !== 'company')) {
    return (
      <BackgroundWrapper>
        <View style={styles.container}>
          <Text style={styles.denied}>❌ Access Denied</Text>
        </View>
      </BackgroundWrapper>
    );
  }

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const productSnap = await getDocs(collection(firestore, 'productOrders'));
        const laborSnap = await getDocs(collection(firestore, 'laborOrders'));
        const usersSnap = await getDocs(collection(firestore, 'users'));

        const usersMap = {};
        usersSnap.forEach((doc) => {
          usersMap[doc.id] = doc.data(); // doc.id = UID
        });

        const productOrders = productSnap.docs.map((doc) => ({
          id: doc.id,
          type: 'Product',
          collection: 'productOrders',
          ...doc.data(),
          clientEmail: usersMap[doc.data().userId]?.email || 'Unknown',
        }));

        const laborOrders = laborSnap.docs.map((doc) => ({
          id: doc.id,
          type: 'Labor',
          collection: 'laborOrders',
          ...doc.data(),
          clientEmail: usersMap[doc.data().userId]?.email || 'Unknown',
        }));

        const all = [...productOrders, ...laborOrders];
        all.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
        setOrders(all);
      } catch (err) {
        console.error('Error fetching all orders:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const getStatusStyle = (status) => {
    switch ((status || '').toLowerCase()) {
      case 'accepted':
        return { backgroundColor: '#4CAF50' };
      case 'completed':
        return { backgroundColor: '#2196F3' };
      case 'rejected':
        return { backgroundColor: '#F44336' };
      case 'pending':
      default:
        return { backgroundColor: '#FFC107' };
    }
  };

  const updateOrderStatus = async (order, newStatus) => {
    try {
      const ref = doc(firestore, order.collection, order.id);
      await updateDoc(ref, { status: newStatus });
      Alert.alert('✅ Status updated');
      setOrders((prev) =>
        prev.map((o) =>
          o.id === order.id ? { ...o, status: newStatus } : o
        )
      );
    } catch (err) {
      console.error('Failed to update status:', err);
      Alert.alert('❌ Failed to update status');
    }
  };

  if (loading) {
    return <ActivityIndicator size="large" style={{ marginTop: 50 }} />;
  }

  return (
    <BackgroundWrapper>
      <View style={styles.container}>
        <Text style={styles.title}>🛠 All Orders</Text>

        {orders.length === 0 ? (
          <Text style={styles.noOrders}>No orders available.</Text>
        ) : (
          <FlatList
            data={orders}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.card}>
                <Text style={styles.type}>{item.type} Order</Text>

                {item.type === 'Product' ? (
                  <Text style={styles.details}>
                    {item.productType} – {item.width}×{item.height}m, {item.depth}mm, Qty: {item.quantity}
                  </Text>
                ) : (
                  <Text style={styles.details}>
                    {item.laborType} – {item.details}
                  </Text>
                )}

                <Text style={styles.client}>Client: {item.clientEmail}</Text>

                <Text style={styles.price}>
                  Price: {(item.calculatedPrice || item.startPrice)?.toLocaleString()} soums
                </Text>

                {item.createdAt && (
                  <Text style={styles.date}>
                    {new Date(item.createdAt.seconds * 1000).toLocaleString()}
                  </Text>
                )}

                <View style={[styles.statusBadge, getStatusStyle(item.status)]}>
                  <Text style={styles.statusText}>
                    {item.status || 'Pending'}
                  </Text>
                </View>

                <View style={styles.actions}>
                  <Pressable
                    style={[styles.actionButton, { backgroundColor: '#4CAF50' }]}
                    onPress={() => updateOrderStatus(item, 'Accepted')}
                  >
                    <Text style={styles.actionText}>Accept</Text>
                  </Pressable>
                  <Pressable
                    style={[styles.actionButton, { backgroundColor: '#2196F3' }]}
                    onPress={() => updateOrderStatus(item, 'Completed')}
                  >
                    <Text style={styles.actionText}>Complete</Text>
                  </Pressable>
                  <Pressable
                    style={[styles.actionButton, { backgroundColor: '#F44336' }]}
                    onPress={() => updateOrderStatus(item, 'Rejected')}
                  >
                    <Text style={styles.actionText}>Reject</Text>
                  </Pressable>
                </View>
              </View>
            )}
          />
        )}
      </View>
    </BackgroundWrapper>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, flex: 1 },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  noOrders: {
    textAlign: 'center',
    fontSize: 16,
    marginTop: 20,
  },
  denied: {
    fontSize: 18,
    textAlign: 'center',
    color: 'red',
    marginTop: 100,
  },
  card: {
    backgroundColor: '#f1f1f1',
    padding: 15,
    borderRadius: 10,
    marginBottom: 12,
    elevation: 2,
  },
  type: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 4,
    color: '#1976D2',
  },
  details: {
    marginBottom: 4,
    fontSize: 14,
  },
  client: {
    fontSize: 12,
    color: '#777',
    marginTop: 4,
    marginBottom: 4,
  },
  price: {
    fontWeight: '600',
    marginBottom: 4,
  },
  date: {
    fontSize: 12,
    color: '#666',
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginTop: 6,
  },
  statusText: {
    fontWeight: 'bold',
    color: '#fff',
    fontSize: 12,
  },
  actions: {
    flexDirection: 'row',
    marginTop: 10,
    gap: 10,
    flexWrap: 'wrap',
  },
  actionButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  actionText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 13,
  },
});
