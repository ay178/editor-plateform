const crypto = require('crypto');

// AES-256-GCM encryption for sensitive values stored in MongoDB (bank account numbers).
// Key comes from BANK_ENCRYPTION_KEY (recommended — any long random string); if that is
// not set it falls back to JWT_SECRET so the feature works out of the box.
//
// IMPORTANT: if you change the key later, previously saved account numbers can no longer
// be decrypted (editors would have to re-enter them).

const getKey = () => {
  const secret = process.env.BANK_ENCRYPTION_KEY || process.env.JWT_SECRET;
  if (!secret) throw new Error('BANK_ENCRYPTION_KEY (or JWT_SECRET) must be set to store bank details');
  return crypto.createHash('sha256').update(secret).digest();
};

// Output format: base64(iv) . base64(authTag) . base64(ciphertext)
const encrypt = (plain) => {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', getKey(), iv);
  const enc = Buffer.concat([cipher.update(String(plain), 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return [iv, tag, enc].map(b => b.toString('base64')).join('.');
};

const decrypt = (payload) => {
  const [iv, tag, enc] = String(payload).split('.').map(p => Buffer.from(p, 'base64'));
  const decipher = crypto.createDecipheriv('aes-256-gcm', getKey(), iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(enc), decipher.final()]).toString('utf8');
};

module.exports = { encrypt, decrypt };
