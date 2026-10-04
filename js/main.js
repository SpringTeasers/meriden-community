/* ==========================================================================
   Meriden Community Site — main.js
   Progressive enhancement only. No framework, no build step.
   Without this file every page is still fully readable and navigable:
   the drawer is hidden and the nav renders as plain links (see .no-js rules).
   ========================================================================== */
(function () {
  'use strict';

  // Signal that JS is available BEFORE first paint where possible.
  document.documentElement.classList.remove('no-js');

  var toggle = document.querySelector('[data-nav-toggle]');
  var drawer = document.querySelector('[data-drawer]');
  var closeBtn = document.querySelector('[data-drawer-close]');

  if (!toggle || !drawer) return;

  var FOCUSABLE = 'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])';
  var lastFocused = null;

  function focusables() {
    return Array.prototype.slice.call(drawer.querySelectorAll(FOCUSABLE)).filter(function (el) {
      return el.offsetParent !== null || el === document.activeElement;
    });
  }

  function open() {
    lastFocused = document.activeElement;
    drawer.setAttribute('data-open', 'true');
    drawer.removeAttribute('hidden');
    toggle.setAttribute('aria-expanded', 'true');
    document.body.classList.add('drawer-open');
    var first = focusables()[0];
    if (first) first.focus();
  }

  function close(returnFocus) {
    drawer.setAttribute('data-open', 'false');
    toggle.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('drawer-open');
    if (returnFocus !== false) {
      (lastFocused || toggle).focus();
    }
  }

  function isOpen() {
    return drawer.getAttribute('data-open') === 'true';
  }

  toggle.addEventListener('click', function () {
    if (isOpen()) { close(); } else { open(); }
  });

  if (closeBtn) {
    closeBtn.addEventListener('click', function () { close(); });
  }

  // Esc closes the drawer and returns focus to the toggle.
  document.addEventListener('keydown', function (event) {
    if (!isOpen()) return;

    if (event.key === 'Escape' || event.key === 'Esc') {
      event.preventDefault();
      close();
      return;
    }

    // Trap focus inside the drawer while it is open.
    if (event.key === 'Tab') {
      var items = focusables();
      if (!items.length) return;
      var first = items[0];
      var last = items[items.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  });

  // Close the drawer if the viewport grows past the nav-collapse breakpoint.
  var mq = window.matchMedia('(min-width: 900px)');
  function onBreakpoint(e) {
    if (e.matches && isOpen()) close(false);
  }
  if (typeof mq.addEventListener === 'function') {
    mq.addEventListener('change', onBreakpoint);
  } else if (typeof mq.addListener === 'function') {
    mq.addListener(onBreakpoint);
  }
})();

/* --------------------------------------------------------------------------
   In-page jump pills: mark the pill for the section currently in view.
   Purely cosmetic — the anchors work with or without this script.
   -------------------------------------------------------------------------- */
(function () {
  'use strict';

  var pillRows = document.querySelectorAll('[data-pills]');
  if (!pillRows.length || !('IntersectionObserver' in window)) return;

  Array.prototype.forEach.call(pillRows, function (row) {
    var pills = Array.prototype.slice.call(row.querySelectorAll('a[href^="#"]'));
    if (!pills.length) return;

    var sections = pills.map(function (pill) {
      var id = pill.getAttribute('href').slice(1);
      return document.getElementById(id);
    }).filter(Boolean);

    if (!sections.length) return;

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        pills.forEach(function (pill) {
          var isCurrent = pill.getAttribute('href') === '#' + entry.target.id;
          if (isCurrent) {
            pill.setAttribute('aria-current', 'true');
          } else {
            pill.removeAttribute('aria-current');
          }
        });
      });
    }, { rootMargin: '-25% 0px -65% 0px', threshold: 0 });

    sections.forEach(function (section) { observer.observe(section); });
  });
})();
