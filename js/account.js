(() => {
  'use strict';
  const byId = id => document.getElementById(id);
  const text = id => byId(id).value.trim();
  const notice = byId('account-notice');
  if (new URLSearchParams(location.search).has('profile')) {
    notice.hidden = false;
    notice.textContent = 'Log in to open your traveller profile.';
  }
  function bind(id, submit) {
    const form = byId(id + '-form');
    const status = byId(id + '-status');
    form.addEventListener('submit', async event => {
      event.preventDefault();
      const button = form.querySelector('button');
      if (button.disabled) return;
      button.disabled = true;
      try {
        status.textContent = await submit();
      } catch {
        status.textContent = 'Account access is unavailable. Open SkyRoute on HTTPS or localhost and allow browser storage.';
      } finally {
        button.disabled = false;
      }
    });
    form.addEventListener('input', () => { status.textContent = ''; });
  }
  bind('signup', async () => {
    const email = text('su-email');
    const created = await Travellers.register(text('su-name'), email, text('su-phone'), byId('su-password').value);
    if (!created) return 'An account already uses that email in this browser. Log in or use another email.';
    byId('signup-form').reset();
    byId('login-email').value = email;
    notice.hidden = false;
    notice.textContent = 'Account created. Log in with your new password.';
    byId('login-password').focus();
    return '';
  });
  bind('login', async () => {
    if (!await Travellers.login(text('login-email'), byId('login-password').value)) return 'Email or password did not match. Try again.';
    location.assign('profile.html');
    return '';
  });
})();
