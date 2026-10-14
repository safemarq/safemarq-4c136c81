// Applies the saved theme and language before first paint (no flash).
// A file rather than an inline script so the Content-Security-Policy can forbid inline code.
(function () {
  try {
    var t = localStorage.getItem('safemarq-theme');
    var dark = t === 'dark' || ((!t || t === 'system') && window.matchMedia('(prefers-color-scheme: dark)').matches);
    if (dark) document.documentElement.classList.add('dark');
    var l = localStorage.getItem('safemarq-locale');
    var map = { fr: 'fr-BE', nl: 'nl-BE', de: 'de-BE', en: 'en' };
    if (l && map[l]) document.documentElement.lang = map[l];
  } catch (e) {}
})();
