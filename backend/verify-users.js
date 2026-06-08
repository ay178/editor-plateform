require('dotenv').config();
const mongoose = require('mongoose');
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const result = await mongoose.connection.collection('users').updateMany(
    { isVerified: { $ne: true } },
    { $set: { isVerified: true } }
  );
  console.log('✅ Users verified:', result.modifiedCount);
  process.exit(0);
}).catch(err => { console.error(err); process.exit(1); });