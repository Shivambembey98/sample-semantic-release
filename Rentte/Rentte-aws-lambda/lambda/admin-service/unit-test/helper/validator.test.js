const { encryptdata, decryptData } = require('../../helper/validator');
const CryptoJS = require('crypto-js');

describe('Crypto Helper', () => {
   const plainText = 'HelloWorld123';

   test('encryptdata should return an encrypted string', () => {
      const encrypted = encryptdata(plainText);
      expect(typeof encrypted).toBe('string');
      expect(encrypted).not.toBe(plainText);
   });

   test('decryptData should return original string when given encrypted data', () => {
      const encrypted = encryptdata(plainText);
      const decrypted = decryptData(encrypted);
      expect(decrypted).toBe(plainText);
   });

   test('decryptData should return null when passed null', () => {
      expect(decryptData(null)).toBeNull();
   });

   test('decryptData should fail or return invalid result with wrong key', () => {
      const encrypted = encryptdata(plainText);
      const wrongKey = 'WrongSecretKey123!';

      let wrongDecryption = '';
      try {
         // Try to decrypt with the wrong key
         const bytes = CryptoJS.AES.decrypt(encrypted, wrongKey);
         wrongDecryption = bytes.toString(CryptoJS.enc.Utf8);
      } catch (err) {
         wrongDecryption = '';
      }

      // It should definitely not return the original plain text
      expect(wrongDecryption).not.toBe(plainText);
   });
});
