/* MAD Course Android app bridge.
 * Loaded only inside the Android app (the build adds it to index.html). It connects website
 * actions to Android: back button, printing / Save as PDF, saving code examples, keeping the
 * screen on while presenting, and opening outside links in the browser.
 * window.MADApp is provided by the app (WebViewCompat.addWebMessageListener). */
(function () {
  'use strict';
  document.documentElement.classList.add('android-app');

  function send(msg) {
    try {
      if (window.MADApp && window.MADApp.postMessage) {
        window.MADApp.postMessage(JSON.stringify(msg));
        return true;
      }
    } catch (e) { /* bridge unavailable */ }
    return false;
  }

  /* Native helpers used by the portal (assets/portal.js). */
  window.MADNative = {
    haptic: function (ms) { send({ type: 'haptic', ms: ms || 12 }); },
    share: function (text) { send({ type: 'share', text: String(text || '') }); },
    setTheme: function (dark) { send({ type: 'theme', dark: !!dark }); }
  };

  /* Certificate and page printing → Android print dialog (includes "Save as PDF"). */
  window.print = function () { send({ type: 'print', title: document.title }); };

  /* "Print lecture": print the whole lecture document, not just the visible frame. */
  document.addEventListener('click', function (e) {
    var btn = e.target.closest && e.target.closest('[data-action="print"]');
    if (!btn) return;
    var m = /lecture-(\d+)/.exec(location.hash);
    var section = m && document.getElementById('lecture-' + m[1]);
    var frame = section && section.querySelector('.lecture-frame');
    if (!frame || !frame.srcdoc) return;          // fall back to the page's own handler
    e.preventDefault();
    e.stopImmediatePropagation();
    var menu = btn.closest('details');
    if (menu) menu.removeAttribute('open');
    send({ type: 'printHtml', html: frame.srcdoc, title: (frame.title || document.title) });
  }, true);

  /* Code example downloads (blob: links) → save to Downloads/MAD Course. */
  function saveLink(a) {
    var name = a.getAttribute('download') || 'Example.txt';
    fetch(a.href).then(function (r) { return r.text(); })
      .then(function (text) { send({ type: 'save', name: name, text: text }); })
      .catch(function () { send({ type: 'toast', text: 'Could not save the file' }); });
  }
  function isBlobDownload(a) {
    return a && a.hasAttribute && a.hasAttribute('download') && /^(blob|data):/.test(a.href || '');
  }
  var nativeClick = HTMLAnchorElement.prototype.click;
  HTMLAnchorElement.prototype.click = function () {
    if (isBlobDownload(this)) { saveLink(this); return; }
    return nativeClick.call(this);
  };
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[download]');
    if (isBlobDownload(a)) { e.preventDefault(); saveLink(a); }
  }, true);

  /* Pop-up windows do not exist in the app: outside links go to the browser. */
  window.open = function (url) {
    if (url && /^https?:/i.test(String(url)) && String(url).indexOf(location.host) < 0) {
      send({ type: 'open', url: String(url) });
    }
    return null;
  };

  /* Keep the screen on while a presentation is open. */
  var awake = false;
  function syncAwake() {
    var on = !!(document.body && document.body.classList.contains('pz-open'));
    if (on !== awake) { awake = on; send({ type: 'keepAwake', on: on }); }
  }
  document.addEventListener('DOMContentLoaded', function () {
    syncAwake();
    new MutationObserver(syncAwake).observe(document.body, { attributes: true, attributeFilter: ['class'] });
  });

  /* Android back button: close the top-most layer first. Returns true when handled. */
  window.__madBack = function (canGoBack) {
    if (document.fullscreenElement && document.exitFullscreen) { document.exitFullscreen(); return true; }
    var dialog = document.querySelector('dialog[open]');
    if (dialog) { dialog.close(); return true; }
    var menu = document.querySelector('details.top-tools[open]');
    if (menu) { menu.removeAttribute('open'); return true; }
    if (document.body.classList.contains('pz-open')) {
      var close = document.querySelector('[data-pa="close"]');
      if (close) { close.click(); return true; }
    }
    var sidebar = document.getElementById('course-sidebar');
    if (sidebar && sidebar.classList.contains('open')) {
      var sc = document.getElementById('sidebar-close');
      if (sc) sc.click(); else sidebar.classList.remove('open');
      return true;
    }
    if (!canGoBack) {
      var h = location.hash;
      if (h && h !== '#home' && h !== '#') { location.hash = '#home'; return true; }
    }
    return false;
  };
})();
