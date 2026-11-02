/* index.js - search form on the home page (owner: Kagan Tasbolat)
   - sets today's date as the earliest date
   - enables the return date only for round trips
   - makes sure the return date is not before the departure date */
(function () {
  'use strict';

  var depart = document.getElementById('depart');
  var ret = document.getElementById('return');
  var oneway = document.getElementById('trip-oneway');
  var round = document.getElementById('trip-round');
  if (!depart || !ret || !oneway || !round) { return; }

  // Local date as YYYY-MM-DD (toISOString would use UTC and can be off by a day)
  function today() {
    var d = new Date();
    var m = String(d.getMonth() + 1).padStart(2, '0');
    var day = String(d.getDate()).padStart(2, '0');
    return d.getFullYear() + '-' + m + '-' + day;
  }

  function syncDates() {
    var isRound = round.checked;
    ret.disabled = !isRound;
    ret.required = isRound;
    if (!isRound) { ret.value = ''; }
    ret.min = depart.value || today();
    ret.setCustomValidity(
      isRound && ret.value && depart.value && ret.value < depart.value
        ? 'Return date cannot be before the departure date.'
        : ''
    );
  }

  depart.min = today();
  oneway.addEventListener('change', syncDates);
  round.addEventListener('change', syncDates);
  depart.addEventListener('change', syncDates);
  ret.addEventListener('change', syncDates);
  syncDates();
}());

/* ---------------------------------------------------------
   Tasks 3, 4 and 5 (owner: Kagan Tasbolat)
   Task 3: subscription pop-up   Task 4: background colour   Task 5: date and time
   --------------------------------------------------------- */
(function () {
  'use strict';

  /* ---------- Task 5. Current date and time ---------- */
  var clock = document.getElementById('datetime');
  if (clock) {
    var formatNow = function () {
      // e.g. "October 19, 2026, 1:01 PM"
      var now = new Date();
      return now.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) + ', ' +
             now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    };
    var tick = function () { clock.textContent = formatNow(); };
    tick();
    setInterval(tick, 1000); // keeps the time up to date while the page is open
  }

  /* ---------- Task 4. Change background colour ---------- */
  var colourBtn = document.getElementById('change-bg');
  if (colourBtn) {
    // Light colours only, so the dark text stays readable (WCAG AA)
    var COLOURS = ['#ffffff', '#e7f1ff', '#e8f5e9', '#fff8e1', '#fce4ec', '#f3e5f5'];
    var position = 0;
    colourBtn.addEventListener('click', function () {
      if (window.SkyRoute && window.SkyRoute.getTheme() === 'dark') { return; }   // night theme controls the colours
      position = (position + 1) % COLOURS.length;
      document.body.style.backgroundColor = COLOURS[position];
    });
    // The light colours do not fit the night theme, so the button is disabled there
    document.addEventListener('themechange', function (event) {
      colourBtn.disabled = event.detail === 'dark';
      position = 0;
    });
    colourBtn.disabled = !!(window.SkyRoute && window.SkyRoute.getTheme() === 'dark');
  }

  /* ---------- Task 3. Subscription pop-up ---------- */
  var overlay = document.getElementById('subscribe-popup');
  var openBtn = document.getElementById('open-subscribe');
  var closeBtn = document.getElementById('close-subscribe');
  var subForm = document.getElementById('subscribe-form');
  if (!overlay || !openBtn || !closeBtn || !subForm) { return; }

  var subName = document.getElementById('sub-name');
  var subEmail = document.getElementById('sub-email');
  var subAlert = document.getElementById('subscribe-alert');

  function openPopup() {
    overlay.hidden = false;
    document.body.classList.add('popup-open');
    subName.focus();
  }
  function closePopup() {
    overlay.hidden = true;
    document.body.classList.remove('popup-open');
    subAlert.replaceChildren();
    openBtn.focus(); // give focus back to the button that opened the pop-up
  }

  openBtn.addEventListener('click', openPopup);
  closeBtn.addEventListener('click', closePopup);
  // clicking the dark area outside the white box closes it
  overlay.addEventListener('click', function (event) {
    if (event.target === overlay) { closePopup(); }
  });
  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && !overlay.hidden) { closePopup(); }
  });

  function mark(input, ok) {
    input.classList.toggle('is-invalid', !ok);
    input.classList.toggle('is-valid', ok);
    return ok;
  }

  subForm.addEventListener('submit', function (event) {
    event.preventDefault();
    var okName = mark(subName, subName.value.trim().length >= 2);
    var okEmail = mark(subEmail, /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(subEmail.value.trim()));
    if (!okName || !okEmail) {
      (okName ? subEmail : subName).focus();
      return;
    }
    subAlert.replaceChildren();
    var done = document.createElement('div');
    done.className = 'alert alert-success';
    done.textContent = 'Thank you, ' + subName.value.trim() + '! You are subscribed (demo: nothing was sent).';
    subAlert.appendChild(done);
    subForm.reset();
    subName.classList.remove('is-valid');
    subEmail.classList.remove('is-valid');
  });
}());

