document.addEventListener('DOMContentLoaded', function () {
    'use strict';

    var html = document.documentElement,
        menuOpenButton = document.querySelector('.icon__menu'),
        menuCloseButton = document.querySelector('.nav__icon-close'),
        menuList = document.querySelector('.main-nav'),
        toggleThemeButtons = document.querySelectorAll('.toggle-theme-js'),
        btnScrollToTop = document.querySelector('.top'),
        prefersDark = window.matchMedia('(prefers-color-scheme: dark)'),
        prefersReducedMotion = window.matchMedia(
            '(prefers-reduced-motion: reduce)',
        );

    function scrollBehavior() {
        return prefersReducedMotion.matches ? 'auto' : 'smooth';
    }

    /* =======================================================
  // Menu
  ======================================================= */
    // Below the desktop breakpoint the nav is a modal drawer: a top-layer
    // popover, so it renders above everything and Escape closes it and
    // returns focus to the opener. A popover is not modal on its own, so the
    // rest of the page is made inert while it is open. At desktop widths the
    // same nav is the inline header bar, so the popover attributes are only
    // present on mobile.
    var drawerQuery = window.matchMedia('(max-width: 1024px)'),
        inertSiblings = [];

    function setPageInert(inert) {
        inertSiblings.forEach(function (el) {
            el.inert = false;
        });
        inertSiblings = [];
        if (!inert) return;
        // Every sibling on the path from the nav up to <body>.
        for (var node = menuList; node !== document.body;) {
            var parent = node.parentElement;
            for (var sibling of parent.children) {
                if (sibling !== node) {
                    sibling.inert = true;
                    inertSiblings.push(sibling);
                }
            }
            node = parent;
        }
    }

    function syncDrawer() {
        if (drawerQuery.matches) {
            menuList.setAttribute('popover', 'auto');
            menuList.setAttribute('role', 'dialog');
            menuList.setAttribute('aria-modal', 'true');
            menuList.setAttribute('aria-labelledby', 'main-nav-title');
        } else {
            // Removing the attribute does not fire beforetoggle, so close first.
            if (menuList.matches(':popover-open')) menuList.hidePopover();
            menuList.removeAttribute('popover');
            menuList.removeAttribute('role');
            menuList.removeAttribute('aria-modal');
            menuList.removeAttribute('aria-labelledby');
            setPageInert(false);
            menuOpenButton.setAttribute('aria-expanded', 'false');
        }
    }

    if (menuList && menuOpenButton && 'showPopover' in menuList) {
        syncDrawer();
        drawerQuery.addEventListener('change', syncDrawer);

        menuOpenButton.addEventListener('click', function () {
            // source makes focus return to the button on close in browsers
            // that do not focus a button on click.
            menuList.showPopover({ source: menuOpenButton });
        });

        if (menuCloseButton) {
            menuCloseButton.addEventListener('click', function () {
                menuList.hidePopover();
            });
        }

        // Fires before the popover is hidden, so the opener is no longer
        // inert when the browser returns focus to it.
        menuList.addEventListener('beforetoggle', function (event) {
            var open = event.newState === 'open';
            setPageInert(open);
            menuOpenButton.setAttribute('aria-expanded', String(open));
        });

        // In-page anchor links do not unload the page; close the drawer.
        menuList.addEventListener('click', function (event) {
            if (
                event.target.closest('a[href]') &&
                menuList.matches(':popover-open')
            ) {
                menuList.hidePopover();
            }
        });
    }

    /* =======================================================
  // Theme Switcher
  ======================================================= */
    // Two-state toggle over three stored states (system, light, dark): the
    // target is the opposite of what is rendered now. It is only stored when
    // it differs from the OS preference; toggling back to what the OS already
    // asks for clears the override, so the site follows the system again.
    function toggleColorScheme() {
        var target = html.hasAttribute('dark') ? 'light' : 'dark';
        var system = prefersDark.matches ? 'dark' : 'light';
        var override = target === system ? null : target;

        try {
            if (override) {
                localStorage.setItem('theme', override);
            } else {
                localStorage.removeItem('theme');
            }
        } catch (e) {
            // Storage blocked: the theme still applies for this page view.
        }

        stopAnimation();
        window.applyColorScheme(override);
    }

    toggleThemeButtons.forEach((button) => {
        button.addEventListener('click', toggleColorScheme);
    });

    // Follow OS changes (a stored override, if any, still wins) and changes
    // made in another tab.
    prefersDark.addEventListener('change', () => {
        window.applyColorScheme();
    });

    window.addEventListener('storage', (event) => {
        if (event.key === 'theme' || event.key === null) {
            window.applyColorScheme();
        }
    });

    /* ================================================================
  // Stop Animations During Window Resizing and Switching Theme Modes
  ================================================================ */
    let disableTransition;

    window.addEventListener('resize', () => {
        stopAnimation();
    });

    function stopAnimation() {
        document.body.classList.add('disable-animation');
        clearTimeout(disableTransition);
        disableTransition = setTimeout(() => {
            document.body.classList.remove('disable-animation');
        }, 100);
    }

    /* =======================
  // Responsive Videos
  ======================= */
    // vendor.js is deferred ahead of this file, so its globals are already set.
    if (window.reframe) {
        reframe(
            '.post__content iframe:not(.reframe-off), .page__content iframe:not(.reframe-off), .work-content iframe:not(.reframe-off)',
        );
    }

    /* =======================
  // Fade-in Images
  ======================= */
    document.querySelectorAll('img.fade-img').forEach(function (img) {
        var markLoaded = function () {
            img.classList.add('loaded');
            // Fade lasts 300ms; afterwards drop both classes so the
            // html.js .fade-img transition rule stops overriding
            // component and Lightense transform transitions.
            setTimeout(function () {
                img.classList.remove('fade-img', 'loaded');
            }, 400);
        };
        if (img.complete) {
            markLoaded();
        } else {
            img.addEventListener('load', markLoaded, { once: true });
            img.addEventListener('error', markLoaded, { once: true });
        }
    });

    /* =======================
  // Mailto Obfuscation
  ======================= */
    document.querySelectorAll('.js-mailto').forEach(function (el) {
        var user = el.getAttribute('data-user');
        var domain = el.getAttribute('data-domain');
        if (user && domain) {
            el.setAttribute('href', 'mailto:' + user + '@' + domain);
        }
    });

    /* =======================
  // Scroll Reveal
  ======================= */
    const revealTargets = document.querySelectorAll('[data-reveal]');
    if (revealTargets.length && 'IntersectionObserver' in window) {
        const revealObserver = new IntersectionObserver(
            (entries, observer) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        // Plays the one-off CSS entry animation; see
                        // 1-tools/_reveal.scss.
                        entry.target.classList.add('is-visible');
                        observer.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.15, rootMargin: '0px 0px -10% 0px' },
        );
        revealTargets.forEach((el) => revealObserver.observe(el));
    } else {
        revealTargets.forEach((el) => el.classList.add('is-visible'));
    }

    /* =======================
  // Zoom Image
  ======================= */
    const lightense = document.querySelector(
            '.page__content img, .post__content img, .work-content img, .gallery__image img',
        ),
        imageLink = document.querySelectorAll(
            '.page__content a img, .post__content a img, .work-content a img, .gallery__image a img',
        );

    if (imageLink) {
        for (var i = 0; i < imageLink.length; i++)
            imageLink[i].parentNode.classList.add('image-link');
        for (var i = 0; i < imageLink.length; i++)
            imageLink[i].classList.add('no-lightense');
    }

    // Gallery images carry their full-size variant in data-zoom-src. Swap it in
    // before Lightense sees the click, so the zoom loads and scales the
    // full-size file instead of the small srcset fallback. Capture phase on
    // document runs ahead of Lightense's own listener on the image.
    document.addEventListener(
        'click',
        (event) => {
            const img =
                event.target.closest &&
                event.target.closest('img[data-zoom-src]');
            if (!img) return;
            img.removeAttribute('srcset');
            img.removeAttribute('sizes');
            img.src = img.dataset.zoomSrc;
            delete img.dataset.zoomSrc;
        },
        true,
    );

    if (lightense && window.Lightense) {
        Lightense(
            '.page__content img:not(.no-lightense), .post__content img:not(.no-lightense), .work-content img:not(.no-lightense), .gallery__image img:not(.no-lightense)',
            {
                padding: 60,
                offset: 30,
            },
        );
    }

    /* =================================
  // Smooth scroll to the tags page
  ================================= */
    document.querySelectorAll('.tag__link, .top__link').forEach((anchor) => {
        anchor.addEventListener('click', function (e) {
            const target = document.querySelector(this.getAttribute('href'));
            if (!target) return;

            e.preventDefault();
            target.scrollIntoView({ behavior: scrollBehavior() });
        });
    });

    /* =======================
  // Scroll Top Button
  ======================= */
    if (btnScrollToTop) {
        btnScrollToTop.addEventListener('click', function () {
            window.scrollTo({ top: 0, left: 0, behavior: scrollBehavior() });
        });
    }
});
