// pfx_overlay_container はJSで後から挿入されるため、
// CSSで非表示にするのではなくDOMから削除する。
(() => {
    if (window.__ytpDoSkipPfxRemoverInstalled) return;
    window.__ytpDoSkipPfxRemoverInstalled = true;

    const removePfxOverlay = () => {
        document.querySelectorAll('#pfx_overlay_container').forEach((el) => el.remove());
    };

    removePfxOverlay();

    const observer = new MutationObserver(removePfxOverlay);
    const start = () => {
        observer.observe(document.documentElement, {
            childList: true,
            subtree: true
        });
    };

    if (document.documentElement) {
        start();
    } else {
        document.addEventListener('DOMContentLoaded', start, { once: true });
    }
})();
