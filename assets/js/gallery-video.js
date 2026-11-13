// Gallery videos behave like animated GIFs: the markup keeps them idle
// (preload="none", native controls) so they cost nothing and still work
// without JavaScript. Here they start playing when they approach the viewport
// and pause when they leave it. Under prefers-reduced-motion they never start
// on their own; the native controls remain the way to play and pause.
(function () {
    var videos = document.querySelectorAll('video[data-gallery-video]');
    if (!videos.length || !('IntersectionObserver' in window)) return;

    var reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    var near = new WeakSet();
    var userPaused = new WeakSet();
    var ourPause = new WeakSet();

    function sync(video) {
        if (near.has(video) && !reduced.matches && !userPaused.has(video)) {
            var started = video.play();
            if (started && started.catch) started.catch(function () {});
        } else if (!video.paused) {
            ourPause.add(video);
            video.pause();
        } else if (near.has(video) && video.preload === 'none') {
            // Not autoplaying (reduced motion): fetch just enough to show the
            // first frame instead of an empty box behind the controls.
            video.preload = 'metadata';
        }
    }

    var observer = new IntersectionObserver(
        function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) near.add(entry.target);
                else near.delete(entry.target);
                sync(entry.target);
            });
        },
        // Start a little before the video scrolls into view.
        { rootMargin: '200px 0px' },
    );

    videos.forEach(function (video) {
        // A pause the visitor makes with the controls sticks until they play again.
        video.addEventListener('pause', function () {
            if (ourPause.has(video)) ourPause.delete(video);
            else userPaused.add(video);
        });
        video.addEventListener('play', function () {
            userPaused.delete(video);
        });
        observer.observe(video);
    });

    reduced.addEventListener('change', function () {
        videos.forEach(sync);
    });
})();
