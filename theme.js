/*
 * Tema chiaro / scuro.
 * Scelta salvata in localStorage ('geometryOfTennis_theme'): 'light' | 'dark' | 'auto'.
 * 'auto' segue il tema del sistema operativo. Il tema effettivo viene scritto
 * in <html data-theme="light|dark">; lo stesso calcolo gira anche nello script
 * inline in <head> per evitare il lampo bianco al caricamento.
 * I radio con name="theme_top" (modale desktop), "theme_panel" (pannello) e
 * "theme_drawer" (drawer mobile) restano sincronizzati.
 */
(function () {
    'use strict';

    var STORAGE_KEY = 'geometryOfTennis_theme';
    var RADIO_NAMES = ['theme_top', 'theme_panel', 'theme_drawer'];
    var media = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;

    function readPreference() {
        try {
            var v = localStorage.getItem(STORAGE_KEY);
            if (v === 'light' || v === 'dark' || v === 'auto') return v;
        } catch (e) { /* localStorage non disponibile */ }
        return 'auto';
    }

    function savePreference(pref) {
        try { localStorage.setItem(STORAGE_KEY, pref); } catch (e) { /* ignora */ }
    }

    function resolve(pref) {
        if (pref === 'dark' || pref === 'light') return pref;
        return media && media.matches ? 'dark' : 'light';
    }

    function updateThemeColorMeta(theme) {
        var meta = document.querySelector('meta[name="theme-color"]');
        if (!meta) return;
        if (!meta.dataset.lightColor) meta.dataset.lightColor = meta.getAttribute('content') || '#1976d2';
        meta.setAttribute('content', theme === 'dark' ? '#0b1016' : meta.dataset.lightColor);
    }

    function apply(pref) {
        var theme = resolve(pref);
        document.documentElement.setAttribute('data-theme', theme);
        updateThemeColorMeta(theme);
    }

    function syncRadios(pref) {
        RADIO_NAMES.forEach(function (name) {
            var input = document.querySelector('input[name="' + name + '"][value="' + pref + '"]');
            if (input) input.checked = true;
        });
    }

    function setPreference(pref) {
        savePreference(pref);
        apply(pref);
        syncRadios(pref);
    }

    function init() {
        var pref = readPreference();
        apply(pref);
        syncRadios(pref);

        RADIO_NAMES.forEach(function (name) {
            document.querySelectorAll('input[name="' + name + '"]').forEach(function (input) {
                input.addEventListener('change', function () {
                    if (input.checked) setPreference(input.value);
                });
            });
        });

        if (media) {
            var onSystemChange = function () {
                if (readPreference() === 'auto') apply('auto');
            };
            if (media.addEventListener) media.addEventListener('change', onSystemChange);
            else if (media.addListener) media.addListener(onSystemChange);
        }
    }

    window.GeometryTheme = { set: setPreference, get: readPreference };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
