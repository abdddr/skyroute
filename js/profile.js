(() => {
  'use strict';
  const byId = id => document.getElementById(id);
  function refresh() {
    let user;
    try { user = Travellers.active(); } catch { /* Storage may be disabled. */ }
    if (!user) {
      byId('profile-content').hidden = true;
      location.replace('account.html?profile=1');
      return;
    }
    for (const key of ['name', 'email', 'phone']) byId('profile-' + key).textContent = user[key];
    const list = byId('profile-trips');
    list.replaceChildren();
    const trips = Travellers.trips(user.email);
    if (!trips.length) list.textContent = 'Your confirmed demo trips will appear here.';
    for (const trip of trips) {
      const card = document.createElement('article');
      card.className = 'saved-trip';
      const title = document.createElement('h3');
      title.className = 'h5';
      title.textContent = 'Astana → ' + trip.destination;
      const details = document.createElement('p');
      details.textContent = [trip.flight, trip.departure, trip.tripType, trip.passengers + (trip.passengers === 1 ? ' traveller' : ' travellers')].filter(Boolean).join(' · ');
      const receipt = document.createElement('strong');
      receipt.textContent = trip.reference + ' · $' + trip.total + ' USD';
      card.append(title, details, receipt);
      list.append(card);
    }
    byId('profile-content').hidden = false;
  }
  byId('logout').addEventListener('click', () => {
    Travellers.logout();
    byId('profile-content').hidden = true;
    location.replace('account.html');
  });
  window.addEventListener('pageshow', refresh);
  window.addEventListener('storage', refresh);
  refresh();
})();
