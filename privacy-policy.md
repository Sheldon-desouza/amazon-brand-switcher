# Privacy Policy — Amazon Brand Switcher

*Last updated: August 2026*

Amazon Brand Switcher ("the Extension") is a Chrome browser extension designed to help Amazon Seller Central users switch between brand accounts and navigate pages using keyboard shortcuts.

---

## Data We Collect

The Extension does **not** collect, transmit, or store any personal data.

The only data saved is the shortcut configuration the user explicitly creates:
- Brand names (sourced from Amazon's own UI)
- Amazon Merchant IDs (sourced from the page URL)
- Marketplace IDs (sourced from the page URL)
- Keyboard shortcut key combinations chosen by the user

This configuration data is stored exclusively in Chrome's built-in sync storage (`chrome.storage.sync`) and is **never** sent to any external server or third party.

---

## Data Sharing

We do not share, sell, rent, or transfer any data to third parties under any circumstances.

---

## Permissions

The Extension requests only the minimum permissions necessary to function:

| Permission | Reason |
|---|---|
| `storage` | To save and sync the user's brand and page shortcuts across Chrome instances |
| `activeTab` | To read the current tab's URL when the user opens the popup, in order to extract the Amazon Merchant ID |
| `scripting` | To inject a read-only script to detect the brand name displayed in the Amazon Seller Central header |
| Host permissions (Amazon Seller Central) | To allow the content script to listen for keyboard shortcuts and trigger account switching on Seller Central pages |

---

## Third-Party Services

The Extension does not use any third-party analytics, tracking, advertising, or data processing services.

---

## Changes to This Policy

If this policy is updated, the updated version will be published at this URL with a revised "Last updated" date.

---

## Contact

For any privacy-related questions, please open an issue on the [GitHub repository](https://github.com/Sheldon-desouza/amazon-brand-switcher).
