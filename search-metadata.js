(() => {
  'use strict';
  const source = document.getElementById('tolf-search-metadata');
  if (!source) return;
  const copy = JSON.parse(source.textContent);
  function update() {
    const lang = Object.hasOwn(copy, document.documentElement.lang) ? document.documentElement.lang : 'en';
    const [title, description] = copy[lang];
    document.title = title;
    document.querySelector('meta[name="description"]').content = description;
    document.querySelector('meta[property="og:title"]').content = title;
    document.querySelector('meta[property="og:description"]').content = description;
    for (const link of document.querySelectorAll('[data-vpn-overview]')) {
      link.href = 'https://vpn.tolf.is/' + lang + '/';
      link.textContent = {en:'About TOLF VPN',ru:'О TOLF VPN',lv:'Par TOLF VPN'}[lang];
    }
  }
  update();
  new MutationObserver(update).observe(document.documentElement, {attributes:true, attributeFilter:['lang']});
})();
