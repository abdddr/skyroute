/* Assignment 6 - jQuery features shared by SkyRoute pages. */
$(document).ready(function () {
  'use strict';
  console.log('jQuery is ready!');

  // Task 4: colourful page-scroll indicator.
  $('body').prepend('<div id="scroll-progress" aria-hidden="true"></div>');
  function updateProgress() {
    var max = $(document).height() - $(window).height();
    $('#scroll-progress').css('width', (max > 0 ? ($(window).scrollTop() / max) * 100 : 0) + '%');
  }
  $(window).on('scroll resize', updateProgress);
  updateProgress();

  // Task 5: start counters only when the statistics section reaches the viewport.
  var counted = false;
  function countStats() {
    var section = $('.counter').first().closest('section');
    if (counted || !section.length || $(window).scrollTop() + $(window).height() < section.offset().top) return;
    counted = true;
    $('.counter').each(function () {
      var $counter = $(this);
      $({ value: 0 }).animate({ value: Number($counter.data('count')) }, {
        duration: 1200,
        easing: 'swing',
        step: function () { $counter.text(Math.floor(this.value)); },
        complete: function () { $counter.text($counter.data('count') + '+'); }
      });
    });
  }
  $(window).on('scroll resize', countStats);
  countStats();

  // Tasks 1 and 2: live destination filtering and autocomplete dropdown.
  var cities = ['Almaty', 'Shymkent', 'Aktau', 'Turkistan', 'Karagandy', 'Kokshetau', 'Oskemen', 'Pavlodar', 'Atyrau'];
  var $search = $('#destination-search');
  function filterDestinations(term) {
    $('[data-region]').each(function () {
      var $card = $(this);
      var match = !$search.length || !term || $card.find('.card-title').text().toLowerCase().indexOf(term) !== -1;
      $card.toggleClass('jquery-hidden', !match).toggle(match);
    });
    if ($search.length) $('#result-count').text($('.col-12[data-region]:visible').length + ' destinations found');
  }
  $search.on('keyup', function () {
    var term = String($(this).val() || '').trim().toLowerCase();
    filterDestinations(term);
    var matches = $.grep(cities, function (city) { return city.toLowerCase().indexOf(term) !== -1; });
    var $box = $('#search-suggestions').empty();
    if (!term || !matches.length) return $box.addClass('d-none');
    $.each(matches, function (_, city) { $box.append($('<button>', { type: 'button', class: 'suggestion-item', role: 'option', text: city })); });
    $box.removeClass('d-none');
  });
  $(document).on('click', '.suggestion-item', function () {
    $search.val($(this).text()).trigger('keyup').focus();
    $('#search-suggestions').addClass('d-none');
  });

  // Task 3: restore original FAQ HTML, then highlight matching words with a regex.
  var $faqAnswers = $('.faq-answer-inner');
  $faqAnswers.each(function () { $(this).data('original-html', $(this).html()); });
  $('#faq-search').on('keyup', function () {
    var query = String($(this).val() || '').trim();
    $faqAnswers.each(function () {
      var $answer = $(this).html($(this).data('original-html'));
      if (!query) return;
      var escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      $answer.html($answer.text().replace(new RegExp('(' + escaped + ')', 'gi'), '<mark class="search-hit">$1</mark>'));
      $answer.closest('.faq-item').find('.faq-question').trigger('click');
    });
  });

  // Task 6: spinner, disabled submit button, simulated request and recovery.
  $('#booking-form').on('submit', function () {
    var $form = $(this), $button = $form.find('button[type="submit"]');
    if (!$form[0].checkValidity() || $button.prop('disabled')) return;
    var original = $button.html();
    $button.prop('disabled', true).html('<span class="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>Please wait...');
    setTimeout(function () { $button.prop('disabled', false).html(original); }, 1700);
  });

  // Task 7: reusable temporary toast notifications for user actions.
  function toast(message) {
    $('.sr-toast').stop(true, true).remove();
    $('<div class="sr-toast" role="status"></div>').text(message).appendTo('body').hide().fadeIn(180).delay(2600).fadeOut(450, function () { $(this).remove(); });
  }
  $(document).on('click', '.btn-check + label, .suggestion-item', function () { toast('Flight selection updated.'); });
  $('#subscribe-form, #signup-form, #contact-form').on('submit', function () { if (this.checkValidity()) toast('Form submitted successfully.'); });

  // Task 8: copy a code with a confirmation icon and tooltip.
  $('.copy-btn').on('click', function () {
    var $button = $(this), value = $($button.data('copy-target')).val();
    function done() { $button.addClass('copied').html('✓ Copied').attr('title', 'Copied to clipboard!'); toast('Copied to clipboard!'); setTimeout(function () { $button.removeClass('copied').text('Copy').attr('title', 'Copy booking code'); }, 1800); }
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(value).then(done);
    else { var $temp = $('<textarea>').val(value).appendTo('body').select(); document.execCommand('copy'); $temp.remove(); done(); }
  });

  // Task 9: jQuery checks image offsets while native lazy loading is the fallback.
  $('img').attr('loading', 'lazy').each(function () { var $image = $(this); $image.attr('data-lazy-src', $image.attr('src')); });
  function lazyLoad() {
    $('img[data-lazy-src]').each(function () {
      var $image = $(this), top = $image.offset().top;
      if ($(window).scrollTop() + $(window).height() + 150 >= top) $image.attr('src', $image.data('lazy-src')).removeAttr('data-lazy-src');
    });
  }
  $(window).on('scroll resize', lazyLoad);
  lazyLoad();
});
