/* All rules run in JavaScript so each field can explain how to fix its value. */
(() => {
  'use strict';
  const byId = id => document.getElementById(id);
  const name = value => value.trim().length >= 2 ? '' : 'Enter a name with at least two characters.';
  const email = value => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim()) ? '' : 'Enter an email such as traveller@example.com.';
  const phone = value => /^\+[1-9]\d{7,14}$/.test(value.replace(/[\s()-]/g, '')) ? '' : 'Include +, the country code and 8 to 15 digits altogether.';
  const password = value => value.length >= 8 && /[a-z]/i.test(value) && /\d/.test(value) ? '' : 'Use at least 8 characters, including a letter and a number.';
  const required = message => value => value.trim() ? '' : message;
  const positiveFare = value => !value.trim() || (/^\d+(\.\d{1,2})?$/.test(value.trim()) && Number(value) > 0 && Number.isFinite(Number(value))) ? '' : 'Enter a positive fare in USD, with up to two decimal places.';
  function localDate() {
    const now = new Date();
    return [now.getFullYear(), String(now.getMonth() + 1).padStart(2, '0'), String(now.getDate()).padStart(2, '0')].join('-');
  }
  const rules = {
    'search-form': {
      destination: required('Choose your destination.'),
      depart: value => value && value >= localDate() ? '' : 'Choose today or a future departure date.',
      return: value => !byId('trip-round').checked || (value && value >= byId('depart').value && value >= localDate()) ? '' : 'Choose a return date on or after departure.',
      maxprice: positiveFare
    },
    'refine-form': { 'b-destination': required('Choose a destination.'), 'b-maxprice': positiveFare },
    'booking-form': { fullname: name, email, phone },
    'subscribe-form': { 'sub-name': name, 'sub-email': email },
    'contact-form': { 'contact-name': name, 'contact-email': email, 'contact-message': required('Write your travel enquiry.') },
    'signup-form': { 'su-name': name, 'su-email': email, 'su-phone': phone, 'su-password': password,
      'su-confirm': value => value && value === byId('su-password').value ? '' : 'Enter the same password in both fields.' },
    'login-form': { 'login-email': email, 'login-password': required('Enter your password.') }
  };
  function mark(input, message) {
    let feedback = byId(input.id + '-error') || input.parentElement.querySelector('.invalid-feedback');
    if (!feedback) {
      feedback = document.createElement('div');
      feedback.className = 'invalid-feedback';
      input.parentElement.append(feedback);
    }
    feedback.id = input.id + '-error';
    const descriptions = new Set((input.getAttribute('aria-describedby') || '').split(' ').filter(Boolean));
    descriptions.add(feedback.id);
    input.setAttribute('aria-describedby', [...descriptions].join(' '));
    feedback.textContent = message;
    input.classList.toggle('is-invalid', Boolean(message));
    input.setAttribute('aria-invalid', String(Boolean(message)));
  }
  for (const [id, fields] of Object.entries(rules)) {
    const form = byId(id);
    if (!form) continue;
    form.addEventListener('submit', event => {
      let firstInvalid;
      for (const [field, validate] of Object.entries(fields)) {
        const input = byId(field);
        const message = validate(input.value);
        mark(input, message);
        if (message && !firstInvalid) firstInvalid = input;
      }
      if (firstInvalid) {
        event.preventDefault();
        event.stopImmediatePropagation();
        firstInvalid.focus();
      }
    }, true);
    form.addEventListener('input', event => {
      const input = event.target;
      if (input.classList.contains('is-invalid') && fields[input.id]) mark(input, fields[input.id](input.value));
    });
    form.addEventListener('reset', () => {
      for (const field of Object.keys(fields)) mark(byId(field), '');
    });
  }
})();
