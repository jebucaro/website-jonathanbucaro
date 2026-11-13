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
    function menuOpen() {
        menuList.classList.add('is-open');
        menuOpenButton.setAttribute('aria-expanded', 'true');
        if (menuCloseButton) menuCloseButton.focus();
    }

    function menuClose() {
        menuList.classList.remove('is-open');
        menuOpenButton.setAttribute('aria-expanded', 'false');
        menuOpenButton.focus();
    }

    if (menuList && menuOpenButton) {
        menuOpenButton.addEventListener('click', menuOpen);

        if (menuCloseButton) {
            menuCloseButton.addEventListener('click', menuClose);
        }

        document.addEventListener('keydown', (event) => {
            if (
                event.key === 'Escape' &&
                menuList.classList.contains('is-open')
            ) {
                menuClose();
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

    /* ============================
  // Testimonials Slider
  ============================ */
    if (document.querySelector('.my-slider') && window.tns) {
        tns({
            container: '.my-slider',
            items: 1,
            slideBy: 1,
            gutter: 0,
            nav: false,
            mouseDrag: true,
            autoplay: false,
            controls: true,
            controlsContainer: '.testimonials-controls',
            speed: 500,
            loop: true,
        });
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
