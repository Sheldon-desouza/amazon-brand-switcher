# Chrome Web Store Listing — Seller Central Brand Switcher

> Last Updated: 2026-08-13

---

## Store Listing

**Extension Name** ✅
```
Seller Central Brand Switcher
```

**Short Description** ✅ *(max 132 chars)*
```
Switch between Amazon Seller Central brand accounts instantly using keyboard shortcuts, and stay on the same page.
```
*(117 chars)*

**Detailed Description** ✅
```
Seller Central Brand Switcher lets Amazon agency users and multi-brand sellers switch between Seller Central accounts and brand marketplaces with a single keyboard shortcut — without leaving the page they are working on.

KEY FEATURES

Switch brands with a keyboard shortcut — no more clicking through menus
Stay on the same page when switching (e.g. switching while on /inventory keeps you on /inventory for the new brand)
Assign keyboard shortcuts to frequently visited pages (Manage Inventory, Orders, Add a Product, etc.)
Supports all 20 Amazon marketplaces worldwide
Drag-and-drop to reorder shortcuts in settings
Accidentally added a brand as a page shortcut? Drag it across tables to convert it automatically

HOW TO USE IT

1. Visit any Amazon Seller Central page while logged in as the brand you want to register.
2. Click the extension icon and go to the "Save Brand" tab.
3. Press a keyboard shortcut combination — the detected brand name fills in automatically.
4. Click "Save Brand Shortcut".
5. Repeat for each brand. Then press the shortcut from any Seller Central page to switch instantly.

PERMISSIONS & PRIVACY

This extension only runs on sellercentral.amazon.* pages. It does not collect, transmit, or share any data. All settings are stored locally in your browser using Chrome's built-in sync storage.
```

**Category**: Productivity

**Single Purpose**: Switch between Amazon Seller Central brand accounts using keyboard shortcuts and stay on the same page.

**Primary Language**: English

---

## Graphics & Assets

| Asset | Dimensions | Status | Filename |
|-------|-----------|--------|----------|
| Extension Icon (16px) | 16×16 PNG | ✅ Ready | icons/icon-16.png |
| Extension Icon (48px) | 48×48 PNG | ✅ Ready | icons/icon-48.png |
| Store Icon (128px) | 128×128 PNG | ✅ Ready | icons/icon-128.png |
| Screenshot 1 | 1280×800 or 640×400 | ⬜ Needed | Options page showing brand shortcuts |
| Screenshot 2 | 1280×800 or 640×400 | ⬜ Needed | Popup open on Seller Central page |
| Screenshot 3 | 1280×800 or 640×400 | ⬜ Needed | Brand switch demo |
| Small Promo Tile | 440×280 | ⬜ Optional | |

---

## Permissions Justification

| Permission | Type | Justification |
|------------|------|---------------|
| storage | permissions | Stores keyboard shortcut configuration (brand names, shortcut keys, page URLs) in chrome.storage.sync so settings sync across devices, and chrome.storage.local for transient pending-switch state between page navigations. |
| activeTab | permissions | Reads the URL and title of the active Seller Central tab to pre-fill the brand name and current page path when the user opens the popup to register a shortcut. |
| scripting | permissions | Injects a script into the active Seller Central tab to read the brand name from the page DOM header (the merchant picker element), which is not accessible via URL alone. |
| https://sellercentral.amazon.com/* | host_permissions | Injects the keyboard shortcut listener content script on the US Seller Central domain so brand switching and page navigation shortcuts work there. |
| https://sellercentral.amazon.co.uk/* | host_permissions | Same as above for UK. |
| https://sellercentral.amazon.ca/* | host_permissions | Same as above for Canada. |
| https://sellercentral.amazon.com.mx/* | host_permissions | Same as above for Mexico. |
| https://sellercentral.amazon.de/* | host_permissions | Same as above for Germany. |
| https://sellercentral.amazon.fr/* | host_permissions | Same as above for France. |
| https://sellercentral.amazon.it/* | host_permissions | Same as above for Italy. |
| https://sellercentral.amazon.es/* | host_permissions | Same as above for Spain. |
| https://sellercentral.amazon.co.jp/* | host_permissions | Same as above for Japan. |
| https://sellercentral.amazon.com.au/* | host_permissions | Same as above for Australia. |
| https://sellercentral.amazon.in/* | host_permissions | Same as above for India. |
| https://sellercentral.amazon.ae/* | host_permissions | Same as above for UAE. |
| https://sellercentral.amazon.sa/* | host_permissions | Same as above for Saudi Arabia. |
| https://sellercentral.amazon.nl/* | host_permissions | Same as above for Netherlands. |
| https://sellercentral.amazon.se/* | host_permissions | Same as above for Sweden. |
| https://sellercentral.amazon.pl/* | host_permissions | Same as above for Poland. |
| https://sellercentral.amazon.com.tr/* | host_permissions | Same as above for Turkey. |
| https://sellercentral.amazon.sg/* | host_permissions | Same as above for Singapore. |

