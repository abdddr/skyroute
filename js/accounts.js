/* Browser-only course accounts. Separate records avoid overwriting another traveller's data. */
window.Travellers = (() => {
  'use strict';
  const prefix = 'skyroute:v1:';
  const userKey = email => prefix + 'account:' + email.trim().toLowerCase();
  const activeKey = prefix + 'signed-in';
  function active() {
    const email = localStorage.getItem(activeKey);
    return email ? JSON.parse(localStorage.getItem(userKey(email))) : null;
  }
  const hex = bytes => Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('');
  async function verifier(password, salt) {
    const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits']);
    const saltBytes = Uint8Array.from(salt.match(/../g), part => parseInt(part, 16));
    const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt: saltBytes, iterations: 210000, hash: 'SHA-256' }, key, 256);
    return hex(new Uint8Array(bits));
  }
  async function register(name, email, phone, password) {
    const key = userKey(email);
    const salt = hex(crypto.getRandomValues(new Uint8Array(16)));
    const hash = await verifier(password, salt);
    if (localStorage.getItem(key)) return false;
    localStorage.setItem(key, JSON.stringify({ name, email: email.trim().toLowerCase(), phone, salt, hash }));
    return true;
  }
  async function login(email, password) {
    const record = JSON.parse(localStorage.getItem(userKey(email)));
    if (!record || await verifier(password, record.salt) !== record.hash) return false;
    localStorage.setItem(activeKey, record.email);
    return true;
  }
  function saveTrip(trip) {
    const user = active();
    if (!user) return false;
    localStorage.setItem(prefix + 'trip:' + user.email + ':' + trip.reference, JSON.stringify(trip));
    return true;
  }
  function trips(email) {
    const start = prefix + 'trip:' + email + ':';
    return Object.keys(localStorage).filter(key => key.startsWith(start))
      .map(key => JSON.parse(localStorage.getItem(key))).sort((a, b) => b.created - a.created);
  }
  return { active, register, login, saveTrip, trips, logout: () => localStorage.removeItem(activeKey) };
})();
