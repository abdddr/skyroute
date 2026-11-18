/* About, frequently asked questions and the local enquiry demonstration. */
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

  var contact = document.getElementById('contact-form');
  contact.addEventListener('submit', function (event) {
    event.preventDefault();
    showAlert(document.getElementById('contact-alert'), 'success',
      'Enquiry checked. Your message and contact details stayed in this browser.');
    contact.reset();
  });

  var search = document.getElementById('faq-search');
  var status = document.createElement('p');
  status.setAttribute('role', 'status');
  search.parentElement.append(status);
  search.addEventListener('input', function () {
    var term = search.value.trim().toLowerCase();
    var count = 0;
    questions.forEach(function (button) {
      var item = button.closest('.faq-item');
      var matches = item.textContent.toLowerCase().includes(term);
      item.hidden = !matches;
      setOpen(button, matches && Boolean(term));
      if (matches) count++;
    });
    status.textContent = term && !count ? 'No matching answers. Try another word.' : '';
  });
}());
