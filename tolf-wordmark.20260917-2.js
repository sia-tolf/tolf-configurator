/* TOLF wordmark: presentation only; no requests or stored user data. */
(() => {
  "use strict";
  const scope = "h1,h2,h3,.brand,.auth-mark,.eyebrow,.page-top a,header > a";
  const ignore = ".tolf-wordmark,script,style,textarea,input,[contenteditable]";
  function decorate(root) {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) {
      const node = walker.currentNode;
      if (/\bTOLF\b/.test(node.data) && !node.parentElement.closest(ignore)) nodes.push(node);
    }
    for (const node of nodes) {
      const fragment = document.createDocumentFragment();
      const parts = node.data.split(/(\bTOLF\b)/);
      for (const part of parts) {
        if (part === "TOLF") {
          const word = document.createElement("span");
          word.className = "tolf-wordmark";
          word.textContent = part;
          fragment.appendChild(word);
        } else if (part) fragment.appendChild(document.createTextNode(part));
      }
      node.replaceWith(fragment);
    }
  }
  const observer = new MutationObserver(records => {
    const roots = new Set();
    for (const record of records) {
      const target = record.target.nodeType === Node.ELEMENT_NODE
        ? record.target : record.target.parentElement;
      const parent = target?.closest(scope);
      if (parent) roots.add(parent);
      for (const node of record.addedNodes) {
        if (node.nodeType !== Node.ELEMENT_NODE) continue;
        if (node.matches(scope)) roots.add(node);
        node.querySelectorAll(scope).forEach(element => roots.add(element));
      }
    }
    if (!roots.size) return;
    observer.disconnect();
    roots.forEach(decorate);
    observe();
  });
  function observe() {
    observer.observe(document.body, { childList: true, subtree: true, characterData: true });
  }
  document.querySelectorAll(scope).forEach(decorate);
  observe();
})();
