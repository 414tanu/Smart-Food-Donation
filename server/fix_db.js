const mongoose = require('mongoose');

mongoose.connect('mongodb://127.0.0.1:27017/foodbridge' || process.env.MONGO_URI).then(async () => {
  const db = mongoose.connection.db;
  const donations = await db.collection('donations').find({ verificationPin: { $exists: false } }).toArray();
  for (let d of donations) {
    const pin = Math.floor(1000 + Math.random() * 9000).toString();
    await db.collection('donations').updateOne({ _id: d._id }, { $set: { verificationPin: pin } });
  }
  console.log('Updated verification pins.');
  process.exit(0);
}).catch(console.error);
