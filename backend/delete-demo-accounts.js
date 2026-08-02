// Run this from your backend folder:
//   node delete-demo-accounts.js
//
// This permanently deletes all seed/demo accounts (and their related
// EditorProfile documents) from your MongoDB Atlas database.

require('dotenv').config();
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);
const mongoose = require('mongoose');

const DEMO_EMAILS = [
  'alex@client.com',
  'mia@client.com',
  'jordan@client.com',
  'sofia@editor.com',
  'marcus@editor.com',
  'elena@editor.com',
  'dev@editor.com',
  'zara@editor.com',
];

const run = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  const users = await mongoose.connection.collection('users')
    .find({ email: { $in: DEMO_EMAILS } })
    .toArray();

  if (users.length === 0) {
    console.log('No demo accounts found — nothing to delete.');
    await mongoose.disconnect();
    return;
  }

  const userIds = users.map(u => u._id);

  const profileResult = await mongoose.connection.collection('editorprofiles')
    .deleteMany({ user: { $in: userIds } });

  const userResult = await mongoose.connection.collection('users')
    .deleteMany({ email: { $in: DEMO_EMAILS } });

  console.log(`✅ Deleted ${userResult.deletedCount} demo user(s)`);
  console.log(`✅ Deleted ${profileResult.deletedCount} related editor profile(s)`);

  await mongoose.disconnect();
};

run().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});