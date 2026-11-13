/* Victoria Love Franklin: tabs, filters, lightbox, menu */
(function () {
  'use strict';
  var d = document;

  // Mobile menu
  var mb = d.querySelector('.menu-btn'), nav = d.getElementById('site-nav');
  if (mb && nav) {
    mb.addEventListener('click', function () {
      var o = nav.classList.toggle('open');
      mb.setAttribute('aria-expanded', String(o));
    });
    nav.addEventListener('click', function (e) {
      if (e.target.closest('a')) { nav.classList.remove('open'); mb.setAttribute('aria-expanded', 'false'); }
    });
  }

  // Tabs: [data-tabs] holds role=tab buttons whose aria-controls name a panel
  function setupTabs(list) {
    var tabs = [].slice.call(list.querySelectorAll('[role="tab"]'));
    var hashSync = list.hasAttribute('data-hash');
    function select(tab, focus, push) {
      tabs.forEach(function (t) {
        var on = t === tab;
        t.setAttribute('aria-selected', String(on));
        t.tabIndex = on ? 0 : -1;
        var p = d.getElementById(t.getAttribute('aria-controls'));
        if (p) p.hidden = !on;
      });
      if (focus) tab.focus();
      if (hashSync && push) history.replaceState(null, '', '#' + tab.getAttribute('aria-controls').replace(/^p-/, ''));
    }
    tabs.forEach(function (t, i) {
      t.addEventListener('click', function () {
        select(t, false, true);
        if (hashSync && window.innerWidth < 761) { var m = d.querySelector('.cv-main'); if (m) m.scrollIntoView({ block: 'start' }); }
      });
      t.addEventListener('keydown', function (e) {
        var k = e.key, n = null;
        if (k === 'ArrowRight' || k === 'ArrowDown') n = tabs[(i + 1) % tabs.length];
        if (k === 'ArrowLeft' || k === 'ArrowUp') n = tabs[(i - 1 + tabs.length) % tabs.length];
        if (k === 'Home') n = tabs[0];
        if (k === 'End') n = tabs[tabs.length - 1];
        if (n) { e.preventDefault(); select(n, true, true); }
      });
    });
    var start = tabs[0];
    if (hashSync && location.hash) {
      var h = location.hash.slice(1);
      tabs.forEach(function (t) { if (t.getAttribute('aria-controls') === 'p-' + h) start = t; });
    }
    select(start, false, false);
    if (hashSync) window.addEventListener('hashchange', function () {
      var h = location.hash.slice(1);
      tabs.forEach(function (t) { if (t.getAttribute('aria-controls') === 'p-' + h) select(t, false, false); });
    });
  }
  [].forEach.call(d.querySelectorAll('[data-tabs]'), setupTabs);

  // Publication filters
  var fl = d.querySelectorAll('.filter');
  [].forEach.call(fl, function (b) {
    b.addEventListener('click', function () {
      var f = b.getAttribute('data-filter');
      [].forEach.call(fl, function (x) { x.setAttribute('aria-pressed', String(x === b)); });
      [].forEach.call(d.querySelectorAll('.pub'), function (p) {
        p.hidden = f !== 'all' && (' ' + p.getAttribute('data-status') + ' ').indexOf(' ' + f + ' ') < 0;
      });
      [].forEach.call(d.querySelectorAll('.pub-group'), function (g) {
        g.hidden = !g.querySelector('.pub:not([hidden])');
      });
    });
  });

  // Lightbox with galleries
  var lb = d.getElementById('lightbox');
  if (lb && lb.showModal) {
    var img = lb.querySelector('img'), cap = lb.querySelector('figcaption');
    var prev = lb.querySelector('.lb-prev'), next = lb.querySelector('.lb-next');
    var items = [], idx = 0;
    function show() {
      img.src = items[idx].src; img.alt = items[idx].alt;
      cap.textContent = items[idx].alt + (items.length > 1 ? '  (' + (idx + 1) + ' of ' + items.length + ')' : '');
      prev.hidden = next.hidden = items.length < 2;
    }
    d.addEventListener('click', function (e) {
      var b = e.target.closest('.thumb');
      if (!b) return;
      items = JSON.parse(b.getAttribute('data-gallery')); idx = 0; show(); lb.showModal();
    });
    prev.addEventListener('click', function () { idx = (idx - 1 + items.length) % items.length; show(); });
    next.addEventListener('click', function () { idx = (idx + 1) % items.length; show(); });
    lb.querySelector('.lb-close').addEventListener('click', function () { lb.close(); });
    lb.addEventListener('click', function (e) { if (e.target === lb) lb.close(); });
    lb.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight' && items.length > 1) next.click();
      if (e.key === 'ArrowLeft' && items.length > 1) prev.click();
    });
  }

  // Print the whole CV: open every role and show every panel
  window.addEventListener('beforeprint', function () {
    [].forEach.call(d.querySelectorAll('details.role'), function (x) { x.setAttribute('data-was', x.open ? '1' : ''); x.open = true; });
  });
  window.addEventListener('afterprint', function () {
    [].forEach.call(d.querySelectorAll('details.role'), function (x) { x.open = x.getAttribute('data-was') === '1'; });
  });

  var y = d.querySelector('[data-year]'); if (y) y.textContent = new Date().getFullYear();
})();