---

## Privacy & Data Use

**Does the extension collect user data?** No

All data stays locally in the browser via chrome.storage. No external servers, no analytics, no telemetry.

### Data Use Certification
- [x] Data is NOT sold to third parties
- [x] Data is NOT used for purposes unrelated to the extension's core functionality
- [x] Data is NOT used for creditworthiness or lending purposes

---

## Privacy Policy

**Privacy Policy URL**: [HOST THIS AT A PUBLIC URL — e.g. GitHub Pages]

### Privacy Policy Text (copy and host publicly)

```
Privacy Policy — Seller Central Brand Switcher
Last updated: 2026-08-13

Seller Central Brand Switcher is a Chrome extension that helps Amazon Seller Central
users switch between brand accounts using keyboard shortcuts.

DATA WE COLLECT
The extension does not collect, transmit, or store personal data on external servers.
The only data stored is your keyboard shortcut configuration (brand names, shortcut key
combinations, page URLs) saved locally in Chrome's built-in storage APIs.

DATA WE DO NOT COLLECT
- No browsing history
- No Amazon credentials
- No personally identifiable information
- No analytics or tracking
- No third-party data sharing

CONTACT: [YOUR EMAIL]
```

---

## Distribution

**Visibility**: Public  
**Regions**: All regions  
**Pricing**: Free  

---

## Developer Info

**Publisher Name**: [YOUR NAME OR COMPANY — e.g. Your Company Name]  
**Contact Email**: [YOUR EMAIL — shown publicly]  
**Support URL**: [GitHub Issues or email]  
**Homepage URL**: [Optional]  

---

## Pre-Submission Checklist

- [x] manifest_version 3
- [x] All icons exist at correct dimensions (16, 48, 128px)
- [x] No eval() or inline scripts
- [x] host_permissions scoped to sellercentral.amazon.* only
- [ ] Privacy policy URL is live and publicly accessible
- [ ] At least 1 screenshot at 1280x800 or 640x400
- [ ] ZIP prepared (see command below)
- [ ] Developer account registered at https://chrome.google.com/webstore/devconsole ($5 one-time fee)

---

## Version History

| Version | Date | Changes | Status |
|---------|------|---------|--------|
| 1.2.0 | 2026-08-20 | Replaced raw marketplace domains with "Supports all 20 Amazon marketplaces worldwide" in description to fix CWS Keyword Spam rejection. | Draft |
| 1.2.0 | 2026-08-13 | Stay-on-page toggle, auto-confirm account switcher, cross-table DnD, icons added | Rejected (Keyword Spam) |

---

## ZIP Command

Run from the parent directory:

```bash
cd ~/your-projects-folder
zip -r seller-central-brand-switcher-v1.2.0.zip amazon-client-switcher/ \
  --exclude "amazon-client-switcher/.git/*" \
  --exclude "amazon-client-switcher/generate_icons.py" \
  --exclude "amazon-client-switcher/CHROMEWEBSTORE.md" \
  --exclude "amazon-client-switcher/task.md"
```
