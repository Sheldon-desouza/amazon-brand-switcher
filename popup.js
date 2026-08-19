document.addEventListener('DOMContentLoaded', async () => {
  const mainContent = document.getElementById('main-content');
  const errorContent = document.getElementById('error-content');
  const openSettingsBtn = document.getElementById('open-settings');

  // Open settings page
  openSettingsBtn.addEventListener('click', (e) => {
    e.preventDefault();
    chrome.runtime.openOptionsPage();
  });

  // Get current active tab
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  // Check if it's an amazon seller central page
  if (!tab.url || !tab.url.includes('sellercentral.amazon.')) {
    mainContent.classList.add('hidden');
    errorContent.classList.remove('hidden');
    return;
  }

  // ==== TAB LOGIC ====
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.view-section').forEach(v => v.classList.remove('active'));
      
      btn.classList.add('active');
      document.getElementById(btn.dataset.target).classList.add('active');
    });
  });

  // ==== SHORTCUT INPUT LOGIC ====
  function setupShortcutInput(inputId) {
    const input = document.getElementById(inputId);
    input.dataset.modifier = 'none';
    input.dataset.key = '';

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') return;
      e.preventDefault();

      if (['Backspace', 'Delete'].includes(e.key)) {
        input.value = '';
        input.dataset.modifier = 'none';
        input.dataset.key = '';
        return;
      }
      
      if (['Control', 'Alt', 'Shift', 'Meta'].includes(e.key)) return;

      const isCtrl = e.ctrlKey || e.metaKey;
      const isAlt = e.altKey;
      const isShift = e.shiftKey;

      let modifier = 'none';
      let modText = '';
      if (isCtrl && !isAlt && !isShift) { modifier = 'ctrl'; modText = 'Ctrl + '; }
      else if (!isCtrl && isAlt && !isShift) { modifier = 'alt'; modText = 'Alt + '; }
      else if (!isCtrl && !isAlt && isShift) { modifier = 'shift'; modText = 'Shift + '; }

      let key = e.key.toUpperCase();
      if (key === ' ') key = 'SPACE';
      
      input.dataset.modifier = modifier;
      input.dataset.key = key;
      input.value = modText + key;
    });
  }

  setupShortcutInput('page-shortcut-input');
  setupShortcutInput('client-shortcut-input');

  // ==== PAGE VIEW LOGIC ====
  const pageNameInput = document.getElementById('page-name');
  const pageShortcutInput = document.getElementById('page-shortcut-input');
  const savePageBtn = document.getElementById('save-page-btn');
  const pageStatus = document.getElementById('page-status');

  const urlObj = new URL(tab.url);
  const currentUrlPath = urlObj.pathname + urlObj.search;
  pageNameInput.value = tab.title.split('|')[0].trim();

  savePageBtn.addEventListener('click', () => {
    const pageName = pageNameInput.value.trim();
    const modifier = pageShortcutInput.dataset.modifier;
    const key = pageShortcutInput.dataset.key;

    if (!pageName || !key) {
      alert('Please enter a name and record a shortcut key.');
      return;
    }

    chrome.storage.sync.get(['pageShortcuts'], (data) => {
      const shortcuts = data.pageShortcuts || [];
      const existingIndex = shortcuts.findIndex(s => s.url === currentUrlPath);
      if (existingIndex > -1) {
        shortcuts[existingIndex].name = pageName;
        shortcuts[existingIndex].modifier = modifier;
        shortcuts[existingIndex].key = key;
      } else {
        shortcuts.push({ name: pageName, url: currentUrlPath, modifier, key });
      }

      chrome.storage.sync.set({ pageShortcuts: shortcuts }, () => {
        pageStatus.classList.remove('hidden');
        savePageBtn.disabled = true;
        setTimeout(() => window.close(), 1000);
      });
    });
  });

  // ==== CLIENT VIEW LOGIC ====
  const clientNameInput = document.getElementById('client-name');
  const clientShortcutInput = document.getElementById('client-shortcut-input');
  const saveClientBtn = document.getElementById('save-client-btn');
  const clientStatus = document.getElementById('client-status');

  let activeMerchantId = '';
  let activeMarketplaceId = '';

  // Extract from URL if present
  const params = new URLSearchParams(urlObj.search);
  activeMerchantId = params.get('merchant') || params.get('mons_sel_dir_mcid') || '';
  activeMarketplaceId = params.get('mons_sel_mkid') || '';

  // Inject script to get client name from DOM
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    function: () => {
      // Common IDs for the picker
      const newFormatLabel = document.querySelector('.dropdown-account-switcher-header-label');
      if (newFormatLabel) {
        // This handles the new HTML format provided by the user
        const globalLabel = newFormatLabel.querySelector('.dropdown-account-switcher-header-label-global');
        const regionalLabel = newFormatLabel.querySelector('.dropdown-account-switcher-header-label-regional');
        
        if (globalLabel && regionalLabel) {
          return `${globalLabel.textContent.trim()} | ${regionalLabel.textContent.trim()}`;
        }
        return newFormatLabel.textContent.trim();
      }

      const picker = document.querySelector('#partner-switcher') || 
                     document.querySelector('.merchant-picker-container') ||
                     document.querySelector('[data-test-id="partner-switcher-button"]') ||
                     document.querySelector('.sc-merchant-picker');
      if (picker) return picker.textContent.trim();
      
      // Fallback: Look for the specific "Client | Country" text format in the header
      const headerElements = document.querySelectorAll('header div, header button, header span, nav div, nav button, nav span');
      for (const el of headerElements) {
        // Must be a relatively short string containing a pipe
        if (el.textContent.includes('|') && el.textContent.length < 50 && el.children.length < 5) {
          return el.textContent.trim();
        }
      }
      
      return document.title.split('|')[0].trim();
    }
  }, (results) => {
    if (results && results[0] && results[0].result) {
      clientNameInput.value = results[0].result.replace(/\n/g, ' ').replace(/\s+/g, ' ');
    } else {
      clientNameInput.value = 'Unknown Client';
    }
  });

  saveClientBtn.addEventListener('click', () => {
    const clientName = clientNameInput.value.trim();
    const modifier = clientShortcutInput.dataset.modifier;
    const key = clientShortcutInput.dataset.key;

    if (!key) {
      alert('Please record a shortcut key.');
      return;
    }

    if (!activeMerchantId) {
      alert('Could not automatically detect the underlying Merchant ID from the URL. Amazon might have changed their routing.');
      // We can still try to save it, but it might not switch properly later
      // Or we can ask them to refresh the page.
    }

    chrome.storage.sync.get(['clients'], (data) => {
      const clients = data.clients || [];
      const existingIndex = clients.findIndex(c => c.merchantId === activeMerchantId && activeMerchantId !== '');
      
      if (existingIndex > -1) {
        clients[existingIndex].name = clientName;
        clients[existingIndex].modifier = modifier;
        clients[existingIndex].key = key;
        clients[existingIndex].marketplaceId = activeMarketplaceId;
      } else {
        clients.push({ 
          name: clientName, 
          modifier, 
          key, 
          merchantId: activeMerchantId,
          marketplaceId: activeMarketplaceId 
        });
      }

      chrome.storage.sync.set({ clients }, () => {
        clientStatus.classList.remove('hidden');
        saveClientBtn.disabled = true;
        setTimeout(() => window.close(), 1000);
      });
    });
  });

});
