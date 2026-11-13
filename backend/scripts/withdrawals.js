#!/usr/bin/env node
// Admin helper for processing editor withdrawals.
//
//   node scripts/withdrawals.js list                 show pending withdrawals + bank details
//   node scripts/withdrawals.js paid <id> <utr>      mark one as paid (after you send the money)
//   node scripts/withdrawals.js failed <id>          mark failed and refund the amount to the editor's wallet
//
// Run it from the backend/ folder with the same .env (MONGODB_URI, JWT_SECRET / BANK_ENCRYPTION_KEY).
// It prints full account numbers, so run it only on a machine you trust.

require('dotenv').config();
const mongoose = require('mongoose');
const WithdrawalRequest = require('../models/WithdrawalRequest');
const Wallet = require('../models/Wallet');
const User = require('../models/User');
const { decrypt } = require('../utils/secretBox');

const [, , cmd, id, ref] = process.argv;

(async () => {
  await mongoose.connect(process.env.MONGODB_URI);

  if (cmd === 'list') {
    const pending = await WithdrawalRequest.find({ status: 'pending' }).sort({ createdAt: 1 });
    if (!pending.length) console.log('No pending withdrawals.');
    for (const w of pending) {
      const u = await User.findById(w.user).select('name email');
      let acct = '(cannot decrypt — encryption key changed?)';
      try { acct = decrypt(w.bank.accountNumberEncrypted); } catch (_) {}
      console.log(`\nID:       ${w._id}`);
      console.log(`Editor:   ${u ? `${u.name} <${u.email}>` : w.user}`);
      console.log(`Amount:   ₹${w.amount}`);
      console.log(`Name:     ${w.bank.accountHolderName}`);
      console.log(`Bank:     ${w.bank.bankName}`);
      console.log(`Account:  ${acct}`);
      console.log(`IFSC:     ${w.bank.ifsc}`);
      console.log(`Requested ${w.createdAt.toISOString()}`);
    }
  } else if (cmd === 'paid' && id) {
    const w = await WithdrawalRequest.findOneAndUpdate(
      { _id: id, status: 'pending' },
      { status: 'paid', payoutReference: ref || '', paidAt: new Date() }
    );
    if (!w) { console.log('Not found or not pending.'); }
    else {
      await Wallet.updateOne(
        { user: w.user, 'transactions._id': w.transactionId },
        { $set: { 'transactions.$.status': 'completed' } }
      );
      console.log(`Marked ${id} as paid.`);
    }
  } else if (cmd === 'failed' && id) {
    const w = await WithdrawalRequest.findOneAndUpdate({ _id: id, status: 'pending' }, { status: 'failed' });
    if (!w) { console.log('Not found or not pending.'); }
    else {
      await Wallet.updateOne(
        { user: w.user, 'transactions._id': w.transactionId },
        {
          $inc: { balance: w.amount },
          $set: { 'transactions.$.status': 'failed' }
        }
      );
      console.log(`Marked ${id} as failed and refunded ₹${w.amount} to the editor's wallet.`);
    }
  } else {
    console.log('Usage: node scripts/withdrawals.js list | paid <id> <utr> | failed <id>');
  }

  await mongoose.disconnect();
})().catch(e => { console.error(e.message); process.exit(1); });
