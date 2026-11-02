/* about.js - About page (owner: Abdrakhman Almukhan)
   Task 1: sign-up form validation (required fields, email format, password rules, confirmation)
   Task 2: FAQ accordion (answers hidden by default, click to show or hide, smooth transition)
   Also: contact form validation (demo: nothing is sent). */
(function () {
  'use strict';

  /* =====================================================
     Task 2. Accordion
     CSS (.faq-answer) keeps every answer collapsed with max-height: 0.
     JS sets max-height to the real content height to open it and back to 0 to close it,
     so the browser animates the change smoothly.
     ===================================================== */
  var questions = document.querySelectorAll('.faq-question');

  function setOpen(button, open) {
    var panel = document.getElementById(button.getAttribute('aria-controls'));
    var icon = button.querySelector('.faq-icon');
    button.setAttribute('aria-expanded', open ? 'true' : 'false');
    panel.style.maxHeight = open ? panel.scrollHeight + 'px' : '0px';
    if (icon) { icon.textContent = open ? '−' : '+'; }
  }

  Array.prototype.forEach.call(questions, function (button) {
    setOpen(button, false); // hidden by default
    button.addEventListener('click', function () {
      // clicking again hides the answer, clicking a closed one shows it
      setOpen(button, button.getAttribute('aria-expanded') !== 'true');
    });
  });

  // Keep open panels the right height if the window is resized (text re-wraps)
  window.addEventListener('resize', function () {
    Array.prototype.forEach.call(questions, function (button) {
      if (button.getAttribute('aria-expanded') === 'true') { setOpen(button, true); }
    });
  });

  /* =====================================================
     Shared helpers for the forms
     ===================================================== */
  function showAlert(box, type, message) {
    box.replaceChildren();
    var alertEl = document.createElement('div');
    alertEl.className = 'alert alert-' + type + ' mb-0';
    alertEl.tabIndex = -1;
    alertEl.textContent = message;
    box.appendChild(alertEl);
    alertEl.focus();
  }

  // Marks a field valid or invalid and writes the message under it
  function setError(input, message) {
    var out = document.getElementById(input.id + '-error');
    if (message) {
      input.classList.add('is-invalid');
      input.classList.remove('is-valid');
      input.setAttribute('aria-invalid', 'true');
      if (out) { out.textContent = message; }
    } else {
      input.classList.remove('is-invalid');
      input.classList.add('is-valid');
      input.removeAttribute('aria-invalid');
      if (out) { out.textContent = ''; }
    }
    return !message;
  }

  var EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  /* =====================================================
     Task 1. Sign-up form validation
     ===================================================== */
  var signup = document.getElementById('signup-form');
  if (signup) {
    var suName = document.getElementById('su-name');
    var suEmail = document.getElementById('su-email');
    var suPass = document.getElementById('su-password');
    var suConfirm = document.getElementById('su-confirm');
    var suAlert = document.getElementById('signup-alert');

    var checkName = function () {
      var v = suName.value.trim();
      if (!v) { return setError(suName, 'Please enter your full name.'); }
      if (v.length < 2) { return setError(suName, 'Your name must be at least 2 characters long.'); }
      return setError(suName, '');
    };
    var checkEmail = function () {
      var v = suEmail.value.trim();
      if (!v) { return setError(suEmail, 'Please enter your email address.'); }
      if (!EMAIL_PATTERN.test(v)) { return setError(suEmail, 'Enter a valid email address, for example name@example.com.'); }
      return setError(suEmail, '');
    };
    var checkPassword = function () {
      var v = suPass.value;
      if (!v) { return setError(suPass, 'Please enter a password.'); }
      if (v.length < 8) { return setError(suPass, 'The password must be at least 8 characters long (now ' + v.length + ').'); }
      if (!/[A-Za-z]/.test(v) || !/[0-9]/.test(v)) { return setError(suPass, 'The password must contain at least one letter and one number.'); }
      return setError(suPass, '');
    };
    var checkConfirm = function () {
      var v = suConfirm.value;
      if (!v) { return setError(suConfirm, 'Please confirm your password.'); }
      if (v !== suPass.value) { return setError(suConfirm, 'The passwords do not match.'); }
      return setError(suConfirm, '');
    };

    // Live feedback once the user leaves a field, and while fixing a field that is already wrong
    [[suName, checkName], [suEmail, checkEmail], [suPass, checkPassword], [suConfirm, checkConfirm]].forEach(function (pair) {
      pair[0].addEventListener('blur', pair[1]);
      pair[0].addEventListener('input', function () {
        if (pair[0].classList.contains('is-invalid')) { pair[1](); }
      });
    });
    suPass.addEventListener('input', function () {
      if (suConfirm.value) { checkConfirm(); }
    });

    signup.addEventListener('submit', function (event) {
      event.preventDefault();
      var results = [checkName(), checkEmail(), checkPassword(), checkConfirm()];
      if (results.indexOf(false) !== -1) {
        showAlert(suAlert, 'danger', 'Please correct the highlighted fields.');
        var firstBad = signup.querySelector('.is-invalid');
        if (firstBad) { firstBad.focus(); }
        return;
      }
      showAlert(suAlert, 'success', 'Account created for ' + suName.value.trim() + '! This is a demo project, so nothing was saved or sent.');
      signup.reset();
      Array.prototype.forEach.call(signup.querySelectorAll('.is-valid, .is-invalid'), function (f) {
        f.classList.remove('is-valid', 'is-invalid');
      });
    });
  }

  /* =====================================================
     Assignment 5. Star rating
     querySelectorAll selects all the stars; clicking one colours it and every
     star before it, and the message below changes with a switch statement.
     ===================================================== */
  var stars = document.querySelectorAll('.star-btn');
  var ratingMessage = document.getElementById('rating-message');

  function paintStars(count) {
    Array.prototype.forEach.call(stars, function (star) {
      var on = Number(star.dataset.value) <= count;
      star.classList.toggle('active', on);
    });
  }

  function ratingText(value) {
    switch (value) {
      case 1: return 'Sorry to hear that. 1 star recorded.';
      case 2: return 'We can do better. 2 stars recorded.';
      case 3: return 'Thanks! 3 stars recorded.';
      case 4: return 'Great, thank you! 4 stars recorded.';
      case 5: return 'Wow, thank you! 5 stars recorded.';
      default: return 'You have not rated us yet.';
    }
  }

  var rating = 0;
  Array.prototype.forEach.call(stars, function (star) {
    var value = Number(star.dataset.value);
    star.addEventListener('click', function () {
      rating = value;
      paintStars(rating);
      Array.prototype.forEach.call(stars, function (s) {
        s.setAttribute('aria-pressed', Number(s.dataset.value) <= rating ? 'true' : 'false');
      });
      ratingMessage.textContent = ratingText(rating);
      star.classList.remove('pop');
      void star.offsetWidth;            // restart the animation
      star.classList.add('pop');
      if (window.SkyRoute) { window.SkyRoute.playSound('star', value * 2); }
    });
    // preview the rating while the mouse is over a star
    star.addEventListener('mouseenter', function () { paintStars(value); });
    star.addEventListener('mouseleave', function () { paintStars(rating); });
    star.addEventListener('focus', function () { paintStars(value); });
    star.addEventListener('blur', function () { paintStars(rating); });
  });

  /* =====================================================
     Assignment 5. Contact form: asynchronous submit with fetch + callback
     sendMessage() posts the data and calls the callback with (error, result);
     the page shows the result without reloading.
     ===================================================== */
  // jsonplaceholder is a free test API: it accepts a POST and answers with the data plus an id
  var CONTACT_ENDPOINT = 'https://jsonplaceholder.typicode.com/posts';

  function sendMessage(payload, callback) {
    fetch(CONTACT_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=UTF-8' },
      body: JSON.stringify(payload)
    })
      .then(function (response) {
        if (!response.ok) { throw new Error('Server answered ' + response.status); }
        return response.json();
      })
      .then(function (data) { callback(null, data); })
      .catch(function (error) { callback(error); });
  }

  var form = document.getElementById('contact-form');
  var box = document.getElementById('contact-alert');
  if (form && box) {
    var sendBtn = form.querySelector('button[type="submit"]');

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      if (!form.checkValidity()) {
        form.classList.add('was-validated');
        showAlert(box, 'danger', 'Please correct the highlighted fields.');
        if (window.SkyRoute) { window.SkyRoute.playSound('error'); }
        var firstBad = form.querySelector(':invalid');
        if (firstBad) { firstBad.focus(); }
        return;
      }
      var name = document.getElementById('contact-name').value.trim();
      var payload = {
        title: document.getElementById('contact-topic').value,
        body: document.getElementById('contact-message').value.trim(),
        name: name,
        email: document.getElementById('contact-email').value.trim()
      };

      sendBtn.disabled = true;
      sendBtn.textContent = 'Sending...';

      // The callback runs when the request finishes, successfully or not
      sendMessage(payload, function (error, data) {
        sendBtn.disabled = false;
        sendBtn.textContent = 'Send message';
        if (error) {
          showAlert(box, 'danger', 'Sorry, ' + name + ', the message could not be sent (' + error.message + '). Please try again.');
          if (window.SkyRoute) { window.SkyRoute.playSound('error'); }
          return;
        }
        showAlert(box, 'success', 'Thank you, ' + name + '! Your message was sent (test reference #' + data.id + '). This is a demo, so nobody will read it.');
        box.firstChild.classList.add('bounce-in');
        if (window.SkyRoute) { window.SkyRoute.playSound('success'); }
        form.classList.remove('was-validated');
        form.reset();
      });
    });
  }
}());
