/* booking.js - results + passenger form on the Booking page (owner: Abdrakhman Almukhan)
   1. reads the search from the URL (?destination=Almaty&passengers=2 ...)
   2. builds three nonstop flights from Astana to that destination
   3. lets the user choose one, shows a live total, and confirms the booking */
(function () {
  'use strict';

  /* ---------- Data ---------- */
  var ORIGIN = { name: 'Astana', code: 'NQZ' };
  // minutes = flight time, base = cheapest fare (matches the Destinations page)
  var DESTINATIONS = {
    almaty:    { name: 'Almaty',    code: 'ALA', minutes: 110, base: 39 },
    shymkent:  { name: 'Shymkent',  code: 'CIT', minutes: 130, base: 38 },
    aktau:     { name: 'Aktau',     code: 'SCO', minutes: 160, base: 55 },
    turkistan: { name: 'Turkistan', code: 'HSA', minutes: 125, base: 42 },
    karagandy: { name: 'Karagandy', code: 'KGF', minutes: 65,  base: 30 },
    kokshetau: { name: 'Kokshetau', code: 'KOV', minutes: 60,  base: 28 },
    oskemen:   { name: 'Oskemen',   code: 'UKK', minutes: 115, base: 60 },
    pavlodar:  { name: 'Pavlodar',  code: 'PWQ', minutes: 75,  base: 35 },
    atyrau:    { name: 'Atyrau',    code: 'GUW', minutes: 150, base: 65 }
  };
  var KEYS = Object.keys(DESTINATIONS);
  var DEPARTURES = [
    { number: 101, time: '08:00', extra: 6 },
    { number: 204, time: '13:15', extra: 13 },
    { number: 318, time: '19:40', extra: 0 }
  ];
  var CLASS_FACTOR = { economy: 1, business: 2 };
  var BAGGAGE_FEE = 15;

  /* ---------- Page elements ---------- */
  var refineForm = document.getElementById('refine-form');
  var selDestination = document.getElementById('b-destination');
  var selPassengers = document.getElementById('b-passengers');
  var selClass = document.getElementById('b-class');
  var inpMaxPrice = document.getElementById('b-maxprice');
  var routeSummary = document.getElementById('route-summary');
  var flightList = document.getElementById('flight-list');
  var bookingForm = document.getElementById('booking-form');
  var summaryBox = document.getElementById('booking-summary');
  var alertBox = document.getElementById('booking-alert');
  var baggage = document.getElementById('baggage');
  if (!refineForm || !flightList || !bookingForm) { return; }

  /* ---------- Helpers ---------- */
  function keyFromName(text) {
    var key = String(text).split('(')[0].trim().toLowerCase();
    return DESTINATIONS[key] ? key : null;
  }
  function clampPax(value) {
    var n = parseInt(value, 10);
    return n >= 1 && n <= 4 ? n : 1;
  }
  function toPrice(value) {
    var n = parseFloat(value);
    return n > 0 ? n : null;
  }
  function el(tag, css, text) {
    var node = document.createElement(tag);
    if (css) { node.className = css; }
    if (text !== undefined) { node.textContent = text; }
    return node;
  }
  function pad(n) { return String(n).padStart(2, '0'); }
  function addMinutes(time, minutes) {
    var parts = time.split(':');
    var total = (parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10) + minutes) % (24 * 60);
    return pad(Math.floor(total / 60)) + ':' + pad(total % 60);
  }
  function duration(minutes) {
    return Math.floor(minutes / 60) + ' h ' + pad(minutes % 60) + ' min';
  }
  function prettyDate(iso) {
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
    if (!m) { return ''; }
    var d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  }
  function classLabel(cls) { return cls === 'business' ? 'Business' : 'Economy'; }
  function plural(n, word) { return n + ' ' + word + (n === 1 ? '' : 's'); }

  /* ---------- State (read from the URL) ---------- */
  var params = new URLSearchParams(window.location.search);
  var state = {
    destKey: null,
    unknownName: '',
    pax: clampPax(params.get('passengers')),
    cls: params.get('class') === 'business' ? 'business' : 'economy',
    maxPrice: toPrice(params.get('maxprice')),
    trip: params.get('trip') === 'round' ? 'round' : 'oneway',
    depart: params.get('depart') || '',
    ret: params.get('return') || '',
    flexible: params.get('flexible') === 'yes'
  };
  var sortMode = 'time';  // 'time' or 'price' (sort buttons)
  var flights = [];       // flights currently shown
  var selected = null;    // flight the user chose

  var rawDest = params.get('destination');
  if (!rawDest) {
    state.destKey = 'almaty';
  } else if (keyFromName(rawDest)) {
    state.destKey = keyFromName(rawDest);
  } else {
    state.unknownName = rawDest;
  }

  function buildFlights(key) {
    var dest = DESTINATIONS[key];
    var index = KEYS.indexOf(key);
    return DEPARTURES.map(function (dep) {
      return {
        id: key + '-' + dep.number,
        label: 'SkyRoute Air ' + (dep.number + index),
        from: dep.time,
        to: addMinutes(dep.time, dest.minutes),
        minutes: dest.minutes,
        fare: (dest.base + dep.extra) * CLASS_FACTOR[state.cls],
        dest: dest
      };
    });
  }

  /* ---------- Rendering ---------- */
  function renderSummaryLine() {
    routeSummary.replaceChildren();
    if (!state.destKey) {
      routeSummary.appendChild(el('p', 'mb-0', state.unknownName
        ? 'Sorry, SkyRoute does not fly to "' + state.unknownName + '" yet. Please choose one of our nine destinations.'
        : 'Choose a destination to see available flights.'));
      return;
    }
    var dest = DESTINATIONS[state.destKey];
    var bits = [
      ORIGIN.name + ' (' + ORIGIN.code + ') to ' + dest.name + ' (' + dest.code + ')',
      plural(state.pax, 'passenger'),
      classLabel(state.cls),
      state.trip === 'round' ? 'Round trip' : 'One-way'
    ];
    if (state.depart && prettyDate(state.depart)) { bits.push('Departing ' + prettyDate(state.depart)); }
    if (state.trip === 'round' && prettyDate(state.ret)) { bits.push('Returning ' + prettyDate(state.ret)); }
    if (state.flexible) { bits.push('Dates flexible (+/- 3 days)'); }
    routeSummary.appendChild(el('p', 'mb-0', bits.join(' | ')));
  }

  function renderFlights() {
    flightList.replaceChildren();
    selected = null;
    renderSummaryLine();

    if (!state.destKey) {
      flights = [];
      updateSummary();
      return;
    }

    var all = buildFlights(state.destKey);
    flights = all.filter(function (f) {
      return state.maxPrice === null || f.fare <= state.maxPrice;
    });

    if (flights.length === 0) {
      var cheapest = Math.min.apply(null, all.map(function (f) { return f.fare; }));
      flightList.appendChild(el('div', 'alert alert-warning mb-0',
        'No flights found under $' + state.maxPrice + '. The cheapest fare on this route is $' + cheapest + '. Raise the maximum price to see flights.'));
      updateSummary();
      return;
    }

    // Sort with a higher-order function; a switch picks the comparison
    flights.sort(function (a, b) {
      switch (sortMode) {
        case 'price': return a.fare - b.fare;
        default:      return a.from < b.from ? -1 : 1;
      }
    });

    flights.forEach(function (f, i) {
      var card = el('article', 'card ticket mb-3 fade-in-up');
      card.style.animationDelay = (i * 0.1) + 's';   // cards appear one after another
      var body = el('div', 'card-body d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3');

      var info = el('div');
      info.appendChild(el('p', 'fw-bold fs-5 mb-1',
        ORIGIN.name + ' (' + ORIGIN.code + ') \u2192 ' + f.dest.name + ' (' + f.dest.code + ')'));
      info.appendChild(el('p', 'text-secondary small mb-0',
        f.label + ' \u00B7 ' + f.from + ' - ' + f.to + ' \u00B7 Nonstop \u00B7 ' + duration(f.minutes)));

      var stub = el('div', 'ticket-stub d-flex align-items-center justify-content-between gap-3 ps-md-4');
      var price = el('p', 'fw-bold fs-4 text-primary mb-0', '$' + f.fare + ' ');
      price.appendChild(el('span', 'fs-6 fw-normal text-secondary', 'per passenger, one-way'));

      var radio = el('input', 'btn-check');
      radio.type = 'radio';
      radio.name = 'flight';
      radio.id = 'flight-' + i;
      radio.value = f.id;
      radio.autocomplete = 'off';
      var label = el('label', 'btn btn-outline-primary');
      label.htmlFor = radio.id;
      label.appendChild(document.createTextNode('Select'));
      label.appendChild(el('span', 'visually-hidden', ' ' + f.label + ' at ' + f.from));
      radio.addEventListener('change', function () {
        selected = f;
        clearAlert();
        updateSummary();
        if (window.SkyRoute) { window.SkyRoute.playSound('click'); }
      });

      stub.appendChild(price);
      stub.appendChild(radio);
      stub.appendChild(label);
      body.appendChild(info);
      body.appendChild(stub);
      card.appendChild(body);
      flightList.appendChild(card);
    });
    updateSummary();
  }

  function total() {
    if (!selected) { return 0; }
    var legs = state.trip === 'round' ? 2 : 1;
    return selected.fare * state.pax * legs + (baggage.checked ? BAGGAGE_FEE : 0);
  }

  function updateSummary() {
    summaryBox.replaceChildren();
    summaryBox.appendChild(el('h3', 'h6 mb-2', 'Your booking'));
    if (!selected) {
      summaryBox.appendChild(el('p', 'mb-0 text-secondary', 'No flight selected yet. Choose a flight above.'));
      return;
    }
    summaryBox.appendChild(el('p', 'mb-1',
      selected.label + ', ' + selected.from + ' - ' + selected.to + ' | ' +
      plural(state.pax, 'passenger') + ' | ' + classLabel(state.cls) + ' | ' +
      (state.trip === 'round' ? 'Round trip' : 'One-way')));
    if (baggage.checked) {
      summaryBox.appendChild(el('p', 'mb-1', 'Extra baggage: $' + BAGGAGE_FEE));
    }
    summaryBox.appendChild(el('p', 'fw-bold fs-5 mb-0', 'Total: $' + total()));
  }

  /* ---------- Alerts ---------- */
  function clearAlert() { alertBox.replaceChildren(); }
  function showAlert(type, message) {
    clearAlert();
    var box = el('div', 'alert alert-' + type + ' mb-0', message);
    box.classList.add(type === 'success' ? 'bounce-in' : 'shake');
    if (window.SkyRoute) { window.SkyRoute.playSound(type === 'success' ? 'success' : 'error'); }
    box.tabIndex = -1;
    alertBox.appendChild(box);
    box.focus();
  }

  /* ---------- Events ---------- */
  refineForm.addEventListener('submit', function (event) {
    event.preventDefault();
    state.destKey = selDestination.value || null;
    state.unknownName = '';
    state.pax = clampPax(selPassengers.value);
    state.cls = selClass.value === 'business' ? 'business' : 'economy';
    state.maxPrice = toPrice(inpMaxPrice.value);
    clearAlert();
    renderFlights();

    // keep the address bar in sync so the page can be refreshed or shared
    var next = new URLSearchParams(window.location.search);
    if (state.destKey) { next.set('destination', DESTINATIONS[state.destKey].name); }
    next.set('passengers', state.pax);
    next.set('class', state.cls);
    if (state.maxPrice) { next.set('maxprice', state.maxPrice); } else { next.delete('maxprice'); }
    window.history.replaceState(null, '', '?' + next.toString());
  });

  baggage.addEventListener('change', updateSummary);

  /* ---------- Sort buttons (Assignment 5) ---------- */
  var sortGroup = document.getElementById('sort-group');
  if (sortGroup) {
    sortGroup.addEventListener('click', function (event) {
      var btn = event.target.closest('button[data-sort]');
      if (!btn) { return; }
      sortMode = btn.dataset.sort;
      Array.prototype.forEach.call(sortGroup.querySelectorAll('button[data-sort]'), function (b) {
        var on = b === btn;
        b.classList.toggle('active', on);
        b.setAttribute('aria-pressed', on ? 'true' : 'false');
      });
      renderFlights();
    });
  }

  /* ---------- Clear button (Assignment 5): empties every passenger field ---------- */
  var resetBtn = document.getElementById('reset-booking');
  if (resetBtn) {
    resetBtn.addEventListener('click', function () {
      bookingForm.querySelectorAll('input[type="text"], input[type="email"]').forEach(function (input) {
        input.value = '';
      });
      bookingForm.querySelectorAll('input[type="checkbox"]').forEach(function (box) { box.checked = false; });
      document.getElementById('meal-standard').checked = true;
      document.getElementById('seat').value = 'window';
      bookingForm.classList.remove('was-validated');
      clearAlert();
      updateSummary();
      document.getElementById('fullname').focus();
    });
  }

  bookingForm.addEventListener('submit', function (event) {
    event.preventDefault();
    clearAlert();

    if (!selected) {
      showAlert('danger', 'Please choose a flight above before confirming your booking.');
      return;
    }
    if (!bookingForm.checkValidity()) {
      bookingForm.classList.add('was-validated');
      showAlert('danger', 'Please correct the highlighted fields.');
      var firstBad = bookingForm.querySelector(':invalid');
      if (firstBad) { firstBad.focus(); }
      return;
    }

    var chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    var ref = 'SR-';
    for (var i = 0; i < 6; i += 1) { ref += chars.charAt(Math.floor(Math.random() * chars.length)); }
    var name = document.getElementById('fullname').value.trim();
    var message = 'Booking confirmed, ' + name + '! Your reference is ' + ref + ' for ' + selected.label +
      ' to ' + selected.dest.name + ', total $' + total() +
      '. This is a demo project, so no data is stored or sent.';

    bookingForm.classList.remove('was-validated');
    bookingForm.reset();
    var chosen = flightList.querySelector('input[name="flight"]:checked');
    if (chosen) { chosen.checked = false; }
    selected = null;
    updateSummary();
    showAlert('success', message);
  });

  /* ---------- Start ---------- */
  selDestination.value = state.destKey || '';
  selPassengers.value = String(state.pax);
  selClass.value = state.cls;
  inpMaxPrice.value = state.maxPrice !== null ? String(state.maxPrice) : '';
  renderFlights();
}());
