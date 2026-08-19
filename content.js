let clients = [];
let pageShortcuts = [];

// Load settings from storage
function loadSettings() {
  chrome.storage.sync.get(['clients', 'pageShortcuts'], (data) => {
    clients = data.clients || [];
    pageShortcuts = data.pageShortcuts || [];
    console.log('[SC Brand Switcher] Settings loaded:', { clients, pageShortcuts });
  });
}

// Reload settings when they are changed in the options page
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'sync') {
    loadSettings();
  }
});

// Initial load
loadSettings();

// Auto-confirm account switcher if we land on it during a brand switch
autoConfirmAccountSwitcher();

// Listen for keyboard events
document.addEventListener('keydown', (e) => {
  // Ignore if typing in an input field, textarea, or contenteditable element
  const activeTag = document.activeElement ? document.activeElement.tagName.toLowerCase() : '';
  const isInput = ['input', 'textarea', 'select'].includes(activeTag) || 
                  (document.activeElement && document.activeElement.isContentEditable);
  
  if (isInput) {
    return;
  }

  const key = e.key.toUpperCase();
  // Determine if modifiers are pressed
  const isCtrl = e.ctrlKey || e.metaKey; // Treat Cmd on Mac as Ctrl
  const isAlt = e.altKey;
  const isShift = e.shiftKey;

  let modifier = 'none';
  if (isCtrl && !isAlt && !isShift) modifier = 'ctrl';
  else if (!isCtrl && isAlt && !isShift) modifier = 'alt';
  else if (!isCtrl && !isAlt && isShift) modifier = 'shift';
  // If multiple modifiers are pressed, we ignore it for now as our UI doesn't support it

  // Check page shortcuts first
  const pageMatch = pageShortcuts.find(s => s.key === key && s.modifier === modifier);
  if (pageMatch && pageMatch.url) {
    e.preventDefault();
    console.log(`[SC Brand Switcher] Navigating to ${pageMatch.name}`);
    window.location.href = pageMatch.url;
    return;
  }

  // Check client shortcuts
  const clientMatch = clients.find(c => c.key === key && c.modifier === modifier);
  if (clientMatch) {
    e.preventDefault();
    console.log(`[SC Brand Switcher] Switching to brand: ${clientMatch.name}`);
    switchClient(clientMatch);
  }
});

// ==== MARKETPLACE → DOMAIN LOOKUP ====
// Maps Amazon marketplaceId → Seller Central hostname
const MARKETPLACE_DOMAINS = {
  'ATVPDKIKX0DER':  'sellercentral.amazon.com',       // US
  'A1F83G8C2ARO7P': 'sellercentral.amazon.co.uk',     // UK
  'A2EUQ1WTGCTBG2': 'sellercentral.amazon.ca',        // Canada
  'A1AM78C64UM0Y8': 'sellercentral.amazon.com.mx',    // Mexico
  'A1PA6795UKMFR9': 'sellercentral.amazon.de',        // Germany
  'A13V1IB3VIYZZH': 'sellercentral.amazon.fr',        // France
  'APJ6JRA9NG5V4':  'sellercentral.amazon.it',        // Italy
  'A1RKKUPIHCS9HS': 'sellercentral.amazon.es',        // Spain
  'A1VC38T7YXB528': 'sellercentral.amazon.co.jp',     // Japan
  'A39IBJ37TRP1C6': 'sellercentral.amazon.com.au',    // Australia
  'A21TJRUUN4KGV':  'sellercentral.amazon.in',        // India
  'A2VIGQ35RCS4UG': 'sellercentral.amazon.ae',        // UAE
  'A17E79C6D8DWNP': 'sellercentral.amazon.sa',        // Saudi Arabia
  'A1805IZSGTT6HS': 'sellercentral.amazon.nl',        // Netherlands
  'A2NODRKZP88ZB9': 'sellercentral.amazon.se',        // Sweden
  'AZ08D5ABTJN5B':  'sellercentral.amazon.pl',        // Poland
  'A33AVAJ2PDY3EV': 'sellercentral.amazon.com.tr',    // Turkey
  'A19VAU5U5O7RUS': 'sellercentral.amazon.sg',        // Singapore
  'A10LNXVLY0HZKH': 'sellercentral.amazon.com.be',    // Belgium
  'A2Q3Y263D00KWC': 'sellercentral.amazon.com.br',    // Brazil
};

