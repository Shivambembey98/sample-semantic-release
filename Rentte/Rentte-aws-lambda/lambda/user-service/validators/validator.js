const CryptoJS = require("crypto-js");
const SECRET_KEY = "D#4436Bqe2$%$#$%MC&^$@#^*&%I";

const encryptdata = (value) => {
   return CryptoJS.AES.encrypt(value, SECRET_KEY).toString();
};

const decryptData = (data) => {
   if (data === null) {return null;}
   const decryptedBytes = CryptoJS.AES.decrypt(data, SECRET_KEY);
   return decryptedBytes.toString(CryptoJS.enc.Utf8);
};

// Exporting the functions using module.exports
module.exports = {
   encryptdata,
   decryptData,
};
