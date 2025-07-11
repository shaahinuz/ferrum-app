// screens/CompanyLaborOrdersTab.js
import React, { useEffect, useState, useContext } from 'react';
import {
  View,
  Text,
  FlatList,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  Modal,
  TextInput,
  Button,
  Alert
} from 'react-native';
import {
  collection,
  getDocs,
  updateDoc,
  doc,
  arrayUnion,
  serverTimestamp
} from 'firebase/firestore';
import { firestore } from '../firebaseConfig';
import { UserContext } from '../context/UserProvider';

export default function CompanyLaborOrdersTab() {
  const user = useContext(UserContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(Date.now());

  const [showModal, setShowModal] = useState(false);
  const [currentOrderId, setCurrentOrderId] = useState(null);
  const [bidValue, setBidValue] = useState('');

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    async function fetchOrders() {
      try {
        const snap = await getDocs(collection(firestore, 'laborOrders'));
        const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        setOrders(data.filter(o => o.status === 'pending'));
      } catch (e) {
        console.error(e);
        Alert.alert('Ошибка загрузки', e.message);
      } finally {
        setLoading(false);
      }
    }
    fetchOrders();
  }, []);

  const submitBid = async () => {
    const amt = parseFloat(bidValue);
    if (isNaN(amt) || amt <= 0) {
      Alert.alert('Ошибка', 'Введите корректную сумму');
      return;
    }
    try {
      const bid = { amount: amt, bidder: user.uid, createdAt: serverTimestamp() };
      await updateDoc(doc(firestore, 'laborOrders', currentOrderId), {
        bids: arrayUnion(bid)
      });
      Alert.alert('Ставка отправлена');
    } catch (err) {
      console.error(err);
      Alert.alert('Ошибка', err.message);
    } finally {
      setShowModal(false);
      setBidValue('');
    }
  };

  if (loading) return <ActivityIndicator style={{ marginTop: 50 }} />;

  return (
    <View style={styles.container}>
      {orders.length === 0 && (
        <Text style={styles.empty}>Нет заказов в статусе «pending»</Text>
      )}
      <FlatList
        data={orders}
        keyExtractor={item => item.id}
        renderItem={({ item }) => {
          const endMs = item.auctionEndTime.toDate().getTime();
          const diff = endMs - now;
          const minutes = Math.floor(diff / 60000);
          const seconds = Math.floor((diff % 60000) / 1000);
          const expired = diff <= 0;

          return (
            <View style={styles.card}>
              <Text style={styles.title}>{item.laborType}</Text>
              <Text numberOfLines={2}>{item.details}</Text>
              <Text style={styles.timer}>
                {expired
                  ? 'Аукцион завершён'
                  : `Осталось ${minutes}:${String(seconds).padStart(2,'0')}`}
              </Text>

              <View style={styles.buttonRow}>
                <Pressable
                  style={[styles.bidButton, expired && styles.disabled]}
                  disabled={expired}
                  onPress={() => {
                    setCurrentOrderId(item.id);
                    setShowModal(true);
                  }}
                >
                  <Text style={styles.btnText}>Ставка</Text>
                </Pressable>
              </View>
            </View>
          );
        }}
      />

      <Modal visible={showModal} transparent animationType="slide">
        <View style={styles.modalBg}>
          <View style={styles.modal}>
            <Text style={{ marginBottom: 8 }}>Сумма ставки</Text>
            <TextInput
              style={styles.input}
              value={bidValue}
              onChangeText={setBidValue}
              keyboardType="numeric"
            />
            <View style={styles.modalButtons}>
              <Button title="Отмена" onPress={() => setShowModal(false)} />
              <Button title="OK" onPress={submitBid} />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  empty: { textAlign: 'center', marginTop: 40, color: '#666' },
  card: {
    backgroundColor: '#f1f1f1',
    padding: 14,
    borderRadius: 8,
    marginBottom: 12
  },
  title: { fontWeight: 'bold', fontSize: 16, marginBottom: 4 },
  timer: { marginTop: 6, fontStyle: 'italic' },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10
  },
  bidButton: {
    backgroundColor: '#FF9800',
    padding: 10,
    borderRadius: 6,
    alignItems: 'center'
  },
  disabled: {
    backgroundColor: '#ccc'
  },
  btnText: { color: '#fff', fontWeight: '600' },
  modalBg: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  modal: {
    width: '80%',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 8,
    marginBottom: 12
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  }
});
