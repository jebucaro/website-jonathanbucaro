// Expand/collapse behavior for the agent-session shortcode. Button labels
// come from data attributes so one static file serves every language.
(function () {
    function initAgentSessions() {
        document
            .querySelectorAll('.agent-session:not([data-bound])')
            .forEach(function (el) {
                el.dataset.bound = '1';
                el.querySelectorAll('.agent-session-tool-toggle').forEach(
                    function (toggle) {
                        toggle.addEventListener('click', function () {
                            var detail = this.nextElementSibling;
                            var isExpanded =
                                this.getAttribute('aria-expanded') === 'true';
                            detail.style.display = isExpanded
                                ? 'none'
                                : 'block';
                            this.setAttribute(
                                'aria-expanded',
                                String(!isExpanded),
                            );
                            this.querySelector(
                                '.agent-session-chevron',
                            ).textContent = isExpanded ? '▸' : '▾';
                        });
                    },
                );
            });
    }

    function initCollapsibles() {
        document
            .querySelectorAll('.agent-session [data-collapsible]')
            .forEach(function (wrapper) {
                if (wrapper.dataset.measured === '1') return;
                wrapper.dataset.measured = '1';
                var textEl = wrapper.querySelector(
                    '.agent-session-text-collapse',
                );
                var btn = wrapper.querySelector('.agent-session-expand-btn');
                if (!textEl || !btn) return;
                if (textEl.scrollHeight <= textEl.clientHeight + 2) {
                    btn.style.display = 'none';
                    textEl.classList.remove('agent-session-text-collapse');
                    return;
                }
                btn.addEventListener('click', function () {
                    var expanded = textEl.classList.toggle('expanded');
                    btn.textContent = expanded
                        ? btn.dataset.showLess
                        : btn.dataset.showMore;
                });
            });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initAgentSessions);
    } else {
        initAgentSessions();
    }

    if (document.readyState === 'complete') {
        initCollapsibles();
    } else {
        window.addEventListener('load', initCollapsibles);
    }
})();
