document.addEventListener('DOMContentLoaded', function () {
    'use strict';

    var html = document.querySelector('html'),
        menuOpenIcon = document.querySelector('.icon__menu'),
        menuCloseIcon = document.querySelector('.nav__icon-close'),
        menuList = document.querySelector('.main-nav'),
        toggleThemeButtons = document.querySelectorAll('.toggle-theme-js'),
        btnScrollToTop = document.querySelector('.top');

    /* =======================================================
  // Menu + Theme Switcher
  ======================================================= */
    if (menuOpenIcon) {
        menuOpenIcon.addEventListener('click', () => {
            menuOpen();
        });
    }

    if (menuCloseIcon) {
        menuCloseIcon.addEventListener('click', () => {
            menuClose();
        });
    }

    function menuOpen() {
        menuList.classList.add('is-open');
    }

    function menuClose() {
        menuList.classList.remove('is-open');
    }

    if (toggleThemeButtons && toggleThemeButtons.length > 0) {
        toggleThemeButtons.forEach((toggleTheme) => {
            toggleTheme.addEventListener('click', () => {
                darkMode();
            });
        });
    }

    // Theme Switcher
    function darkMode() {
        if (html.classList.contains('dark-mode')) {
            html.classList.remove('dark-mode');
            localStorage.removeItem('theme');
            document.documentElement.removeAttribute('dark');
        } else {
            html.classList.add('dark-mode');
            localStorage.setItem('theme', 'dark');
            document.documentElement.setAttribute('dark', '');
        }
    }

    /* ================================================================
  // Stop Animations During Window Resizing and Switching Theme Modes
  ================================================================ */
    let disableTransition;

    if (toggleThemeButtons && toggleThemeButtons.length > 0) {
        toggleThemeButtons.forEach((toggleTheme) => {
            toggleTheme.addEventListener('click', () => {
                stopAnimation();
            });
        });
    }

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
    // Initialize reframe with a delay to ensure the library is loaded
    setTimeout(() => {
        if (window.reframe) {
            reframe(
                '.post__content iframe:not(.reframe-off), .page__content iframe:not(.reframe-off), .project-content iframe:not(.reframe-off)',
            );
        }
    }, 100);

    /* =======================
  // Fade-in Images
  ======================= */
    document.querySelectorAll('img.fade-img').forEach(function (img) {
        if (img.complete) {
            img.classList.add('loaded');
        } else {
            var markLoaded = function () {
                img.classList.add('loaded');
            };
            img.addEventListener('load', markLoaded, { once: true });
            img.addEventListener('error', markLoaded, { once: true });
        }
    });

    /* =======================
  // Zoom Image
  ======================= */
    const lightense = document.querySelector(
            '.page__content img, .post__content img, .project-content img, .gallery__image img',
        ),
        imageLink = document.querySelectorAll(
            '.page__content a img, .post__content a img, .project-content a img, .gallery__image a img',
        );

    if (imageLink) {
        for (var i = 0; i < imageLink.length; i++)
            imageLink[i].parentNode.classList.add('image-link');
        for (var i = 0; i < imageLink.length; i++)
            imageLink[i].classList.add('no-lightense');
    }

    // Initialize Lightense with custom settings, with a delay to ensure the library is loaded
    setTimeout(() => {
        if (lightense && window.Lightense) {
            Lightense(
                '.page__content img:not(.no-lightense), .post__content img:not(.no-lightense), .project-content img:not(.no-lightense), .gallery__image img:not(.no-lightense)',
                {
                    padding: 60,
                    offset: 30,
                },
            );
        }
    }, 100);

    /* ============================
  // Testimonials Slider
  ============================ */
    // Initialize tiny-slider with a delay to ensure the library is loaded
    setTimeout(() => {
        if (document.querySelector('.my-slider') && window.tns) {
            var slider = tns({
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
    }, 100);

    /* =================================
  // Smooth scroll to the tags page
  ================================= */
    document.querySelectorAll('.tag__link, .top__link').forEach((anchor) => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();

            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth',
            });
        });
    });

    /* =======================
  // Scroll Top Button
  ======================= */
    btnScrollToTop.addEventListener('click', function () {
        if (window.scrollY != 0) {
            window.scrollTo({
                top: 0,
                left: 0,
                behavior: 'smooth',
            });
        }
    });
});
