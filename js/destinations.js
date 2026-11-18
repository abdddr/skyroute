/* destinations.js - sidebar filters on the Destinations page (owner: Tasbolat Kagan)
   Each card column in the HTML has data-region and data-price.
   The script shows or hides columns to match the checked filters. */
(function () {
  'use strict';

  var form = document.getElementById('filter-form');
  var items = document.querySelectorAll('[data-region]');
  var count = document.getElementById('result-count');
  var empty = document.getElementById('no-match');
  if (!form || !count || !empty) { return; }

  function priceMatches(choice, price) {
    if (choice === 'low') { return price < 40; }
    if (choice === 'mid') { return price >= 40 && price <= 70; }
    return true; // "any"
  }

  var search = document.getElementById('destination-search');
  var suggestions = document.getElementById('search-suggestions');
  function applyFilters() {
    var term = search.value.trim().toLowerCase();
    suggestions.replaceChildren();
    var regions = Array.prototype.map.call(
      form.querySelectorAll('input[name="region"]:checked'),
      function (box) { return box.value; }
    );
    var priceInput = form.querySelector('input[name="price"]:checked');
    var choice = priceInput ? priceInput.value : 'any';
    var shown = 0;

    Array.prototype.forEach.call(items, function (item) {
      var city = item.querySelector('.card-title').textContent.trim();
      var visible = city.toLowerCase().includes(term) && regions.indexOf(item.dataset.region) !== -1 &&
                    priceMatches(choice, Number(item.dataset.price));
      item.classList.toggle('d-none', !visible);
      if (visible) {
        shown += 1;
        if (term && city.toLowerCase() !== term && document.activeElement === search) {
          var option = document.createElement('button');
          option.type = 'button';
          option.className = 'suggestion-item';
          option.textContent = city;
          option.addEventListener('click', function () {
            search.value = city;
            search.focus();
            applyFilters();
          });
          suggestions.append(option);
        }
      }
    });

    suggestions.classList.toggle('d-none', !suggestions.childElementCount);
    count.textContent = shown === 1 ? '1 destination found' : shown + ' destinations found';
    empty.classList.toggle('d-none', shown !== 0);
  }

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    applyFilters();
  });
  form.addEventListener('change', applyFilters);
  // After a reset the browser restores defaults on the next tick
  form.addEventListener('reset', function () { search.value = ''; setTimeout(applyFilters, 0); });

  search.addEventListener('input', applyFilters);
  search.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') suggestions.classList.add('d-none');
  });
  document.addEventListener('focusin', function (event) {
    if (event.target !== search && !suggestions.contains(event.target)) suggestions.classList.add('d-none');
  });
  document.addEventListener('click', function (event) {
    if (event.target !== search && !suggestions.contains(event.target)) suggestions.classList.add('d-none');
  });
  applyFilters();
}());
