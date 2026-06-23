/* =========================================================
   Portfolio · Lightweight i18n
   English is authored in the HTML (source of truth).
   German is supplied via CHROME_DE (shared chrome) and
   PAGE_DE (page-specific), keyed by [data-i18n].
   Choice persists in localStorage.
   ========================================================= */
(function(){
  "use strict";
  var KEY = "site_lang";
  var SUPPORTED = ["en","de"];
  var cache = new Map();          // el -> original (English) innerHTML
  var attrCache = new Map();      // el -> { attr: originalValue }

  function getLang(){
    var l = localStorage.getItem(KEY);
    return SUPPORTED.indexOf(l) !== -1 ? l : "en";
  }

  function dict(){
    return Object.assign({}, window.CHROME_DE || {}, window.PAGE_DE || {});
  }

  function apply(lang){
    if(SUPPORTED.indexOf(lang) === -1) lang = "en";
    var de = dict();
    document.documentElement.setAttribute("lang", lang);

    // innerHTML translations
    document.querySelectorAll("[data-i18n]").forEach(function(el){
      var k = el.getAttribute("data-i18n");
      if(!cache.has(el)) cache.set(el, el.innerHTML);
      if(lang === "de" && de[k] != null) el.innerHTML = de[k];
      else el.innerHTML = cache.get(el);
    });

    // attribute translations: data-i18n-attr="placeholder:key, aria-label:key2"
    document.querySelectorAll("[data-i18n-attr]").forEach(function(el){
      var spec = el.getAttribute("data-i18n-attr");
      if(!attrCache.has(el)) attrCache.set(el, {});
      var store = attrCache.get(el);
      spec.split(",").forEach(function(pair){
        var bits = pair.split(":");
        var attr = (bits[0]||"").trim();
        var k = (bits[1]||"").trim();
        if(!attr || !k) return;
        if(!(attr in store)) store[attr] = el.getAttribute(attr);
        if(lang === "de" && de[k] != null) el.setAttribute(attr, de[k]);
        else if(store[attr] != null) el.setAttribute(attr, store[attr]);
      });
    });

    // <title> + meta description
    if(!cache.has("__title")) cache.set("__title", document.title);
    document.title = (lang === "de" && de.__title) ? de.__title : cache.get("__title");
    var md = document.querySelector('meta[name="description"]');
    if(md){
      if(!cache.has("__desc")) cache.set("__desc", md.getAttribute("content"));
      md.setAttribute("content", (lang === "de" && de.__desc) ? de.__desc : cache.get("__desc"));
    }

    // toggle button states
    document.querySelectorAll("[data-setlang]").forEach(function(b){
      var on = b.getAttribute("data-setlang") === lang;
      b.classList.toggle("active", on);
      b.setAttribute("aria-pressed", on ? "true" : "false");
    });
  }

  function setLang(lang){
    localStorage.setItem(KEY, lang);
    apply(lang);
  }

  document.addEventListener("click", function(e){
    var b = e.target.closest("[data-setlang]");
    if(!b) return;
    e.preventDefault();
    setLang(b.getAttribute("data-setlang"));
  });

  window.I18N = { setLang: setLang, getLang: getLang, apply: apply };

  function init(){ apply(getLang()); }
  if(document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
