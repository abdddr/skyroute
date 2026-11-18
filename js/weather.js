/* Current destination conditions from Open-Meteo, independent of demo flight prices. */
(() => {
  'use strict';
  const coordinates = {
    almaty: [43.24, 76.89], shymkent: [42.32, 69.59], aktau: [43.65, 51.16],
    turkistan: [43.30, 68.27], karagandy: [49.80, 73.09], kokshetau: [53.28, 69.38],
    oskemen: [49.95, 82.61], pavlodar: [52.29, 76.95], atyrau: [47.09, 51.92]
  };
  const city = document.getElementById('b-destination');
  const status = document.getElementById('weather-status');
  const heading = document.getElementById('weather-heading');
  const retry = document.getElementById('weather-retry');
  let inFlight;
  async function load() {
    if (inFlight) inFlight.abort();
    const controller = new AbortController();
    inFlight = controller;
    const place = coordinates[city.value];
    retry.hidden = true;
    heading.textContent = place ? city.selectedOptions[0].text + ' now' : 'Destination conditions';
    if (!place) { status.textContent = 'Choose a destination to see current conditions.'; return; }
    status.textContent = 'Loading temperature and wind…';
    const query = new URLSearchParams({ latitude: place[0], longitude: place[1], current: 'temperature_2m,wind_speed_10m', timezone: 'Asia/Almaty' });
    const timer = setTimeout(() => controller.abort(), 12000);
    try {
      const response = await fetch('https://api.open-meteo.com/v1/forecast?' + query, { signal: controller.signal });
      if (!response.ok) throw new Error('Weather unavailable');
      const { current } = await response.json();
      if (!current || !Number.isFinite(current.temperature_2m) || !Number.isFinite(current.wind_speed_10m) || !current.time) throw new Error('Incomplete conditions');
      if (inFlight !== controller) return;
      const values = document.createElement('strong');
      values.textContent = current.temperature_2m + ' °C · wind ' + current.wind_speed_10m + ' km/h';
      const time = document.createElement('small');
      time.className = 'd-block text-secondary mt-1';
      time.textContent = 'Local observation time: ' + current.time.replace('T', ' ');
      status.replaceChildren(values, time);
    } catch {
      if (inFlight !== controller) return;
      status.textContent = 'Current weather is unavailable. You can still compare and book flights.';
      retry.hidden = false;
    } finally {
      clearTimeout(timer);
    }
  }
  document.getElementById('refine-form').addEventListener('submit', load);
  retry.addEventListener('click', load);
  load();
})();