// ==== ACCOUNT SWITCHER AUTO-CONFIRM ====

// Store the pending switch so the account-switcher page can auto-confirm it
async function storePendingSwitch(clientConfig) {
  return new Promise(resolve => chrome.storage.local.set({
    scBrandSwitcherPending: {
      brandName:     clientConfig.name,
      merchantId:    clientConfig.merchantId,
      marketplaceId: clientConfig.marketplaceId,
      ts:            Date.now()
    }
  }, resolve));
}

// Silently click through Amazon's "Select an account" page when triggered by a shortcut
async function autoConfirmAccountSwitcher() {
  if (!window.location.pathname.includes('/account-switcher/')) return;

  const data = await new Promise(r =>
    chrome.storage.local.get(['scBrandSwitcherPending'], r)
  );
  const pending = data.scBrandSwitcherPending;

  // Ignore stale entries (older than 30 seconds)
  if (!pending || Date.now() - pending.ts > 30000) {
    chrome.storage.local.remove(['scBrandSwitcherPending']);
    return;
  }

  chrome.storage.local.remove(['scBrandSwitcherPending']);
  console.log('[SC Brand Switcher] Auto-confirming account switcher for:', pending.brandName);

  // Wait for the account list to render
  await new Promise(r => setTimeout(r, 1200));

  // Parse brand + marketplace from stored name e.g. "V12 Footwear | United Kingdom"
  const parts = pending.brandName.split('|');
  const brandSearch       = parts[0].trim().toLowerCase();
  const marketplaceSearch = (parts[1] || '').trim().toLowerCase();

  // Collect all visible, short-text candidate elements from the account list
  const candidates = Array.from(document.querySelectorAll(
    'li, [role="radio"], [role="option"], [role="row"], ' +
    '[class*="account"], [class*="merchant"], [class*="item"]'
  )).filter(el => {
    const t = el.textContent.trim();
    return t.length > 2 && t.length < 120;
  });

  let bestMatch = null;
  let bestScore = -1;

  for (const el of candidates) {
    const text = el.textContent.toLowerCase();
    let score = 0;
    if (brandSearch       && text.includes(brandSearch))       score += 3;
    if (marketplaceSearch && text.includes(marketplaceSearch)) score += 2;
    if (score > bestScore) {
      bestScore = score;
      bestMatch = el;
    }
  }

  if (bestMatch && bestScore > 0) {
    console.log('[SC Brand Switcher] Auto-clicking account:', bestMatch.textContent.trim());
    bestMatch.click();
    await new Promise(r => setTimeout(r, 500));
  } else {
    console.warn('[SC Brand Switcher] No account match found — user must select manually.');
    return; // Don’t blindly click "Select account" if we didn’t match anything
  }

  // Click the "Select account" button
  const selectBtn = Array.from(document.querySelectorAll('button, input[type="submit"], a'))
    .find(b => /select account/i.test(b.textContent + (b.value || '')));

  if (selectBtn) {
    console.log('[SC Brand Switcher] Clicking \'Select account\' button');
    selectBtn.click();
  }
}


