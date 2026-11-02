/* destinations.js - sidebar filters on the Destinations page (owner: Kagan Tasbolat)
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

  function applyFilters() {
    var regions = Array.prototype.map.call(
      form.querySelectorAll('input[name="region"]:checked'),
      function (box) { return box.value; }
    );
    var priceInput = form.querySelector('input[name="price"]:checked');
    var choice = priceInput ? priceInput.value : 'any';
    var shown = 0;

    Array.prototype.forEach.call(items, function (item) {
      var visible = regions.indexOf(item.dataset.region) !== -1 &&
                    priceMatches(choice, Number(item.dataset.price));
      item.classList.toggle('d-none', !visible);
      if (visible) { shown += 1; }
    });

    count.textContent = shown === 1 ? '1 destination found' : shown + ' destinations found';
    empty.classList.toggle('d-none', shown !== 0);
  }

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    applyFilters();
  });
  form.addEventListener('change', applyFilters);
  // After a reset the browser restores defaults on the next tick
  form.addEventListener('reset', function () { setTimeout(applyFilters, 0); });

  applyFilters();
}());
