// functions/index.js
const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

exports.closeAuctions = functions.pubsub
  .schedule('every 1 minutes')
  .onRun(async () => {
    const db = admin.firestore();
    const now = admin.firestore.Timestamp.now();

    // Обрабатываем оба типа заказов: productOrders и laborOrders
    for (const col of ['productOrders', 'laborOrders']) {
      const snap = await db.collection(col)
        .where('status', '==', 'pending')
        .where('auctionEndTime', '<=', now)
        .get();

      const batch = db.batch();
      snap.forEach(doc => {
        const data = doc.data();
        const bids = data.bids || [];
        if (bids.length === 0) {
          batch.update(doc.ref, { status: 'closed', winningBid: null });
        } else {
          const win = bids.reduce((min, b) => b.amount < min.amount ? b : min, bids[0]);
          batch.update(doc.ref, {
            status: 'closed',
            winningBid: {
              bidder: win.bidder,
              amount: win.amount,
              createdAt: win.createdAt
            },
            closedAt: now
          });
        }
      });
      await batch.commit();
    }

    return null;
  });
