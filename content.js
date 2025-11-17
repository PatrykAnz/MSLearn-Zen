(function() {
    var zenModeEnabled = false;
    var observer = null;
    
    function applyZenTheme() {
        var root = document.documentElement;
        if (!root) return;

        if (!root.dataset.prevThemeBodyBackgroundMedium || !root.dataset.prevThemeBodyBackground) {
            var styles = getComputedStyle(root);

            if (!root.dataset.prevThemeBodyBackgroundMedium) {
                var medium = styles.getPropertyValue('--theme-body-background-medium').trim();
                root.dataset.prevThemeBodyBackgroundMedium = medium || '';
            }

            if (!root.dataset.prevThemeBodyBackground) {
                var base = styles.getPropertyValue('--theme-body-background').trim();
                root.dataset.prevThemeBodyBackground = base || '';
            }
        }

        root.style.setProperty('--theme-body-background-medium', '#030303');
        root.style.setProperty('--theme-body-background', '#030303');
    }

    function restoreZenTheme() {
        var root = document.documentElement;
        if (!root) return;

        root.style.setProperty('--theme-body-background', '#1f1f1f');
        root.style.setProperty('--theme-body-background-medium', '#292929');
    }
    
    function removeElements() {
        if (!zenModeEnabled) return;
        
        var header = document.querySelector('header.layout-body-header');
        if (header && !header.hasAttribute('data-zen-removed')) {
            header.setAttribute('data-zen-removed', 'true');
            header.style.display = 'none';
            console.log('Microsoft Learn header removed');
        }
        
        var footer = document.querySelector('div.layout-body-footer[data-bi-name="layout-footer"]');
        if (footer && !footer.hasAttribute('data-zen-removed')) {
            footer.setAttribute('data-zen-removed', 'true');
            footer.style.display = 'none';
            console.log('Microsoft Learn footer removed');
        }
        
        var feedbackContainer = document.querySelector('div.modular-content-container.margin-block-xs');
        if (feedbackContainer && !feedbackContainer.hasAttribute('data-zen-removed')) {
            feedbackContainer.setAttribute('data-zen-removed', 'true');
            feedbackContainer.style.display = 'none';
            console.log('Microsoft Learn feedback section removed');
        }
    }
    
    function restoreElements() {
        if (zenModeEnabled) return;
        
        var header = document.querySelector('header.layout-body-header');
        if (header && header.hasAttribute('data-zen-removed')) {
            header.style.display = '';
            header.removeAttribute('data-zen-removed');
            console.log('Microsoft Learn header restored');
        }
        
        var footer = document.querySelector('div.layout-body-footer[data-bi-name="layout-footer"]');
        if (footer && footer.hasAttribute('data-zen-removed')) {
            footer.style.display = '';
            footer.removeAttribute('data-zen-removed');
            console.log('Microsoft Learn footer restored');
        }
        
        var feedbackContainer = document.querySelector('div.modular-content-container.margin-block-xs');
        if (feedbackContainer && feedbackContainer.hasAttribute('data-zen-removed')) {
            feedbackContainer.style.display = '';
            feedbackContainer.removeAttribute('data-zen-removed');
            console.log('Microsoft Learn feedback section restored');
        }
    }
    
    function startObserving() {
        if (observer) return;
        
        if (!document.body) {
            var checkBody = setInterval(function() {
                if (document.body) {
                    clearInterval(checkBody);
                    observer = new MutationObserver(function(mutations) {
                        if (zenModeEnabled) {
                            removeElements();
                        }
                    });
                    observer.observe(document.body, {
                        childList: true,
                        subtree: true
                    });
                }
            }, 50);
            return;
        }
        
        observer = new MutationObserver(function(mutations) {
            if (zenModeEnabled) {
                removeElements();
            }
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }
    
    function stopObserving() {
        if (observer) {
            observer.disconnect();
            observer = null;
        }
    }
    
    function updateZenMode(enabled) {
        zenModeEnabled = enabled;
        
        if (enabled) {
            applyZenTheme();
            removeElements();
            startObserving();
        } else {
            restoreZenTheme();
            restoreElements();
            stopObserving();
        }
    }
    
    chrome.storage.local.get(['zenModeEnabled'], function(result) {
        var isEnabled = result.zenModeEnabled || false;
        updateZenMode(isEnabled);
    });
    
    chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
        if (message.action === 'toggle') {
            updateZenMode(message.enabled);
            sendResponse({ success: true });
        }
        return true;
    });
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            if (zenModeEnabled) {
                removeElements();
                startObserving();
            }
        });
    } else {
        if (zenModeEnabled) {
            removeElements();
            startObserving();
        }
    }
})();