async function switchClient(clientConfig) {
  // If we have the exact Amazon merchant IDs, use the robust URL redirect method
  if (clientConfig.merchantId) {
    try {
      // Read the stayOnPage preference (default: true)
      const { stayOnPage = true } = await new Promise(resolve =>
        chrome.storage.sync.get(['stayOnPage'], resolve)
      );

      const currentUrl = new URL(window.location.href);

      // Resolve the target domain from the stored marketplaceId
      const targetHost = clientConfig.marketplaceId
        ? MARKETPLACE_DOMAINS[clientConfig.marketplaceId]
        : null;

      let url;
      if (stayOnPage && targetHost) {
        // Stay on the equivalent page — switch domain, keep path + search
        url = new URL(currentUrl.pathname + currentUrl.search, `https://${targetHost}`);
        console.log(`[SC Brand Switcher] Stay-on-page mode: switching domain to ${targetHost}`);
      } else {
        // Legacy behaviour: use current domain (Amazon will redirect to home on the new account)
        url = new URL(currentUrl.pathname + currentUrl.search, currentUrl.origin);
        console.log(`[SC Brand Switcher] Home-page mode: staying on current domain`);
      }

      // Set common Amazon merchant routing parameters
      url.searchParams.set('merchant', clientConfig.merchantId);

      // Some Amazon endpoints use this format:
      if (clientConfig.merchantId.startsWith('amzn1.merchant.d.')) {
        url.searchParams.set('mons_sel_dir_mcid', clientConfig.merchantId);
      } else {
        url.searchParams.set('mons_sel_dir_mcid', 'amzn1.merchant.d.' + clientConfig.merchantId);
      }

      if (clientConfig.marketplaceId) {
        url.searchParams.set('mons_sel_mkid', clientConfig.marketplaceId);
      }

      console.log('[SC Brand Switcher] Navigating via URL params to:', url.toString());
      await storePendingSwitch(clientConfig); // store before navigating
      window.location.href = url.toString();
    } catch (e) {
      console.error('[SC Brand Switcher] Error during URL redirect:', e);
    }
    return;
  }

  // ==== FALLBACK FOR LEGACY MANUALLY ADDED CLIENTS ====
  console.log('[SC Brand Switcher] No Merchant ID found. Falling back to DOM clicking.');
  
  // 1. Try to find the merchant picker dropdown trigger
  let pickerTrigger = document.querySelector('#partner-switcher') || 
                      document.querySelector('.merchant-picker-container') ||
                      document.querySelector('[data-test-id="partner-switcher-button"]') ||
                      document.querySelector('#merchant-picker') ||
                      document.querySelector('.sc-merchant-picker');

  if (!pickerTrigger) {
    // Fallback: look for the element containing the current merchant name in the navigation area
    const possibleTriggers = document.querySelectorAll('div, a, span, button');
    for (const el of possibleTriggers) {
      if (el.textContent.includes('|') && el.textContent.length < 50 && el.children.length < 5) {
        if (el.textContent.includes('United Kingdom') || el.textContent.includes('United States')) {
          pickerTrigger = el;
          const clickableParent = el.closest('a, button, [role="button"], [class*="picker"]');
          if (clickableParent) pickerTrigger = clickableParent;
          break;
        }
      }
    }
  }

  if (!pickerTrigger) {
    console.error('[SC Brand Switcher] Could not find the merchant picker dropdown.');
    alert(`SC Brand Switcher:\nCould not find the brand dropdown menu on this page.`);
    return;
  }

  // 2. Click the picker to open it
  pickerTrigger.click();

  // 3. Wait a moment for the dropdown to render
  await new Promise(resolve => setTimeout(resolve, 500));

  // 4. Find the client in the dropdown
  // Replace quotes to avoid xpath syntax errors
  const safeName = clientConfig.name.replace(/'/g, "");
  const xpath = `//div[contains(text(), '${safeName}')] | //span[contains(text(), '${safeName}')] | //a[contains(text(), '${safeName}')]`;
  
  try {
    const result = document.evaluate(xpath, document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
    
    let clientElement = null;
    for (let i = 0; i < result.snapshotLength; i++) {
      const el = result.snapshotItem(i);
      if (el.closest('li, .merchant-item, [role="menuitem"]')) {
         clientElement = el.closest('li, .merchant-item, [role="menuitem"]');
         break;
      } else {
         clientElement = el;
      }
    }

    if (!clientElement) {
      console.error(`[SC Brand Switcher] Could not find brand "${clientConfig.name}" in the dropdown.`);
      pickerTrigger.click(); // close it
      return;
    }

    clientElement.click();
  } catch (e) {
    console.error('[SC Brand Switcher] Error during DOM fallback:', e);
  }
}
