// Testimonials carousel: native scroll snap does the sliding, this adds the
// prev/next buttons, looping and the screen-reader status. Loaded only where
// the section renders (see layouts/_partials/section-testimonials.html).
(function () {
    var carousel = document.querySelector('[data-carousel]');
    if (carousel) {
        var track = carousel.querySelector('.testimonials__slider'),
            slides = Array.prototype.slice.call(track.children),
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
            settleTimer = 0;

        // Distance of a slide's center from the track's center.
        function slideOffset(slide) {
            var t = track.getBoundingClientRect(),
                r = slide.getBoundingClientRect();
            return r.left + r.width / 2 - (t.left + t.width / 2);
        }

        function visualOrder() {
            return slides.slice().sort(function (a, b) {
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

        prevButton.addEventListener('click', function () {
            go(-1);
        });
        nextButton.addEventListener('click', function () {
            go(1);
        });

        // Direct user input replaces any scripted target.
        ['pointerdown', 'wheel', 'keydown'].forEach(function (type) {
            track.addEventListener(
                type,
                function () {
                    pending = null;
                },
                { passive: true },
            );
        });

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
