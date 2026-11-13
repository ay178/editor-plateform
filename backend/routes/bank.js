const express = require('express');
const router = express.Router();
const BankAccount = require('../models/BankAccount');
const { auth, requireRole } = require('../middleware/auth');
const { encrypt } = require('../utils/secretBox');

// Never send the full account number back to the browser — only a masked version.
const toPublic = (acc) => acc ? {
  hasAccount: true,
  accountHolderName: acc.accountHolderName,
  bankName: acc.bankName,
  ifsc: acc.ifsc,
  accountNumberMasked: `${'X'.repeat(6)}${acc.accountLast4}`,
  updatedAt: acc.updatedAt
} : { hasAccount: false };

// GET /api/bank — current editor's bank account (masked)
router.get('/', auth, requireRole('editor'), async (req, res) => {
  try {
    res.json(toPublic(await BankAccount.findOne({ user: req.user._id })));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/bank — add or replace the bank account
// Body: { accountHolderName, bankName, accountNumber, confirmAccountNumber, ifsc }
router.put('/', auth, requireRole('editor'), async (req, res) => {
  try {
    const accountHolderName = String(req.body.accountHolderName || '').trim().replace(/\s+/g, ' ');
    const bankName = String(req.body.bankName || '').trim().replace(/\s+/g, ' ');
    const accountNumber = String(req.body.accountNumber || '').replace(/\s+/g, '');
    const confirm = String(req.body.confirmAccountNumber || '').replace(/\s+/g, '');
    const ifsc = String(req.body.ifsc || '').trim().toUpperCase();

    if (!/^[A-Za-z][A-Za-z .'-]{2,99}$/.test(accountHolderName))
      return res.status(400).json({ message: 'Enter the account holder name exactly as it appears at your bank' });
    if (bankName.length < 2 || bankName.length > 100)
      return res.status(400).json({ message: 'Enter your bank name' });
    if (!/^\d{9,18}$/.test(accountNumber))
      return res.status(400).json({ message: 'Account number must be 9 to 18 digits' });
    if (accountNumber !== confirm)
      return res.status(400).json({ message: 'Account numbers do not match' });
    if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifsc))
      return res.status(400).json({ message: 'Invalid IFSC code (example: SBIN0001234)' });

    const acc = await BankAccount.findOneAndUpdate(
      { user: req.user._id },
      {
        accountHolderName,
        bankName,
        accountNumberEncrypted: encrypt(accountNumber),
        accountLast4: accountNumber.slice(-4),
        ifsc,
        updatedAt: Date.now()
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    res.json({ ...toPublic(acc), message: 'Bank account saved' });
  } catch (err) {
    console.error('bank save error:', err.message);
    res.status(500).json({ message: 'Could not save bank account' });
  }
});

// DELETE /api/bank — remove the saved bank account
router.delete('/', auth, requireRole('editor'), async (req, res) => {
  try {
    await BankAccount.deleteOne({ user: req.user._id });
    res.json({ hasAccount: false, message: 'Bank account removed' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
