# Amazon Brand Switcher

A Chrome extension for Amazon Seller Central that lets you instantly switch between brand accounts and navigate to frequently used pages using custom keyboard shortcuts.

## Features

- **One-key brand switching** — Save any Seller Central account as a keyboard shortcut and switch to it instantly
- **Auto-detects your brand** — Opens the popup and it reads the active account name and IDs automatically
- **Reliable URL-based switching** — Uses Amazon's internal Merchant ID and Marketplace ID, so it won't break if Amazon updates their UI
- **Page navigation shortcuts** — Jump to Manage Inventory, Orders, Advertising, or any page in one keystroke
- **Drag-and-drop organisation** — Reorder your brands and pages with a drag handle
- **Delete shortcuts** — Remove any shortcut you no longer need
- **Chrome-native shortcut recorder** — Just click and press your key combination, exactly like Chrome's own shortcut manager

## Installation (from source)

1. Clone or download this repository
2. Open Chrome and go to `chrome://extensions/`
3. Enable **Developer mode** (top right toggle)
4. Click **Load unpacked**
5. Select the folder containing this extension

## How to use

1. Navigate to any Amazon Seller Central account
2. Click the **Amazon Brand Switcher** icon in your Chrome toolbar
3. Click **"Save Brand"** — the extension auto-detects the active account
4. Press your desired keyboard shortcut to assign it (e.g. `Ctrl + V`)
5. Click **"Save Brand Shortcut"**
6. Done — press that shortcut from anywhere on Seller Central to switch instantly

To manage all shortcuts, click **"Open Full Settings"** in the popup.

## Supported Marketplaces

Works across all Amazon Seller Central regions including:
`amazon.co.uk` · `amazon.com` · `amazon.de` · `amazon.fr` · `amazon.it` · `amazon.es` · `amazon.ca` · `amazon.com.au` · `amazon.in` · `amazon.co.jp` · `amazon.ae` · `amazon.nl` · `amazon.se` · `amazon.pl` · and more.

## Privacy

No personal data is collected. All shortcut configuration is stored locally in Chrome's sync storage (`chrome.storage.sync`). Nothing is ever sent to any external server.

Read the full [Privacy Policy](https://sheldon-desouza.github.io/amazon-brand-switcher/privacy-policy).

## License

MIT
