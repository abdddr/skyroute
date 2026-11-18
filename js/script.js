/* A shared reading-progress indicator for longer pages. */
$(function () {
  'use strict';
  var bar = $('<div>', { id: 'scroll-progress', 'aria-hidden': 'true' }).prependTo('body');
  function update() {
    var range = document.documentElement.scrollHeight - window.innerHeight;
    bar.css('width', (range > 0 ? window.scrollY / range * 100 : 0) + '%');
  }
  $(window).on('scroll resize', update);
  update();
});
