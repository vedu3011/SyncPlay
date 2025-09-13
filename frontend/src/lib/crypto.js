// src/lib/crypto.js
// Utilities to encrypt/decrypt with AES-GCM using WebCrypto.

function b64ToArrayBuffer(b64) {
  const byteStr = atob(b64);
  const bytes = new Uint8Array(byteStr.length);
  for (let i=0;i<byteStr.length;i++) bytes[i] = byteStr.charCodeAt(i);
  return bytes.buffer;
}
function arrayBufferToB64(buf) {
  const bytes = new Uint8Array(buf);
  let str = ""; for (let b of bytes) str += String.fromCharCode(b);
  return btoa(str);
}

export async function importKeyFromB64(secretB64) {
  const keyRaw = b64ToArrayBuffer(secretB64);
  return await crypto.subtle.importKey("raw", keyRaw, "AES-GCM", false, ["encrypt","decrypt"]);
}

export async function encryptText(key, plaintext) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const enc = new TextEncoder().encode(plaintext);
  const buf = await crypto.subtle.encrypt({name:"AES-GCM", iv}, key, enc);
  return {
    iv_b64: arrayBufferToB64(iv),
    data_b64: arrayBufferToB64(buf),
  };
}

export async function decryptText(key, {iv_b64, data_b64}) {
  const iv = new Uint8Array(b64ToArrayBuffer(iv_b64));
  const data = b64ToArrayBuffer(data_b64);
  const dec = await crypto.subtle.decrypt({name:"AES-GCM", iv}, key, data);
  return new TextDecoder().decode(dec);
}
