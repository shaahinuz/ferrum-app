// screens/CompanyProductOrdersTab.js
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

export default function CompanyProductOrdersTab() {
  const user = useContext(UserContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(Date.now());

  const [showModal, setShowModal] = useState(false);
  const [currentOrderId, setCurrentOrderId] = useState(null);
  const [bidValue, setBidValue] = useState('');

  // Обновляем «сейчас» каждую секунду, чтобы таймер тикал
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Загружаем все «pending» заказы
  useEffect(() => {
    async function fetchOrders() {
      try {
        const snap = await getDocs(collection(firestore, 'productOrders'));
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

  // Отправка ставки
  const submitBid = async () => {
    const amt = parseFloat(bidValue);
    if (isNaN(amt) || amt <= 0) {
      Alert.alert('Ошибка', 'Введите корректную сумму');
      return;
    }
    try {
      const bid = { amount: amt, bidder: user.uid, createdAt: serverTimestamp() };
      await updateDoc(doc(firestore, 'productOrders', currentOrderId), {
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
              <Text style={styles.title}>{item.productType}</Text>
              <Text>Размер: {item.width}×{item.height}м, {item.depth}мм</Text>
              <Text>Цена: {item.calculatedPrice.toLocaleString()} сум</Text>
              <Text style={styles.timer}>
                {expired
                  ? 'Аукцион завершён'
                  : `Осталось ${minutes}:${String(seconds).padStart(2,'0')}`}
              </Text>

              <View style={styles.buttonRow}>
                {/* Кнопка «Принять» всегда активна */}
                <Pressable
                  style={styles.acceptButton}
                  onPress={async () => {
                    await updateDoc(doc(firestore, 'productOrders', item.id), {
                      status: 'accepted',
                      acceptedBy: user.uid
                    });
                    setOrders(prev => prev.filter(o => o.id !== item.id));
                  }}
                >
                  <Text style={styles.btnText}>Принять</Text>
                </Pressable>

                {/* Ставка — только пока не истёк таймер */}
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

      {/* Модал для ввода ставки */}
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
    justifyContent: 'space-between',
    marginTop: 10
  },
  acceptButton: {
    flex: 1,
    marginRight: 8,
    backgroundColor: '#4CAF50',
    padding: 10,
    borderRadius: 6,
    alignItems: 'center'
  },
  bidButton: {
    flex: 1,
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
