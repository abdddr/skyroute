/* site.js - shared by all four pages (Assignment 5)
   1. Day / Night theme switch (class-based, remembered between visits)
   2. Sound effects (Web Audio API, no files needed) with a mute button
   3. Keyboard navigation for the navbar (arrow keys, Home, End)
   Other scripts use it through the global object window.SkyRoute. */
(function () {
  'use strict';

  var root = document.documentElement;
  var STORE_THEME = 'skyroute-theme';
  var STORE_MUTE = 'skyroute-muted';

  /* ---------- tiny safe wrappers around localStorage ---------- */
  function read(key) {
    try { return window.localStorage.getItem(key); } catch (e) { return null; }
  }
  function write(key, value) {
    try { window.localStorage.setItem(key, value); } catch (e) { /* private mode: ignore */ }
  }

  /* =====================================================
     1. Day / Night theme
     Bootstrap 5.3 restyles everything when <html data-bs-theme="dark">.
     styles.css adds the few custom colours that need to change too.
     ===================================================== */
  var theme = read(STORE_THEME) === 'dark' ? 'dark' : 'light';

  function applyTheme(next) {
    theme = next;
    root.setAttribute('data-bs-theme', theme);
    document.body.style.backgroundColor = '';   // clear the colour picked by the "Change background" button
    write(STORE_THEME, theme);
    document.dispatchEvent(new CustomEvent('themechange', { detail: theme }));
  }

  /* ---------- Sound settings ---------- */
  var muted = read(STORE_MUTE) === 'yes';

  /* =====================================================
     2. Sound effects
     Each sound is an object: a list of notes (frequency in Hz, length in seconds).
     Only one sound plays at a time, so sounds never overlap.
     ===================================================== */
  var SOUNDS = {
    click:   { type: 'sine',     notes: [{ f: 660, d: 0.06 }] },
    success: { type: 'triangle', notes: [{ f: 523, d: 0.1 }, { f: 659, d: 0.1 }, { f: 784, d: 0.18 }] },
    error:   { type: 'sawtooth', notes: [{ f: 220, d: 0.12 }, { f: 160, d: 0.18 }] },
    star:    { type: 'sine',     notes: [{ f: 880, d: 0.08 }] },
    toggle:  { type: 'square',   notes: [{ f: 440, d: 0.05 }, { f: 587, d: 0.07 }] }
  };

  var audioCtx = null;
  var currentStop = null;   // function that silences the sound that is playing now

  function playSound(name, pitchStep) {
    var sound = SOUNDS[name];
    if (muted || !sound) { return; }
    var Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) { return; }
    try {
      if (!audioCtx) { audioCtx = new Ctx(); }
      if (audioCtx.state === 'suspended') { audioCtx.resume(); }
      if (currentStop) { currentStop(); }                     // stop the previous sound first

      var osc = audioCtx.createOscillator();
      var gain = audioCtx.createGain();
      var start = audioCtx.currentTime;
      var at = start;
      var multiplier = Math.pow(2, (pitchStep || 0) / 12);    // lets stars rise in pitch

      osc.type = sound.type;
      gain.gain.value = 0.06;                                 // keep it quiet
      sound.notes.forEach(function (note) {
        osc.frequency.setValueAtTime(note.f * multiplier, at);
        at += note.d;
      });
      gain.gain.setValueAtTime(0.06, at - 0.02);
      gain.gain.linearRampToValueAtTime(0.0001, at);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(start);
      osc.stop(at);
      currentStop = function () { try { osc.stop(); } catch (e) { /* already stopped */ } };
      osc.onended = function () { if (currentStop) { currentStop = null; } };
    } catch (e) { /* audio not available: the site still works */ }
  }

  /* ---------- Navbar buttons (added by JS so every page gets the same ones) ---------- */
  function makeNavButton(id, label) {
    var item = document.createElement('li');
    item.className = 'nav-item ms-lg-2 d-flex align-items-center';
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.id = id;
    btn.className = 'btn btn-outline-light btn-sm nav-tool my-1 my-lg-0';
    btn.textContent = label;
    item.appendChild(btn);
    return { item: item, button: btn };
  }

  function updateThemeButton(btn) {
    var dark = theme === 'dark';
    btn.textContent = dark ? 'Day mode' : 'Night mode';
    btn.setAttribute('aria-pressed', dark ? 'true' : 'false');
    btn.setAttribute('aria-label', dark ? 'Switch to day theme' : 'Switch to night theme');
  }
  function updateSoundButton(btn) {
    btn.textContent = muted ? 'Sound off' : 'Sound on';
    btn.setAttribute('aria-pressed', muted ? 'false' : 'true');
    btn.setAttribute('aria-label', muted ? 'Turn sound effects on' : 'Turn sound effects off');
  }

  var navList = document.querySelector('#mainNavbar .navbar-nav');
  if (navList) {
    var themeTool = makeNavButton('theme-toggle', '');
    var soundTool = makeNavButton('sound-toggle', '');
    navList.appendChild(themeTool.item);
    navList.appendChild(soundTool.item);

    themeTool.button.addEventListener('click', function () {
      applyTheme(theme === 'dark' ? 'light' : 'dark');
      updateThemeButton(themeTool.button);
      playSound('toggle');
    });
    soundTool.button.addEventListener('click', function () {
      muted = !muted;
      write(STORE_MUTE, muted ? 'yes' : 'no');
      updateSoundButton(soundTool.button);
      playSound('toggle');
    });
    updateThemeButton(themeTool.button);
    updateSoundButton(soundTool.button);
  }
  applyTheme(theme);

  /* ---------- A soft click for every normal button on the site ---------- */
  document.addEventListener('click', function (event) {
    var btn = event.target.closest('button.btn');
    if (!btn || btn.classList.contains('nav-tool') || btn.classList.contains('star-btn')) { return; }
    if (btn.type === 'submit') { return; }   // forms play their own success or error sound
    playSound('click');
  });

  /* =====================================================
     3. Keyboard navigation for the navbar
     When a menu link has focus: arrows move between links,
     Home and End jump to the first and last link.
     ===================================================== */
  var menuItems = Array.prototype.slice.call(
    document.querySelectorAll('#mainNavbar .nav-link, #mainNavbar .nav-tool')
  );

  document.addEventListener('keydown', function (event) {
    var index = menuItems.indexOf(document.activeElement);
    if (index === -1) { return; }
    var target;

    switch (event.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        target = menuItems[(index + 1) % menuItems.length];
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
        target = menuItems[(index - 1 + menuItems.length) % menuItems.length];
        break;
      case 'Home':
        target = menuItems[0];
        break;
      case 'End':
        target = menuItems[menuItems.length - 1];
        break;
      default:
        return;   // any other key: do nothing
    }
    event.preventDefault();
    target.focus();
  });

  /* ---------- Public API for the other scripts ---------- */
  window.SkyRoute = {
    playSound: playSound,
    getTheme: function () { return theme; }
  };
}());
