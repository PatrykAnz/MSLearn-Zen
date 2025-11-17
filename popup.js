document.addEventListener('DOMContentLoaded', async function() {
    var toggleBtn = document.getElementById('toggleBtn');
    var status = document.getElementById('status');
    
    var result = await chrome.storage.local.get(['zenModeEnabled']);
    var isEnabled = result.zenModeEnabled || false;
    
    updateUI(isEnabled);
    
    toggleBtn.addEventListener('click', async function() {
        isEnabled = !isEnabled;
        await chrome.storage.local.set({ zenModeEnabled: isEnabled });
        
        updateUI(isEnabled);
        
        var tabs = await chrome.tabs.query({
            url: 'https://learn.microsoft.com/en-us/training/modules/*'
        });
        
        for (var i = 0; i < tabs.length; i++) {
            try {
                chrome.tabs.sendMessage(tabs[i].id, { action: 'toggle', enabled: isEnabled });
            } catch (e) {
            }
        }
    });
    
    function updateUI(enabled) {
        if (enabled) {
            toggleBtn.textContent = 'Disable Zen Mode';
            toggleBtn.className = 'toggle-button active';
            status.textContent = 'Zen mode is ON';
        } else {
            toggleBtn.textContent = 'Enable Zen Mode';
            toggleBtn.className = 'toggle-button inactive';
            status.textContent = 'Zen mode is OFF';
        }
    }
});
