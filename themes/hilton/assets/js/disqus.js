var disqus_loaded = false;
var disqus_shortname = '{{ .Site.Params.disqus.disqusShortname }}';
var disqus_container = document.getElementById('disqus_thread');

function disqus() {
    if (!disqus_loaded) {
        disqus_loaded = true;
        var e = document.createElement('script');
        e.type = 'text/javascript';
        e.async = true;
        e.src = '//' + disqus_shortname + '.disqus.com/embed.js';
        (
            document.getElementsByTagName('head')[0] ||
            document.getElementsByTagName('body')[0]
        ).appendChild(e);
        // Hide the button after opening
        document.getElementById('show-comments-button').style.display = 'none';
        // Show disqus comments
        disqus_container.classList.add('is-open');
    }
}

// Add event listener for the Disqus button
document.addEventListener('DOMContentLoaded', function () {
    const showCommentsButton = document.getElementById('show-comments-button');
    if (showCommentsButton) {
        showCommentsButton.addEventListener('click', function (e) {
            e.preventDefault();
            disqus();
            return false;
        });
    }
});
