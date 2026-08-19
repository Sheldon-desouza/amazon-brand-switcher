chrome.runtime.onInstalled.addListener(() => {
  // Initialize default settings if they don't exist
  chrome.storage.sync.get(['clients', 'pageShortcuts', 'stayOnPage'], (result) => {
    let clients = result.clients;
    
    // If empty or undefined, initialize with an empty array
    if (!clients) {
      clients = [];
    }
    
    let pageShortcuts = result.pageShortcuts;
    if (!pageShortcuts || pageShortcuts.length === 0) {
      pageShortcuts = [
        { name: "Manage Inventory", url: "/inventory", modifier: "shift", key: "I" },
        { name: "Orders", url: "/orders", modifier: "shift", key: "O" }
      ];
    }

    // Default: stay on the current page when switching clients
    const stayOnPage = result.stayOnPage !== undefined ? result.stayOnPage : true;

    chrome.storage.sync.set({ clients, pageShortcuts, stayOnPage }, () => {
      console.log('[SC Brand Switcher] Settings initialized with examples.');
    });
  });
});
