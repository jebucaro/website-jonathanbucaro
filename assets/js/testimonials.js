// Testimonials carousel: native scroll snap does the sliding, this adds the
// prev/next buttons, looping, optional autoplay and the screen-reader status.
// Loaded only where the section renders (see
// layouts/_partials/section-testimonials.html).
(function () {
    var carousel = document.querySelector('[data-carousel]');
    if (carousel) {
        var track = carousel.querySelector('.testimonials__slider'),
            slides = Array.from(track.children),
            prevButton = carousel.querySelector('[data-controls="prev"]'),
            nextButton = carousel.querySelector('[data-controls="next"]'),
            statusRegion = carousel.querySelector('[role="status"]'),
            count = slides.length,
            // Looping parks end slides with CSS order. With fewer than 3
            // slides the list is finite and the buttons disable at the ends.
            canLoop = count >= 3,
            pending = null,
            settledIndex = -1,
            parkKey = null,
            settleTimer = 0,
            touchDown = false;

        // Distance of a slide's center from the track's center.
        function slideOffset(slide) {
            var t = track.getBoundingClientRect(),
                r = slide.getBoundingClientRect();
            return r.left + r.width / 2 - (t.left + t.width / 2);
        }

        function visualOrder() {
            return slides.toSorted(function (a, b) {
                return slideOffset(a) - slideOffset(b);
            });
        }

        function currentSlide() {
            return visualOrder().reduce(function (best, slide) {
                return Math.abs(slideOffset(slide)) <
                    Math.abs(slideOffset(best))
                    ? slide
                    : best;
            });
        }

        // Park end slides next to the current one. The compensating scroll
        // keeps the current slide in place so the reorder is invisible.
        function park(index) {
            var parkFirst = index >= count - 2 && index !== 0,
                parkLast = index <= 1 && index !== count - 1,
                key = (parkFirst ? 'F' : '') + (parkLast ? 'L' : '');
            if (key === parkKey) return;
            parkKey = key;

            var current = slides[index],
                before = current.getBoundingClientRect().left;
            track.style.scrollSnapType = 'none';
            track.style.overflowX = 'hidden';
            track.style.setProperty('--park-first', parkFirst ? 1 : 0);
            track.style.setProperty('--park-last', parkLast ? -1 : 0);
            slides[0].inert = parkFirst;
            slides[count - 1].inert = parkLast;
            var after = current.getBoundingClientRect().left;
            track.scrollBy({ left: after - before, behavior: 'instant' });
            track.style.scrollSnapType = '';
            // Safari paints the reordered layout for a frame before the
            // compensating scroll lands; keep overflow locked until then.
            requestAnimationFrame(function () {
                requestAnimationFrame(function () {
                    track.style.overflowX = '';
                });
            });
        }

        function settle() {
            var current = currentSlide();
            // A scroll toward a pending target is still in flight.
            if (pending && current !== pending) return;
            pending = null;
            var index = slides.indexOf(current);
            if (canLoop) park(index);
            if (!canLoop) {
                var order = visualOrder(),
                    position = order.indexOf(current);
                prevButton.disabled = position === 0;
                nextButton.disabled = position === order.length - 1;
            }
            if (index !== settledIndex) {
                if (settledIndex !== -1) {
                    statusRegion.textContent = current.dataset.status;
                }
                settledIndex = index;
            }
        }

        function go(direction) {
            var order = visualOrder(),
                target =
                    order[order.indexOf(pending || currentSlide()) + direction];
            if (!target) return;
            pending = target;
            track.scrollBy({ left: slideOffset(target) });
        }

        // Autoplay (WCAG 2.2.2): state is 'playing', 'paused-by-user' or
        // 'stopped' (the visitor took over). Holds pause it temporarily; it
        // ticks only while playing with no holds. Its own go(1) runs from
        // tick(), so it never reaches the user-input stop below.
        var autoplayButton = carousel.querySelector(
                '[data-controls="autoplay"]',
            ),
            interval = Number(carousel.dataset.autoplay),
            reducedMotion = window.matchMedia(
                '(prefers-reduced-motion: reduce)',
            ),
            autoplay = null;

        if (
            autoplayButton &&
            interval > 0 &&
            canLoop &&
            !reducedMotion.matches
        ) {
            autoplay = {
                state: 'playing',
                holds: {
                    hover: false,
                    focus: false,
                    offscreen: true,
                    hidden: document.hidden,
                },
                timer: 0,
            };
        }

        function canTick() {
            if (autoplay.state !== 'playing') return false;
            var h = autoplay.holds;
            return !(h.hover || h.focus || h.offscreen || h.hidden);
        }

        function tick() {
            autoplay.timer = 0;
            go(1);
            schedule();
        }

        // One timeout at a time: a running timer is left alone, a cleared
        // one restarts with a full interval.
        function schedule() {
            if (!canTick()) {
                clearTimeout(autoplay.timer);
                autoplay.timer = 0;
            } else if (!autoplay.timer) {
                autoplay.timer = setTimeout(tick, interval);
            }
        }

        function setHold(name, on) {
            autoplay.holds[name] = on;
            schedule();
        }

        function setState(state) {
            var playing = state === 'playing';
            autoplay.state = state;
            autoplayButton.setAttribute(
                'aria-label',
                playing
                    ? autoplayButton.dataset.labelPause
                    : autoplayButton.dataset.labelPlay,
            );
            // U+FE0E keeps the play triangle a text glyph, not an emoji.
            autoplayButton.firstElementChild.textContent = playing
                ? '\u275A\u275A'
                : '\u25B6\uFE0E';
            // Announce slide changes only when the visitor drives them.
            statusRegion.setAttribute('aria-live', playing ? 'off' : 'polite');
            schedule();
        }

        // Prev/next or direct input on the track: stop for good.
        function stopAutoplay() {
            if (autoplay && autoplay.state !== 'stopped') setState('stopped');
        }

        prevButton.addEventListener('click', function () {
            stopAutoplay();
            go(-1);
        });
        nextButton.addEventListener('click', function () {
            stopAutoplay();
            go(1);
        });

        // Whether this input takes over the slides (stopping autoplay), as
        // opposed to scrolling the page past them or tabbing out.
        function takesOver(event) {
            if (event.type === 'wheel') {
                return Math.abs(event.deltaX) > Math.abs(event.deltaY);
            }
            if (event.type === 'pointerdown') {
                return event.pointerType !== 'touch';
            }
            return event.key !== 'Tab';
        }

        // Direct user input replaces any scripted target.
        ['pointerdown', 'wheel', 'keydown'].forEach(function (type) {
            track.addEventListener(
                type,
                function (event) {
                    pending = null;
                    if (event.type === 'pointerdown') {
                        touchDown = event.pointerType === 'touch';
                    }
                    if (takesOver(event)) stopAutoplay();
                },
                { passive: true },
            );
        });

        // A touch only takes over once it drags the track; a vertical swipe
        // that starts here scrolls the page instead. Not pointercancel: the
        // browser fires it as soon as it starts panning the track itself.
        ['pointerup', 'touchend', 'touchcancel'].forEach(function (type) {
            track.addEventListener(
                type,
                function () {
                    touchDown = false;
                },
                { passive: true },
            );
        });
        track.addEventListener(
            'scroll',
            function () {
                // pending is set while autoplay's own scroll is in flight.
                if (touchDown && !pending) stopAutoplay();
            },
            { passive: true },
        );

        if (autoplay) {
            autoplayButton.addEventListener('click', function () {
                setState(
                    autoplay.state === 'playing' ? 'paused-by-user' : 'playing',
                );
            });
            carousel.addEventListener('pointerenter', function () {
                setHold('hover', true);
            });
            carousel.addEventListener('pointerleave', function () {
                setHold('hover', false);
            });
            carousel.addEventListener('focusin', function () {
                setHold('focus', true);
            });
            carousel.addEventListener('focusout', function (event) {
                if (!carousel.contains(event.relatedTarget)) {
                    setHold('focus', false);
                }
            });
            new IntersectionObserver(
                function (entries) {
                    var entry = entries[entries.length - 1];
                    setHold('offscreen', entry.intersectionRatio < 0.5);
                },
                { threshold: 0.5 },
            ).observe(carousel);
            document.addEventListener('visibilitychange', function () {
                setHold('hidden', document.hidden);
            });
            reducedMotion.addEventListener('change', function () {
                if (!reducedMotion.matches) return;
                setState('stopped');
                autoplayButton.hidden = true;
            });
            autoplayButton.hidden = false;
            setState('playing');
        }

        if ('onscrollend' in window) {
            track.addEventListener('scrollend', settle);
        } else {
            track.addEventListener('scroll', function () {
                clearTimeout(settleTimer);
                settleTimer = setTimeout(settle, 120);
            });
        }

        settle();
    }
})();
