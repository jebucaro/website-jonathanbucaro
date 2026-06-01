(function () {
    var LANG_COLORS = {
        JavaScript: '#f1e05a',
        TypeScript: '#3178c6',
        Python: '#3572A5',
        Go: '#00ADD8',
        Rust: '#dea584',
        Java: '#b07219',
        'C++': '#f34b7d',
        C: '#555555',
        'C#': '#178600',
        Ruby: '#701516',
        PHP: '#4F5D95',
        Swift: '#F05138',
        Kotlin: '#A97BFF',
        Shell: '#89e051',
        Bash: '#89e051',
        HTML: '#e34c26',
        CSS: '#563d7c',
        SCSS: '#c6538c',
        Vue: '#41b883',
        Svelte: '#ff3e00',
        Dart: '#00B4AB',
        Lua: '#000080',
        Haskell: '#5e5086',
        Elixir: '#6e4a7e',
        Clojure: '#db5855',
        R: '#198CE7',
        Scala: '#c22d40',
        Perl: '#0298c3',
        Nix: '#7e7eff',
        Makefile: '#427819',
        Dockerfile: '#384d54',
        MDX: '#fcb32c',
        Astro: '#ff5a03',
        Zig: '#ec915c',
        Nim: '#ffc200',
        Crystal: '#000100',
        OCaml: '#ef7a08',
        Erlang: '#B83998',
        Elm: '#60B5CC',
        'F#': '#b845fc',
    };

    function formatCount(n) {
        if (n >= 1000000)
            return (n / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
        if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
        return String(n);
    }

    function initGithubCards() {
        var cards = document.querySelectorAll('.github-card[data-repo]');
        cards.forEach(function (card) {
            var repo = card.dataset.repo;
            if (!repo) return;

            fetch('https://api.github.com/repos/' + repo)
                .then(function (res) {
                    if (!res.ok) return null;
                    return res.json();
                })
                .then(function (data) {
                    if (!data) return;

                    var nameEl = card.querySelector('.github-card__name');
                    var descEl = card.querySelector(
                        '.github-card__description',
                    );
                    var langEl = card.querySelector('.github-card__language');
                    var langDotEl = card.querySelector(
                        '.github-card__lang-dot',
                    );
                    var langNameEl = card.querySelector(
                        '.github-card__lang-name',
                    );
                    var starsEl = card.querySelector(
                        '.github-card__stat--stars .github-card__stat-value',
                    );
                    var forksEl = card.querySelector(
                        '.github-card__stat--forks .github-card__stat-value',
                    );

                    if (nameEl && data.full_name)
                        nameEl.textContent = data.full_name;
                    if (descEl && data.description)
                        descEl.textContent = data.description;
                    if (starsEl && typeof data.stargazers_count === 'number') {
                        starsEl.textContent = formatCount(
                            data.stargazers_count,
                        );
                    }
                    if (forksEl && typeof data.forks === 'number') {
                        forksEl.textContent = formatCount(data.forks);
                    }
                    if (data.language && langEl && langDotEl && langNameEl) {
                        var color = LANG_COLORS[data.language];
                        langDotEl.style.background = color || '';
                        langNameEl.textContent = data.language;
                        langEl.removeAttribute('hidden');
                    }
                })
                .catch(function () {});
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initGithubCards);
    } else {
        initGithubCards();
    }
})();
