/*!
 * ATE — eXeLearning style script
 * Each page of the resource is a 16:9 slide with the identity of the Área de
 * Tecnología Educativa: logos, title, footer with the area, title and number.
 * Licensed under the GNU General Public License v3.0.
 */
(function () {
    'use strict';

    var root = document.documentElement;
    var assetBase = document.currentScript ? new URL('.', document.currentScript.src) : null;
    var AREA = 'Área de Tecnología Educativa';

    // Before the first paint, so the page never flashes as a document.
    root.classList.add('ate-js');

    function asset(path) {
        return new URL(path, assetBase || location.href).href;
    }

    function element(tag, className, text) {
        var node = document.createElement(tag);
        if (className) node.className = className;
        if (text) node.textContent = text;
        return node;
    }

    // Gobierno de Canarias manual 4.7: the Gobierno de Canarias mark on the left and the
    // ATE mark on the right, as in the ATE documents, both at the same height. The cover uses the Marca alone; the
    // slides add the issuing levels (Consejería and Dirección General).
    function logos(className, levels) {
        var bar = element('div', className);
        var ate = element('img', 'ate-logo-ate');
        ate.src = asset('img/logo-ate.png');
        ate.alt = AREA;
        var gobcan = element('img', 'ate-logo-gobcan');
        gobcan.src = asset(levels ? 'img/logo-gobcan-dgoeii.png' : 'img/logo-gobcan.png');
        gobcan.alt = levels
            ? 'Gobierno de Canarias. Consejería de Educación, Formación Profesional, Actividad Física y Deportes. Dirección General de Ordenación de las Enseñanzas, Inclusión e Innovación'
            : 'Gobierno de Canarias';
        bar.append(gobcan, ate);
        return bar;
    }

    function init() {
        var body = document.body;
        var main = document.querySelector('main.page');
        var nav = document.getElementById('siteNav');
        if (!body.classList.contains('exe-web-site') || !main || !nav || document.querySelector('.ate-slide-footer')) return;
        var cover = root.id === 'exe-index';
        var title = ((document.querySelector('.package-title') || {}).textContent || document.title).trim();
        var number = (document.querySelector('.page-counter-current-page') || {}).textContent || '';
        var total = (document.querySelector('.page-counter-total') || {}).textContent || '';

        // Slide: the marks centred on the cover, in the top band of every other slide.
        main.classList.add('ate-slide');
        var footer = element('div', 'ate-slide-footer');
        footer.append(element('span', 'ate-footer-text', AREA + ' · ' + title), element('span', 'ate-footer-number', total ? number + ' / ' + total : number));
        if (cover) {
            main.classList.add('ate-cover');
            var marks = logos('ate-cover-marks', false);
            main.prepend(marks);
            marks.after(element('h1', 'ate-cover-title', title));
        } else {
            main.prepend(logos('ate-slide-header', true));
        }
        main.append(footer);

        buildControls(body, nav);
        document.addEventListener('keydown', function (event) {
            if (event.altKey || event.ctrlKey || event.metaKey || document.querySelector('dialog[open]')) return;
            // Form fields keep their keys, and Space still presses a focused link or button.
            if (event.target.closest('input, textarea, select, [contenteditable="true"]')) return;
            if (event.key === ' ' && event.target.closest('a, button')) return;
            var links = nav.querySelectorAll('a[href]');
            var target = {
                ArrowRight: '.nav-button-right', PageDown: '.nav-button-right', ' ': '.nav-button-right',
                ArrowLeft: '.nav-button-left', PageUp: '.nav-button-left',
            }[event.key];
            var href = target ? (document.querySelector('a' + target) || {}).href : null;
            if (event.key === 'Home' && links.length) href = links[0].href;
            if (event.key === 'End' && links.length) href = links[links.length - 1].href;
            if (!href) return;
            event.preventDefault();
            location.href = href;
        });
    }

    /* ---------- Controls: previous, index and next ---------- */

    function buildControls(body, nav) {
        var buttons = document.querySelector('.nav-buttons');
        var bar = element('div', 'ate-controls');
        bar.setAttribute('role', 'navigation');
        bar.setAttribute('aria-label', 'Diapositivas');
        var dialog = element('dialog', 'ate-menu');
        dialog.setAttribute('aria-label', 'Índice de diapositivas');
        var close = element('button', 'ate-menu-close', '×');
        close.type = 'button';
        close.setAttribute('aria-label', 'Cerrar el índice');
        close.addEventListener('click', function () { dialog.close(); });
        dialog.addEventListener('click', function (event) { if (event.target === dialog) dialog.close(); });
        var heading = element('h2', 'ate-menu-title', 'Índice');
        var help = element('p', 'ate-menu-help', 'Pasa de diapositiva con ← y →, Re Pág y Av Pág o la barra espaciadora. Para presentar, usa la pantalla completa del navegador (F11, o ⌃⌘F en macOS).');
        var license = document.getElementById('siteFooter');
        var made = document.getElementById('made-with-eXe');
        dialog.append(close, heading, nav, help);
        if (license) dialog.append(license);
        if (made) dialog.append(made);
        dialog.append(openLink());

        var index = element('button', 'ate-control ate-index', 'Índice');
        index.type = 'button';
        index.setAttribute('aria-haspopup', 'dialog');
        index.addEventListener('click', function () {
            dialog.showModal();
            var active = nav.querySelector('a.active');
            if (active) active.focus();
        });
        if (buttons) {
            var previous = buttons.querySelector('.nav-button-left');
            var next = buttons.querySelector('.nav-button-right');
            [previous, next].forEach(function (button) { if (button) button.classList.add('ate-control'); });
            if (previous) bar.append(previous);
            bar.append(index);
            if (next) bar.append(next);
            buttons.remove();
        } else {
            bar.append(index);
        }
        body.append(bar, dialog);
    }

    // Shared by the style collection: open the example in eXeLearning.
    function openLink() {
        var link = element('a', 'exe-open-exelearning', 'Edit with eXeLearning');
        link.href = 'https://static.exelearning.dev/?url=https://github-proxy.exelearning.dev/?repo=ateeducacion/exelearning-style-ate&branch=main';
        link.target = '_blank';
        link.rel = 'noopener';
        var logo = element('img', 'exe-open-logo');
        logo.src = asset('icons/exe-logo.svg');
        logo.alt = '';
        link.prepend(logo);
        return link;
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();
})();
