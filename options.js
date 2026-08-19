document.addEventListener('DOMContentLoaded', () => {
  const clientsBody = document.getElementById('clients-body');
  const pagesBody = document.getElementById('pages-body');
  const saveBtn = document.getElementById('save-btn');
  const saveStatus = document.getElementById('save-status');

  const stayOnPageToggle = document.getElementById('stay-on-page-toggle');

  // Load existing data
  chrome.storage.sync.get(['clients', 'pageShortcuts', 'stayOnPage'], (data) => {
    const clients = data.clients || [];
    const pageShortcuts = data.pageShortcuts || [];
    // Default to true if not yet set
    stayOnPageToggle.checked = data.stayOnPage !== undefined ? data.stayOnPage : true;

    clients.forEach(client => addClientRow(client));
    pageShortcuts.forEach(shortcut => addPageShortcutRow(shortcut));
    
    // Setup drag and drop — pass both bodies for cross-table support
    setupDragAndDrop(clientsBody, pagesBody);
    setupDragAndDrop(pagesBody, clientsBody);
  });

  saveBtn.addEventListener('click', () => {
    const clients = [];
    document.querySelectorAll('.client-row').forEach(row => {
      const name = row.dataset.name;
      const merchantId = row.dataset.merchantId;
      const marketplaceId = row.dataset.marketplaceId;
      const shortcutInput = row.querySelector('.client-shortcut');
      const modifier = shortcutInput.dataset.modifier || 'none';
      const key = shortcutInput.dataset.key || '';
      
      clients.push({ name, merchantId, marketplaceId, modifier, key });
    });

    const pageShortcuts = [];
    document.querySelectorAll('.page-row').forEach(row => {
      const name = row.dataset.name;
      const url = row.dataset.url;
      const shortcutInput = row.querySelector('.page-shortcut');
      const modifier = shortcutInput.dataset.modifier || 'none';
      const key = shortcutInput.dataset.key || '';
      
      pageShortcuts.push({ name, url, modifier, key });
    });

    const stayOnPage = stayOnPageToggle.checked;

    chrome.storage.sync.set({ clients, pageShortcuts, stayOnPage }, () => {
      saveStatus.classList.remove('hidden');
      setTimeout(() => {
        saveStatus.classList.add('hidden');
      }, 2000);
    });
  });

  function formatShortcut(modifier, key) {
    if (!key) return '';
    let modText = '';
    if (modifier === 'ctrl') modText = 'Ctrl + ';
    if (modifier === 'alt') modText = 'Alt + ';
    if (modifier === 'shift') modText = 'Shift + ';
    return modText + key;
  }

  // Factory: creates and returns a client row without appending
  function buildClientRow(client) {
    const tr = document.createElement('tr');
    tr.className = 'client-row draggable-row';
    tr.draggable = true;
    tr.dataset.name = client.name;
    tr.dataset.merchantId = client.merchantId || '';
    tr.dataset.marketplaceId = client.marketplaceId || '';

    tr.innerHTML = `
      <td class="drag-handle">☰</td>
      <td><strong>${escapeHtml(client.name)}</strong></td>
      <td>
        <input type="text" class="client-shortcut" value="${formatShortcut(client.modifier, client.key)}"
               placeholder="Type a shortcut..." readonly
               style="text-align: center; cursor: pointer; width: 140px;"
               data-modifier="${client.modifier || 'none'}" data-key="${client.key || ''}">
      </td>
      <td><button class="delete-btn" title="Remove">Remove</button></td>
    `;

    tr.querySelector('.delete-btn').addEventListener('click', () => tr.remove());
    setupKeyInput(tr.querySelector('.client-shortcut'));
    return tr;
  }

  function addClientRow(client) {
    clientsBody.appendChild(buildClientRow(client));
  }

  // Factory: creates and returns a page shortcut row without appending
  function buildPageRow(shortcut) {
    const tr = document.createElement('tr');
    tr.className = 'page-row draggable-row';
    tr.draggable = true;
    tr.dataset.name = shortcut.name;
    tr.dataset.url = shortcut.url || '';

    tr.innerHTML = `
      <td class="drag-handle">☰</td>
      <td><strong>${escapeHtml(shortcut.name)}</strong></td>
      <td>
        <input type="text" class="page-shortcut" value="${formatShortcut(shortcut.modifier, shortcut.key)}"
               placeholder="Type a shortcut..." readonly
               style="text-align: center; cursor: pointer; width: 140px;"
               data-modifier="${shortcut.modifier || 'none'}" data-key="${shortcut.key || ''}">
      </td>
      <td><button class="delete-btn" title="Remove">Remove</button></td>
    `;

    tr.querySelector('.delete-btn').addEventListener('click', () => tr.remove());
    setupKeyInput(tr.querySelector('.page-shortcut'));
    return tr;
  }

  function addPageShortcutRow(shortcut) {
    pagesBody.appendChild(buildPageRow(shortcut));
  }

  // Convert a dragged row to the correct type and insert it into the target table
  function convertAndInsert(row, toBody, nearRow, clientY) {
    const name = row.dataset.name;
    const inp = row.querySelector('input[type="text"]');
    const modifier = inp ? inp.dataset.modifier || 'none' : 'none';
    const key = inp ? inp.dataset.key || '' : '';

    row.remove();

    let newRow;
    if (toBody === clientsBody) {
      // Page shortcut → Brand shortcut (merchantId/marketplaceId start empty)
      newRow = buildClientRow({ name, merchantId: '', marketplaceId: '', modifier, key });
    } else {
      // Brand shortcut → Page shortcut (url starts empty)
      newRow = buildPageRow({ name, url: '', modifier, key });
    }

    if (nearRow && nearRow.parentElement === toBody) {
      const mid = nearRow.getBoundingClientRect().y + nearRow.getBoundingClientRect().height / 2;
      if (clientY - mid > 0) {
        nearRow.after(newRow);
      } else {
        nearRow.before(newRow);
      }
    } else {
      toBody.appendChild(newRow);
    }
  }

  function setupKeyInput(input) {
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
      if (isCtrl && !isAlt && !isShift) modifier = 'ctrl';
      else if (!isCtrl && isAlt && !isShift) modifier = 'alt';
      else if (!isCtrl && !isAlt && isShift) modifier = 'shift';
      
      let key = e.key.toUpperCase();
      if (key === ' ') key = 'SPACE';
      
      input.dataset.modifier = modifier;
      input.dataset.key = key;
      input.value = formatShortcut(modifier, key);
    });
  }

  // ==== DRAG AND DROP LOGIC ====
  let draggedRow = null;

  // tbody      = the table body this listener is attached to
  // otherBody  = the opposite table body (for cross-table drops)
  function setupDragAndDrop(tbody, otherBody) {
    tbody.addEventListener('dragstart', (e) => {
      if (e.target.classList.contains('draggable-row')) {
        draggedRow = e.target;
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', e.target.innerHTML);
        setTimeout(() => e.target.classList.add('dragging'), 0);
      }
    });

    tbody.addEventListener('dragend', (e) => {
      if (e.target.classList.contains('draggable-row')) {
        e.target.classList.remove('dragging');
        draggedRow = null;
        document.querySelectorAll('.drag-over').forEach(r => r.classList.remove('drag-over'));
        document.querySelectorAll('.drop-zone-active').forEach(s => s.classList.remove('drop-zone-active'));
      }
    });

    tbody.addEventListener('dragover', (e) => {
      if (!draggedRow) return;
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';

      const isCrossTable = draggedRow.parentElement !== tbody;
      const targetRow = e.target.closest('.draggable-row');

      if (isCrossTable) {
        // Highlight the section as a drop zone
        tbody.closest('section').classList.add('drop-zone-active');
      } else if (targetRow && targetRow !== draggedRow && targetRow.parentElement === tbody) {
        document.querySelectorAll('.drag-over').forEach(r => r.classList.remove('drag-over'));
        targetRow.classList.add('drag-over');
      }
    });

    tbody.addEventListener('dragleave', (e) => {
      const targetRow = e.target.closest('.draggable-row');
      if (targetRow) targetRow.classList.remove('drag-over');
      // Remove section highlight only when leaving the section entirely
      if (!tbody.contains(e.relatedTarget)) {
        tbody.closest('section').classList.remove('drop-zone-active');
      }
    });

    tbody.addEventListener('drop', (e) => {
      e.preventDefault();
      document.querySelectorAll('.drop-zone-active').forEach(s => s.classList.remove('drop-zone-active'));
      document.querySelectorAll('.drag-over').forEach(r => r.classList.remove('drag-over'));

      if (!draggedRow) return;

      const targetRow = e.target.closest('.draggable-row');
      const isCrossTable = draggedRow.parentElement !== tbody;

      if (isCrossTable) {
        // ---- Cross-table: convert row type ----
        convertAndInsert(draggedRow, tbody, targetRow, e.clientY);
      } else if (targetRow && targetRow !== draggedRow && targetRow.parentElement === tbody) {
        // ---- Same table: reorder ----
        const bounding = targetRow.getBoundingClientRect();
        const offset = bounding.y + (bounding.height / 2);
        if (e.clientY - offset > 0) {
          targetRow.after(draggedRow);
        } else {
          targetRow.before(draggedRow);
        }
      }
    });
  }

  function escapeHtml(unsafe) {
    if (!unsafe) return '';
    return unsafe
         .replace(/&/g, "&amp;")
         .replace(/</g, "&lt;")
         .replace(/>/g, "&gt;")
         .replace(/"/g, "&quot;")
         .replace(/'/g, "&#039;");
  }
});
