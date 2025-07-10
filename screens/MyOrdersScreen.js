import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  Pressable,
} from 'react-native';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { firestore } from '../firebaseConfig';
import BackgroundWrapper from '../components/BackgroundWrapper';

const FILTER_TYPES = ['All', 'Product', 'Labor'];
const FILTER_STATUSES = ['All', 'Pending', 'Accepted', 'Completed', 'Rejected'];

export default function MyOrdersScreen() {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  const userId = getAuth().currentUser?.uid;

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const productQuery = query(
          collection(firestore, 'productOrders'),
          where('userId', '==', userId)
        );
        const laborQuery = query(
          collection(firestore, 'laborOrders'),
          where('userId', '==', userId)
        );

        const [productSnap, laborSnap] = await Promise.all([
          getDocs(productQuery),
          getDocs(laborQuery),
        ]);

        const productOrders = productSnap.docs.map((doc) => ({
          id: doc.id,
          type: 'Product',
          ...doc.data(),
        }));

        const laborOrders = laborSnap.docs.map((doc) => ({
          id: doc.id,
          type: 'Labor',
          ...doc.data(),
        }));

        const all = [...productOrders, ...laborOrders];
        all.sort((a, b) => {
          const aTime = a.createdAt?.seconds || 0;
          const bTime = b.createdAt?.seconds || 0;
          return bTime - aTime;
        });

        setOrders(all);
        setLoading(false);
      } catch (err) {
        console.error('Failed to fetch orders:', err);
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  useEffect(() => {
    const filtered = orders.filter((order) => {
      const matchType =
        typeFilter === 'All' || order.type === typeFilter;
      const matchStatus =
        statusFilter === 'All' ||
        (order.status || 'Pending').toLowerCase() === statusFilter.toLowerCase();
      return matchType && matchStatus;
    });
    setFilteredOrders(filtered);
  }, [orders, typeFilter, statusFilter]);

  const getStatusStyle = (status) => {
    switch ((status || '').toLowerCase()) {
      case 'accepted':
        return { backgroundColor: '#4CAF50' }; // green
      case 'completed':
        return { backgroundColor: '#2196F3' }; // blue
      case 'rejected':
        return { backgroundColor: '#F44336' }; // red
      case 'pending':
      default:
        return { backgroundColor: '#FFC107' }; // yellow
    }
  };

  const renderFilterTabs = (options, selected, setSelected) => (
    <View style={styles.filterRow}>
      {options.map((option) => (
        <Pressable
          key={option}
          onPress={() => setSelected(option)}
          style={[
            styles.filterTab,
            selected === option && styles.filterTabActive,
          ]}
        >
          <Text
            style={[
              styles.filterTabText,
              selected === option && styles.filterTabTextActive,
            ]}
          >
            {option}
          </Text>
        </Pressable>
      ))}
    </View>
  );

  if (loading) {
    return <ActivityIndicator size="large" style={{ marginTop: 50 }} />;
  }

  return (
    <BackgroundWrapper>
      <View style={styles.container}>
        <Text style={styles.title}>📋 My Orders</Text>

        <Text style={styles.filterTitle}>Type:</Text>
        {renderFilterTabs(FILTER_TYPES, typeFilter, setTypeFilter)}

        <Text style={styles.filterTitle}>Status:</Text>
        {renderFilterTabs(FILTER_STATUSES, statusFilter, setStatusFilter)}

        {filteredOrders.length === 0 ? (
          <Text style={styles.noOrders}>No orders match your filters.</Text>
        ) : (
          <FlatList
            data={filteredOrders}
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
    marginBottom: 10,
    textAlign: 'center',
  },
  noOrders: { textAlign: 'center', fontSize: 16, marginTop: 20 },
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
  details: { marginBottom: 4, fontSize: 14 },
  price: { fontWeight: '600', marginBottom: 4 },
  date: { fontSize: 12, color: '#666' },
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
  filterTitle: {
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 4,
    fontSize: 16,
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10,
  },
  filterTab: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: '#e0e0e0',
    marginRight: 8,
    marginBottom: 8,
  },
  filterTabActive: {
    backgroundColor: '#1976D2',
  },
  filterTabText: {
    color: '#333',
    fontSize: 14,
  },
  filterTabTextActive: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
