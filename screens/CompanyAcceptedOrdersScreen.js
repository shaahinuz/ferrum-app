// screens/CompanyAcceptedOrdersScreen.js
import React, { useEffect, useState, useContext } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { collection, getDocs } from 'firebase/firestore';
import { firestore } from '../firebaseConfig';
import { UserContext } from '../context/UserContext';
import BackgroundWrapper from '../components/BackgroundWrapper';

export default function CompanyAcceptedOrdersScreen() {
  const user = useContext(UserContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const companyId = user?.uid || user?.user?.uid;

  useEffect(() => {
    const fetchAcceptedOrders = async () => {
      try {
        const productSnap = await getDocs(collection(firestore, 'productOrders'));
        const laborSnap = await getDocs(collection(firestore, 'laborOrders'));

        const acceptedProductOrders = productSnap.docs
          .map(doc => ({ id: doc.id, type: 'Product', ...doc.data() }))
          .filter(order => order.acceptedBy === companyId);

        const acceptedLaborOrders = laborSnap.docs
          .map(doc => ({ id: doc.id, type: 'Labor', ...doc.data() }))
          .filter(order => order.acceptedBy === companyId);

        const all = [...acceptedProductOrders, ...acceptedLaborOrders];
        all.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));

        setOrders(all);
      } catch (err) {
        console.error('Error fetching accepted orders:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAcceptedOrders();
  }, []);

  if (loading) return <ActivityIndicator style={{ marginTop: 50 }} />;

  return (
    <BackgroundWrapper>
      <View style={styles.container}>
        <Text style={styles.title}>✅ My Accepted Orders</Text>

        {orders.length === 0 ? (
          <Text style={styles.empty}>You haven't accepted any orders yet.</Text>
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
                <Text style={styles.price}>
                  Price: {(item.calculatedPrice || item.startPrice)?.toLocaleString()} soums
                </Text>
                {item.status && (
                  <Text style={styles.status}>
                    Status: {item.status}
                  </Text>
                )}
              </View>
            )}
          />
        )}
      </View>
    </BackgroundWrapper>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, flex: 1 },
  title: { fontSize: 22, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 },
  empty: { textAlign: 'center', color: '#666', marginTop: 30 },
  card: {
    backgroundColor: '#f1f1f1',
    padding: 14,
    borderRadius: 8,
    marginBottom: 12,
  },
  type: { fontWeight: 'bold', fontSize: 16, color: '#1976D2' },
  details: { fontSize: 14, marginTop: 4 },
  price: { marginTop: 4, fontWeight: '600' },
  status: { marginTop: 4, fontSize: 13, color: '#555' },
});
