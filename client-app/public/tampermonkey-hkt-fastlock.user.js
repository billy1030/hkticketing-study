// ==UserScript==
// @name         HK Ticketing Fast Ticket Picker & Auto-Lock (BIGBANG 2026 Edition)
// @namespace    https://hkticketing.com/
// @version      1.2.0
// @description  Instant seat selection, tier fallback, and checkout bypass for HK Ticketing (Kai Tak Stadium BIGBANG Concert)
// @author       HKT Research Suite
// @match        https://hkt.hkticketing.com/*
// @match        https://*.hkticketing.com/*
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_notification
// @grant        unsafeWindow
// @run-at       document-idle
// ==/UserScript==

(function () {
  'use strict';

  // --- CONFIGURATION ---
  const CONFIG = {
    targetProjectId: '50000001568003', // BIGBANG 2026
    targetSessionKeyword: '17 Nov',    // Match 17 Nov 2026 (Tuesday) 19:00
    targetQty: 3,                      // Number of tickets to select (Updated to 3)
    // Priority order: 699 first priority, then other tiers <= 1599
    tierPriority: [
      { name: '699', price: 699 },
      { name: '899', price: 899 },
      { name: '1299', price: 1299 },
      { name: '1,299', price: 1299 }
    ],
    pollIntervalMs: 60,                // Ultra-fast DOM polling
    maxTries: 250,                     // Timeout after ~15s
    autoSubmit: true,                  // Automatically click 'Next / 立即購買'
  };

  const log = (msg) => console.log(`%c[HKT-AUTO] ${msg}`, 'background: #10b981; color: #fff; font-weight: bold; padding: 2px 6px; border-radius: 4px;');
  const warn = (msg) => console.warn(`%c[HKT-AUTO] ${msg}`, 'background: #f59e0b; color: #fff; font-weight: bold; padding: 2px 6px; border-radius: 4px;');

  // Visual Overlay HUD
  function createHUD() {
    if (document.getElementById('hkt-auto-hud')) return;
    const hud = document.createElement('div');
    hud.id = 'hkt-auto-hud';
    hud.style.cssText = `
      position: fixed;
      top: 15px;
      right: 15px;
      z-index: 999999;
      background: rgba(10, 15, 29, 0.95);
      border: 1px solid rgba(16, 185, 129, 0.5);
      border-radius: 10px;
      padding: 12px 18px;
      box-shadow: 0 8px 30px rgba(0,0,0,0.5);
      color: #f1f5f9;
      font-family: system-ui, -apple-system, sans-serif;
      font-size: 13px;
      backdrop-filter: blur(8px);
      min-width: 260px;
    `;
    hud.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
        <span style="font-weight:800; color:#10b981; font-size:14px;">⚡ HKT FAST-LOCK</span>
        <span id="hkt-hud-status" style="font-size:11px; background:rgba(16,185,129,0.2); color:#10b981; padding:2px 6px; border-radius:4px; font-weight:700;">ACTIVE</span>
      </div>
      <div style="font-size:12px; color:#94a3b8; margin-bottom:4px;">Target: <b style="color:#e2e8f0;">17 Nov 19:00</b></div>
      <div style="font-size:12px; color:#94a3b8; margin-bottom:6px;">Target Qty: <b style="color:#e2e8f0;">${CONFIG.targetQty}</b></div>
      <div id="hkt-hud-action" style="font-size:11px; color:#38bdf8; font-family:monospace;">Waiting for ticket matrix...</div>
    `;
    document.body.appendChild(hud);
  }

  function updateHUD(text, isError = false) {
    const el = document.getElementById('hkt-hud-action');
    const statusEl = document.getElementById('hkt-hud-status');
    if (el) el.innerText = text;
    if (statusEl && isError) {
      statusEl.style.background = 'rgba(239, 68, 68, 0.2)';
      statusEl.style.color = '#ef4444';
      statusEl.innerText = 'WAITING';
    }
  }

  // --- AUTOMATION ENGINE ---

  // 1. Match and select session (17 Nov)
  function selectSession() {
    // HK Ticketing typically renders sessions in .session-item or tab buttons
    const candidates = Array.from(document.querySelectorAll('button, div, span, li'));
    const sessionNode = candidates.find(el => {
      const txt = el.innerText || '';
      return txt.includes(CONFIG.targetSessionKeyword) && !el.classList.contains('disabled');
    });

    if (sessionNode) {
      sessionNode.click();
      log(`Selected session: ${sessionNode.innerText.trim().replace(/\n/g, ' ')}`);
      return true;
    }
    return false;
  }

  // 2. Select Tier with Fallback
  function selectPriceTier() {
    const textNodes = Array.from(document.querySelectorAll('button, div, tr, li, .price-item, .seat-tier'));
    
    for (const tier of CONFIG.tierPriority) {
      // Find matching tier node
      const match = textNodes.find(el => {
        const text = (el.innerText || '').toUpperCase();
        const hasName = text.includes(tier.name.toUpperCase());
        const hasPrice = text.includes(String(tier.price));
        const isNotSoldOut = !text.includes('SOLD OUT') && !text.includes('售罄') && !text.includes('暫無');
        return (hasName || hasPrice) && isNotSoldOut && el.offsetParent !== null;
      });

      if (match) {
        log(`Found available tier: ${tier.name} ($${tier.price})`);
        updateHUD(`Selected: ${tier.name} ($${tier.price})`);
        match.click();

        // Increment Quantity
        setQuantity(CONFIG.targetQty);
        return true;
      }
    }
    return false;
  }

  // 3. Set Quantity (Click "+" button)
  function setQuantity(qty) {
    let currentQty = 1;
    // Look for '+' button
    const plusButtons = Array.from(document.querySelectorAll('button, span, i')).filter(el => {
      const txt = (el.innerText || '').trim();
      const aria = el.getAttribute('aria-label') || '';
      const cls = el.className || '';
      return (txt === '+' || aria.includes('add') || cls.includes('plus') || cls.includes('increase')) && el.offsetParent !== null;
    });

    if (plusButtons.length > 0) {
      const btn = plusButtons[0];
      for (let i = 1; i < qty; i++) {
        setTimeout(() => {
          btn.click();
          log(`Incremented quantity to ${i + 1}`);
        }, i * 50);
      }
    }
  }

  // 4. Agree to terms & Submit
  function submitOrder() {
    if (!CONFIG.autoSubmit) return;

    // Auto-check terms checkbox if exists
    const checkboxes = Array.from(document.querySelectorAll('input[type="checkbox"]'));
    checkboxes.forEach(cb => {
      if (!cb.checked) {
        cb.click();
        log('Accepted terms checkbox');
      }
    });

    // Look for submit / next / buy button
    setTimeout(() => {
      const buttons = Array.from(document.querySelectorAll('button, a, div')).filter(el => {
        const txt = (el.innerText || '').trim().toUpperCase();
        return (
          txt.includes('CONFIRM') ||
          txt.includes('立即購買') ||
          txt.includes('BUY NOW') ||
          txt.includes('NEXT') ||
          txt.includes('SUBMIT') ||
          txt.includes('下一步')
        ) && el.offsetParent !== null && !el.hasAttribute('disabled');
      });

      if (buttons.length > 0) {
        log('Clicking Submit / Confirm button!');
        updateHUD('LOCKING SEATS NOW...');
        buttons[0].click();
      }
    }, 200);
  }

  // Main Polling Loop
  let tries = 0;
  function runLoop() {
    createHUD();
    tries++;

    if (tries > CONFIG.maxTries) {
      warn('Max polling tries reached. Stopping auto loop.');
      updateHUD('Stopped (Manual intervention required)', true);
      return;
    }

    // Step 1: Session select
    selectSession();

    // Step 2: Tier select & lock
    const tierSelected = selectPriceTier();
    if (tierSelected) {
      submitOrder();
      return;
    }

    setTimeout(runLoop, CONFIG.pollIntervalMs);
  }

  // Auto-launch only on ticket selection routes
  if (window.location.hash.includes('selectTicket') || window.location.href.includes('selectTicket')) {
    log('Detected selectTicket route! Starting auto-lock sequence...');
    runLoop();
  } else {
    // Listen for hash route changes (SPA routing)
    window.addEventListener('hashchange', () => {
      if (window.location.hash.includes('selectTicket')) {
        log('Hash changed to selectTicket. Launching...');
        tries = 0;
        runLoop();
      }
    });
  }
})();