/* ---------------------------------------------------------
   Assignment 5 (home page): greeting by time of day, travel tips
   --------------------------------------------------------- */
(function () {
  'use strict';

  /* ---------- Greeting: a switch on the current hour ---------- */
  var greeting = document.getElementById('greeting');
  if (greeting) {
    var hour = new Date().getHours();
    var part;
    switch (true) {
      case hour >= 5 && hour < 12:  part = 'Good morning'; break;
      case hour >= 12 && hour < 18: part = 'Good afternoon'; break;
      case hour >= 18 && hour < 23: part = 'Good evening'; break;
      default:                      part = 'Good night';
    }
    greeting.textContent = part + ', traveller! Where to next?';
  }

  /* ---------- Travel tips: array of objects + loop + higher-order function ---------- */
  var tipText = document.getElementById('tip-text');
  var tipBtn = document.getElementById('next-tip');
  if (!tipText || !tipBtn) { return; }

  var TIPS = [
    { city: 'Almaty',    text: 'Take the cable car up Kok-Tobe at sunset for the best view of the city.' },
    { city: 'Shymkent',  text: 'Visit the Shymkent bazaar in the morning, when the fruit is freshest.' },
    { city: 'Aktau',     text: 'Bring a jacket: the Caspian wind is cool even in summer.' },
    { city: 'Turkistan', text: 'Book your visit to the Yasawi Mausoleum early to avoid the afternoon crowds.' },
    { city: 'Karagandy', text: 'Ask locals about the coal-mining museum, a surprising local highlight.' },
    { city: 'Kokshetau', text: 'The lakes and pine forests nearby are ideal for a quiet weekend.' },
    { city: 'Oskemen',   text: 'Oskemen is the gateway to the Altai mountains. Pack hiking shoes.' },
    { city: 'Pavlodar',  text: 'Walk along the Irtysh embankment in the evening.' },
    { city: 'Atyrau',    text: 'Cross the Ural river on foot: it is the border between Europe and Asia.' }
  ];
  var shown = -1;

  function showTip() {
    var next;
    do { next = Math.floor(Math.random() * TIPS.length); } while (next === shown && TIPS.length > 1);
    shown = next;
    var tip = TIPS[next];
    tipText.textContent = tip.city + ': ' + tip.text;
    // restart the CSS animation every time the text changes
    tipText.classList.remove('tip-swap');
    void tipText.offsetWidth;
    tipText.classList.add('tip-swap');
  }

  tipBtn.addEventListener('click', showTip);
  showTip();

  /* Higher-order function: forEach takes a function that makes each city's cards link to its tip */
  TIPS.forEach(function (tip) {
    var links = document.querySelectorAll('a[href="booking.html?destination=' + tip.city + '"]');
    Array.prototype.forEach.call(links, function (link) {
      link.title = tip.text;   // shows the tip as a tooltip on "View Flights" buttons
    });
  });
}());
