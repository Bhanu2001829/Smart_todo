import { useState, useEffect } from 'react';
import axios from 'axios';

const API = 'http://localhost:5000';

const CATEGORIES = ['Wedding', 'Portrait', 'Event', 'Commercial', 'Nature', 'Product', 'General'];

const CATEGORY_CONFIG = {
    Wedding:    { color: '#D4A853', bg: 'rgba(212,168,83,0.08)',   icon: '◈' },
    Portrait:   { color: '#7EB8C9', bg: 'rgba(126,184,201,0.08)', icon: '◉' },
    Event:      { color: '#C97EB8', bg: 'rgba(201,126,184,0.08)', icon: '◆' },
    Commercial: { color: '#7EC97E', bg: 'rgba(126,201,126,0.08)', icon: '▣' },
    Nature:     { color: '#89C97E', bg: 'rgba(137,201,126,0.08)', icon: '◍' },
    Product:    { color: '#7E9EC9', bg: 'rgba(126,158,201,0.08)', icon: '◰' },
    General:    { color: '#A0A0A0', bg: 'rgba(160,160,160,0.08)', icon: '○' },
};

const DEFAULT_EQUIPMENT = [
    { name: 'Camera Body',    cost: 5000 },
    { name: 'Lens 50mm',      cost: 3000 },
    { name: 'Lens 85mm',      cost: 4000 },
    { name: 'Tripod',         cost: 1500 },
    { name: 'Flash',          cost: 2000 },
    { name: 'Memory Cards',   cost: 800  },
    { name: 'Battery Pack',   cost: 1200 },
    { name: 'Reflector',      cost: 600  },
    { name: 'Light Stand',    cost: 1800 },
    { name: 'Laptop',         cost: 3500 },
    { name: 'SD Card Reader', cost: 400  },
    { name: 'Filters',        cost: 900  },
];

function getDaysLeft(deadline) {
    if (!deadline) return null;
    return Math.ceil((new Date(deadline) - new Date()) / (1000 * 60 * 60 * 24));
}

const S = `
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=JetBrains+Mono:wght@300;400;500&family=Instrument+Sans:wght@400;500;600&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  --bg:    #0C0C0D;
  --bg2:   #111113;
  --bg3:   #18181B;
  --bg4:   #1E1E22;
  --line:  rgba(255,255,255,0.06);
  --line2: rgba(255,255,255,0.10);
  --line3: rgba(255,255,255,0.16);
  --t1: #F2F2F3;
  --t2: #9A9AA8;
  --t3: #5A5A68;
  --a:    #E8A830;
  --a-d:  #B8841E;
  --a-bg: rgba(232,168,48,0.08);
  --a-b:  rgba(232,168,48,0.20);
  --red:   #E05252;
  --green: #52C47A;
  --blue:  #5290E0;
  --r: 6px; --r2: 10px; --r3: 14px;
  --font-head: 'Syne', sans-serif;
  --font-body: 'Instrument Sans', sans-serif;
  --font-mono: 'JetBrains Mono', monospace;
}

html { scroll-behavior: smooth; }
body {
  background: var(--bg); color: var(--t1);
  font-family: var(--font-body); font-size: 14px; line-height: 1.5;
  min-height: 100vh; overflow-x: hidden; -webkit-font-smoothing: antialiased;
}

::-webkit-scrollbar { width: 3px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: var(--bg4); border-radius: 2px; }
::-webkit-scrollbar-thumb:hover { background: var(--a); }

body::after {
  content: ''; position: fixed; inset: 0; pointer-events: none; z-index: 9999;
  background-image:
    linear-gradient(rgba(255,255,255,0.012) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,0.012) 1px, transparent 1px);
  background-size: 32px 32px;
}

.app { display: flex; flex-direction: column; min-height: 100vh; }

/* TOPBAR */
.topbar {
  position: sticky; top: 0; z-index: 200; height: 52px;
  display: flex; align-items: center; justify-content: space-between; padding: 0 28px;
  background: rgba(12,12,13,0.92); border-bottom: 1px solid var(--line);
  backdrop-filter: blur(20px);
}
.brand { display: flex; align-items: center; gap: 10px; }
.brand-icon {
  width: 28px; height: 28px; background: var(--a); border-radius: 5px;
  display: flex; align-items: center; justify-content: center;
  font-size: 12px; color: #000; font-weight: 800; font-family: var(--font-head);
}
.brand-name { font-family: var(--font-head); font-size: 15px; font-weight: 700; color: var(--t1); }
.brand-ver {
  font-family: var(--font-mono); font-size: 9px; color: var(--t3);
  letter-spacing: 1px; text-transform: uppercase;
  border: 1px solid var(--line2); padding: 1px 5px; border-radius: 3px;
}
.topbar-stats { display: flex; align-items: center; gap: 4px; }
.ts {
  display: flex; align-items: center; gap: 5px; padding: 4px 10px;
  border-radius: var(--r); font-family: var(--font-mono); font-size: 11px; color: var(--t3);
  border: 1px solid transparent; transition: all 0.15s;
}
.ts:hover { border-color: var(--line); color: var(--t2); }
.ts .dot { width: 5px; height: 5px; border-radius: 50%; }
.ts.urgent { color: var(--red); }
.ts.urgent .dot { background: var(--red); box-shadow: 0 0 6px var(--red); }
.ts.done { color: var(--green); }
.ts.done .dot { background: var(--green); }
.ts.total { color: var(--a); }
.ts.total .dot { background: var(--a); }

/* NAV TABS */
.navtabs {
  display: flex; align-items: center; gap: 2px; padding: 0 28px;
  height: 40px; background: var(--bg2); border-bottom: 1px solid var(--line);
}
.navtab {
  height: 40px; padding: 0 16px; font-family: var(--font-body); font-size: 12px;
  font-weight: 500; color: var(--t3); background: none; border: none; cursor: pointer;
  position: relative; transition: color 0.15s; letter-spacing: 0.2px;
}
.navtab::after {
  content: ''; position: absolute; bottom: 0; left: 0; right: 0;
  height: 1px; background: var(--a); opacity: 0; transition: opacity 0.15s;
}
.navtab:hover { color: var(--t2); }
.navtab.active { color: var(--t1); font-weight: 600; }
.navtab.active::after { opacity: 1; }

/* WORKSPACE */
.workspace { display: grid; grid-template-columns: 300px 1fr; min-height: calc(100vh - 92px); }

/* SIDEBAR */
.sidebar {
  border-right: 1px solid var(--line); background: var(--bg2); overflow-y: auto;
  position: sticky; top: 92px; height: calc(100vh - 92px);
}
.sidebar-section { padding: 16px; border-bottom: 1px solid var(--line); }
.sidebar-label {
  font-family: var(--font-mono); font-size: 9px; color: var(--t3);
  text-transform: uppercase; letter-spacing: 2px; margin-bottom: 12px;
  display: flex; align-items: center; gap: 6px;
}
.sidebar-label::after { content: ''; flex: 1; height: 1px; background: var(--line); }

/* FIELDS */
.field { margin-bottom: 10px; }
.field-label {
  display: block; font-family: var(--font-mono); font-size: 9px; color: var(--t3);
  text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 5px;
}
input[type="text"], input[type="number"], input[type="date"], select {
  width: 100%; background: var(--bg3); border: 1px solid var(--line2);
  border-radius: var(--r); color: var(--t1); font-family: var(--font-body);
  font-size: 13px; padding: 7px 10px; outline: none;
  transition: border-color 0.15s, box-shadow 0.15s; appearance: none;
}
input:focus, select:focus { border-color: var(--a); box-shadow: 0 0 0 2px var(--a-bg); }
input::placeholder { color: var(--t3); font-size: 12px; }
select option { background: var(--bg3); }
.field-row { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }

.priority-toggle { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; }
.ptog {
  padding: 7px; border-radius: var(--r); border: 1px solid var(--line2); background: var(--bg3);
  color: var(--t2); font-family: var(--font-mono); font-size: 10px; font-weight: 500;
  cursor: pointer; text-align: center; transition: all 0.15s; letter-spacing: 0.5px;
}
.ptog:hover { border-color: var(--line3); color: var(--t1); }
.ptog.normal.active { background: rgba(82,196,122,0.12); border-color: rgba(82,196,122,0.4); color: var(--green); }
.ptog.urgent.active { background: rgba(224,82,82,0.12); border-color: rgba(224,82,82,0.4); color: var(--red); }

/* EQUIPMENT CHIPS */
.equip-grid { display: flex; flex-direction: column; gap: 4px; }
.equip-chip {
  display: flex; align-items: center; gap: 8px; padding: 6px 8px;
  border-radius: var(--r); border: 1px solid var(--line); background: var(--bg3);
  cursor: pointer; transition: all 0.12s;
}
.equip-chip:hover { border-color: var(--line2); }
.equip-chip.sel { background: var(--a-bg); border-color: var(--a-b); }
.equip-cb {
  width: 14px; height: 14px; border-radius: 3px; border: 1px solid var(--line3);
  background: var(--bg4); flex-shrink: 0; display: flex; align-items: center;
  justify-content: center; font-size: 8px; color: var(--a); transition: all 0.12s;
}
.equip-chip.sel .equip-cb { background: var(--a); border-color: var(--a); color: #000; }
.equip-nm { flex: 1; font-family: var(--font-body); font-size: 11px; color: var(--t2); }
.equip-chip.sel .equip-nm { color: var(--t1); }
.equip-lkr { font-family: var(--font-mono); font-size: 10px; color: var(--t3); }
.equip-chip.sel .equip-lkr { color: var(--a); }

.btn-add {
  width: 100%; padding: 9px; border-radius: var(--r2); border: none;
  background: var(--a); color: #000; font-family: var(--font-head); font-size: 13px;
  font-weight: 700; letter-spacing: 0.5px; cursor: pointer; transition: all 0.15s;
  display: flex; align-items: center; justify-content: center; gap: 6px;
}
.btn-add:hover { background: #F0B840; transform: translateY(-1px); box-shadow: 0 4px 16px rgba(232,168,48,0.25); }
.btn-add:active { transform: translateY(0); }

.equip-summary {
  font-family: var(--font-mono); font-size: 10px; color: var(--a);
  padding: 6px 8px; background: var(--a-bg); border-radius: var(--r);
  border: 1px solid var(--a-b); margin-bottom: 10px;
}

/* CONTENT */
.content { padding: 20px 24px; overflow-y: auto; }

/* TOOLBAR */
.toolbar { display: flex; align-items: center; gap: 8px; margin-bottom: 16px; flex-wrap: wrap; }
.search-wrap { flex: 1; min-width: 200px; position: relative; }
.search-icon {
  position: absolute; left: 10px; top: 50%; transform: translateY(-50%);
  color: var(--t3); font-size: 13px; pointer-events: none;
}
.search-input { padding-left: 30px !important; }
.btn-sm {
  padding: 7px 12px; border-radius: var(--r); border: 1px solid var(--line2);
  background: var(--bg3); color: var(--t2); font-family: var(--font-mono); font-size: 10px;
  font-weight: 500; cursor: pointer; transition: all 0.15s; white-space: nowrap;
  letter-spacing: 0.3px; display: flex; align-items: center; gap: 5px;
}
.btn-sm:hover { border-color: var(--line3); color: var(--t1); }
.btn-sm.active { background: var(--a-bg); border-color: var(--a-b); color: var(--a); }
.btn-sm.undo { border-color: rgba(224,82,82,0.3); color: var(--red); background: rgba(224,82,82,0.06); }
.btn-sm.undo:hover { background: rgba(224,82,82,0.12); }

/* CATEGORY FILTER */
.catrow { display: flex; gap: 6px; margin-bottom: 16px; flex-wrap: wrap; }
.catbtn {
  padding: 4px 11px; border-radius: 20px; border: 1px solid var(--line);
  background: transparent; color: var(--t3); font-family: var(--font-mono);
  font-size: 10px; cursor: pointer; transition: all 0.12s; letter-spacing: 0.3px;
}
.catbtn:hover { border-color: var(--line2); color: var(--t2); }
.catbtn.active { color: var(--t1); border-color: var(--line3); background: var(--bg3); }

/* FEATURE PILLS */
.fpills { display: flex; gap: 5px; flex-wrap: wrap; margin-bottom: 18px; }
.fpill {
  font-family: var(--font-mono); font-size: 9px; padding: 3px 8px;
  border-radius: 3px; border: 1px solid; letter-spacing: 0.5px; text-transform: uppercase;
}

/* SECTION HEADER */
.sec-head {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 12px; padding-bottom: 10px; border-bottom: 1px solid var(--line);
}
.sec-title { font-family: var(--font-head); font-size: 13px; font-weight: 700; color: var(--t2); letter-spacing: 1px; text-transform: uppercase; }
.sec-count { font-family: var(--font-mono); font-size: 10px; color: var(--t3); }

/* CARDS */
.cards { display: flex; flex-direction: column; gap: 6px; }
.scard {
  background: var(--bg2); border: 1px solid var(--line); border-radius: var(--r2);
  padding: 14px 16px; display: grid; grid-template-columns: 3px 1fr auto;
  gap: 14px; align-items: start; transition: border-color 0.15s, transform 0.15s;
  animation: slidein 0.25s ease forwards;
}
.scard:hover { border-color: var(--line2); transform: translateX(2px); }
.scard.urgent { border-color: rgba(224,82,82,0.2); }
.scard.done { opacity: 0.45; }

.card-stripe { width: 3px; border-radius: 2px; min-height: 40px; align-self: stretch; }
.stripe-urgent { background: var(--red); }
.stripe-normal { background: var(--line3); }

.card-main { min-width: 0; }
.card-row1 { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; margin-bottom: 6px; }
.card-title { font-family: var(--font-head); font-size: 15px; font-weight: 700; color: var(--t1); letter-spacing: 0.2px; }
.card-title.done { text-decoration: line-through; color: var(--t3); }

.catpill {
  font-family: var(--font-mono); font-size: 9px; padding: 2px 8px;
  border-radius: 3px; border: 1px solid; letter-spacing: 0.5px; text-transform: uppercase;
}
.badge {
  font-family: var(--font-mono); font-size: 9px; padding: 2px 7px;
  border-radius: 3px; letter-spacing: 0.5px; text-transform: uppercase; font-weight: 600;
}
.badge-urg   { background: rgba(224,82,82,0.12);  color: var(--red);   border: 1px solid rgba(224,82,82,0.25); }
.badge-done  { background: rgba(82,196,122,0.10); color: var(--green); border: 1px solid rgba(82,196,122,0.2); }
.badge-over  { background: rgba(224,82,82,0.10);  color: var(--red);   border: 1px solid rgba(224,82,82,0.2); }
.badge-budget{ background: rgba(232,168,48,0.10); color: var(--a);     border: 1px solid rgba(232,168,48,0.2); }

.card-desc { font-size: 12px; color: var(--t3); margin-bottom: 8px; font-style: italic; }
.card-meta { display: flex; gap: 16px; flex-wrap: wrap; font-family: var(--font-mono); font-size: 10px; color: var(--t3); }
.meta-i { display: flex; align-items: center; gap: 4px; }
.pbar-wrap { margin-top: 8px; }
.pbar-track { height: 2px; background: var(--bg4); border-radius: 1px; overflow: hidden; }
.pbar-fill { height: 100%; border-radius: 1px; transition: width 0.4s ease; }

.card-actions { display: flex; flex-direction: column; gap: 4px; flex-shrink: 0; }
.act-btn {
  padding: 6px 10px; border-radius: var(--r); border: 1px solid var(--line);
  background: var(--bg3); color: var(--t2); font-family: var(--font-mono); font-size: 10px;
  cursor: pointer; transition: all 0.12s; white-space: nowrap; text-align: center;
}
.act-btn:hover { border-color: var(--line2); color: var(--t1); }
.act-btn.manage:hover  { border-color: var(--a-b); color: var(--a); background: var(--a-bg); }
.act-btn.complete:hover{ border-color: rgba(82,196,122,0.3); color: var(--green); background: rgba(82,196,122,0.08); }
.act-btn.del:hover     { border-color: rgba(224,82,82,0.3);  color: var(--red);   background: rgba(224,82,82,0.08); }

/* EMPTY */
.empty { text-align: center; padding: 80px 20px; color: var(--t3); }
.empty-ico { font-size: 40px; margin-bottom: 12px; opacity: 0.3; }
.empty-txt { font-family: var(--font-mono); font-size: 11px; letter-spacing: 0.5px; }

/* BUDGET */
.budget-top { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 20px; }
.bstat { background: var(--bg2); border: 1px solid var(--line); border-radius: var(--r2); padding: 18px 20px; position: relative; overflow: hidden; }
.bstat::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 1px; }
.bstat.bb::before { background: var(--blue); }
.bstat.bg::before { background: var(--green); }
.bstat.ba::before { background: var(--a); }
.bstat-label { font-family: var(--font-mono); font-size: 9px; text-transform: uppercase; letter-spacing: 2px; color: var(--t3); margin-bottom: 8px; }
.bstat-val { font-family: var(--font-head); font-size: 26px; font-weight: 800; letter-spacing: -0.5px; }
.brow { background: var(--bg2); border: 1px solid var(--line); border-radius: var(--r2); padding: 14px 16px; margin-bottom: 6px; }
.brow-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px; }
.brow-name { font-family: var(--font-head); font-size: 14px; font-weight: 700; color: var(--t1); }
.brow-client { font-family: var(--font-mono); font-size: 10px; color: var(--t3); margin-top: 2px; }
.brow-amt { font-family: var(--font-mono); font-size: 12px; font-weight: 500; text-align: right; }

/* MODAL */
.overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,0.7);
  backdrop-filter: blur(6px); z-index: 500;
  display: flex; align-items: center; justify-content: center; padding: 20px;
}
.modal {
  background: var(--bg2); border: 1px solid var(--line2); border-radius: var(--r3);
  padding: 24px; width: 100%; max-width: 560px; max-height: 88vh; overflow-y: auto;
  box-shadow: 0 32px 64px rgba(0,0,0,0.6);
}
.modal-head { margin-bottom: 20px; padding-bottom: 16px; border-bottom: 1px solid var(--line); }
.modal-title { font-family: var(--font-head); font-size: 20px; font-weight: 800; color: var(--t1); letter-spacing: 0.5px; margin-bottom: 4px; }
.modal-sub { font-family: var(--font-mono); font-size: 11px; color: var(--t3); }
.modal-sec { margin-bottom: 20px; }
.modal-sec-title {
  font-family: var(--font-mono); font-size: 9px; text-transform: uppercase;
  letter-spacing: 2px; color: var(--t3); margin-bottom: 10px;
  padding-bottom: 6px; border-bottom: 1px solid var(--line);
}

/* EQUIPMENT MODAL ROWS */
.erow {
  display: grid; grid-template-columns: 20px 1fr auto auto; align-items: center;
  gap: 10px; padding: 8px 10px; border-radius: var(--r); border: 1px solid var(--line);
  background: var(--bg3); margin-bottom: 5px; cursor: pointer; transition: all 0.12s;
}
.erow:hover { border-color: var(--line2); }
.erow.checked { border-color: rgba(82,196,122,0.3); background: rgba(82,196,122,0.05); }
.eck {
  width: 16px; height: 16px; border-radius: 3px; border: 1px solid var(--line3);
  background: var(--bg4); display: flex; align-items: center; justify-content: center;
  font-size: 9px; color: var(--green); transition: all 0.12s;
}
.erow.checked .eck { background: rgba(82,196,122,0.2); border-color: rgba(82,196,122,0.4); }
.enm { font-family: var(--font-body); font-size: 12px; color: var(--t2); }
.erow.checked .enm { color: var(--t3); text-decoration: line-through; }
.elbl { font-family: var(--font-mono); font-size: 10px; color: var(--t3); }
.ecost-inp { width: 90px !important; padding: 4px 8px !important; font-size: 11px !important; text-align: right; }

/* BUDGET SUMMARY */
.bsumbox { background: var(--bg3); border: 1px solid var(--line); border-radius: var(--r2); padding: 14px; margin-bottom: 14px; }
.bsrow { display: flex; justify-content: space-between; align-items: center; padding: 5px 0; font-family: var(--font-mono); font-size: 11px; }
.bsrow.total { border-top: 1px solid var(--line); margin-top: 6px; padding-top: 10px; font-size: 13px; font-weight: 600; }
.bsl { color: var(--t3); }
.bsv-a { color: var(--a); }
.bsv-g { color: var(--green); }
.bsv-r { color: var(--red); }
.bsv { color: var(--t2); }

/* MODAL BUTTONS */
.modal-foot { display: flex; gap: 8px; }
.btn-save {
  flex: 2; padding: 10px; border-radius: var(--r2); border: none;
  background: var(--a); color: #000; font-family: var(--font-head); font-size: 13px;
  font-weight: 700; cursor: pointer; transition: all 0.15s; letter-spacing: 0.5px;
}
.btn-save:hover { background: #F0B840; transform: translateY(-1px); box-shadow: 0 4px 16px rgba(232,168,48,0.25); }
.btn-cancel {
  flex: 1; padding: 10px; border-radius: var(--r2); border: 1px solid var(--line2);
  background: var(--bg3); color: var(--t2); font-family: var(--font-mono); font-size: 11px;
  cursor: pointer; transition: all 0.15s;
}
.btn-cancel:hover { border-color: var(--line3); color: var(--t1); }

.add-custom-row { display: flex; gap: 6px; margin-top: 10px; }
.extra-row { display: flex; align-items: center; gap: 10px; }
.extra-lbl { font-family: var(--font-mono); font-size: 10px; color: var(--t3); white-space: nowrap; }

@keyframes slidein { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }

@media (max-width: 800px) {
  .workspace { grid-template-columns: 1fr; }
  .sidebar { position: static; height: auto; }
  .budget-top { grid-template-columns: 1fr; }
  .topbar-stats { display: none; }
  .topbar, .navtabs { padding: 0 16px; }
  .content { padding: 16px; }
}
`;

export default function App() {
    const [tasks, setTasks] = useState([]);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [priority, setPriority] = useState('normal');
    const [client, setClient] = useState('');
    const [category, setCategory] = useState('General');
    const [deadline, setDeadline] = useState('');
    const [budget, setBudget] = useState('');
    const [selectedEquip, setSelectedEquip] = useState([]);
    const [reversed, setReversed] = useState(false);
    const [search, setSearch] = useState('');
    const [searchResults, setSearchResults] = useState(null);
    const [undoAvailable, setUndoAvailable] = useState(false);
    const [filterCat, setFilterCat] = useState('All');
    const [activeTab, setActiveTab] = useState('shoots');
    const [activeModal, setActiveModal] = useState(null);
    const [modalTask, setModalTask] = useState(null);
    const [newEquipName, setNewEquipName] = useState('');
    const [newEquipCost, setNewEquipCost] = useState('');
    const [extraExpenses, setExtraExpenses] = useState(0);

    useEffect(() => { fetchTasks(); }, [reversed]);

    const fetchTasks = async () => {
        const res = await axios.get(reversed ? `${API}/tasks/reverse` : `${API}/tasks`);
        setTasks(res.data.tasks);
    };

    const addTask = async () => {
        if (!title.trim()) return alert('Shoot title is required');
        await axios.post(`${API}/tasks`, { title, description, priority, client, category, deadline, budget, equipment: selectedEquip });
        setTitle(''); setDescription(''); setPriority('normal'); setClient('');
        setCategory('General'); setDeadline(''); setBudget(''); setSelectedEquip([]);
        setUndoAvailable(false); setSearchResults(null);
        fetchTasks();
    };

    const deleteTask = async (id) => {
        await axios.delete(`${API}/tasks/${id}`);
        setUndoAvailable(true); setSearchResults(null); fetchTasks();
    };

    const undoDelete = async () => {
        await axios.post(`${API}/tasks/undo`);
        setUndoAvailable(false); fetchTasks();
    };

    const completeTask = async (id) => {
        await axios.patch(`${API}/tasks/${id}/complete`);
        fetchTasks();
    };

    const handleSearch = async (e) => {
        const v = e.target.value; setSearch(v);
        if (!v.trim()) { setSearchResults(null); return; }
        const res = await axios.get(`${API}/tasks/search?keyword=${v}`);
        setSearchResults(res.data);
    };

    const toggleEquip = (item) => {
        setSelectedEquip(prev => {
            const exists = prev.find(e => e.name === item.name);
            if (exists) return prev.filter(e => e.name !== item.name);
            return [...prev, { name: item.name, cost: item.cost, checked: false }];
        });
    };

    const openModal = (task) => {
        setModalTask({ ...task, equipment: task.equipment ? [...task.equipment] : [] });
        setExtraExpenses(task.extraExpenses || 0);
        setActiveModal(task.id);
    };
    const closeModal = () => { setActiveModal(null); setModalTask(null); };

    const toggleEquipCheck = (i) => {
        const updated = modalTask.equipment.map((e, idx) => idx === i ? { ...e, checked: !e.checked } : e);
        setModalTask({ ...modalTask, equipment: updated });
    };

    const updateEquipCost = (i, cost) => {
        const updated = modalTask.equipment.map((e, idx) => idx === i ? { ...e, cost: parseFloat(cost) || 0 } : e);
        setModalTask({ ...modalTask, equipment: updated });
    };

    const addCustomEquip = () => {
        if (!newEquipName.trim()) return;
        setModalTask({ ...modalTask, equipment: [...modalTask.equipment, { name: newEquipName.trim(), cost: parseFloat(newEquipCost) || 0, checked: false }] });
        setNewEquipName(''); setNewEquipCost('');
    };

    const gearCost = modalTask ? modalTask.equipment.filter(e => e.checked).reduce((s, e) => s + (e.cost || 0), 0) : 0;
    const totalSpentModal = gearCost + (parseFloat(extraExpenses) || 0);
    const remaining = modalTask ? (modalTask.budget || 0) - totalSpentModal : 0;

    const saveModal = async () => {
        try {
            const res = await axios.patch(`${API}/tasks/${modalTask.id}/equipment`, {
                equipment: modalTask.equipment,
                extraExpenses: parseFloat(extraExpenses) || 0
            });
            if (res.data.tasks) setTasks(res.data.tasks);
            closeModal();
            await fetchTasks();
        } catch (err) { alert('Save failed.'); }
    };

    let display = searchResults !== null ? searchResults : tasks;
    if (filterCat !== 'All') display = display.filter(t => t.category === filterCat);

    const totalBudget = tasks.reduce((s, t) => s + (t.budget || 0), 0);
    const totalSpent  = tasks.reduce((s, t) => s + (t.spent  || 0), 0);
    const urgentCount = tasks.filter(t => t.priority === 'urgent' && !t.completed).length;
    const doneCount   = tasks.filter(t => t.completed).length;

    const fp = [
        { bg: 'rgba(224,82,82,0.08)',   color: '#E05252', label: 'F1 URGENT INSERT' },
        { bg: 'rgba(232,168,48,0.08)',  color: '#E8A830', label: 'F2 UNDO DELETE' },
        { bg: 'rgba(82,144,224,0.08)',  color: '#5290E0', label: 'F3 REVERSE VIEW' },
        { bg: 'rgba(126,184,201,0.08)', color: '#7EB8C9', label: 'F4 CLIENT+CATEGORY' },
        { bg: 'rgba(82,196,122,0.08)',  color: '#52C47A', label: 'F5 DEADLINE' },
        { bg: 'rgba(201,126,184,0.08)', color: '#C97EB8', label: 'F6 EQUIPMENT+COST' },
        { bg: 'rgba(212,168,83,0.08)',  color: '#D4A853', label: 'F7 AUTO BUDGET' },
    ];

    return (
        <>
            <style>{S}</style>
            <div className="app">

                {/* TOPBAR */}
                <div className="topbar">
                    <div className="brand">
                        <div className="brand-icon">SF</div>
                        <span className="brand-name">ShootFlow</span>
                        <span className="brand-ver">PRO</span>
                    </div>
                    <div className="topbar-stats">
                        {urgentCount > 0 && <div className="ts urgent"><div className="dot" />{urgentCount} urgent</div>}
                        <div className="ts done"><div className="dot" />{doneCount} completed</div>
                        <div className="ts total"><div className="dot" />{tasks.length} shoots</div>
                    </div>
                </div>

                {/* NAV TABS */}
                <div className="navtabs">
                    <button className={`navtab ${activeTab === 'shoots' ? 'active' : ''}`} onClick={() => setActiveTab('shoots')}>Shoots</button>
                    <button className={`navtab ${activeTab === 'budget' ? 'active' : ''}`} onClick={() => setActiveTab('budget')}>Budget Overview</button>
                </div>

                {/* SHOOTS TAB */}
                {activeTab === 'shoots' && (
                    <div className="workspace">

                        {/* SIDEBAR */}
                        <div className="sidebar">
                            <div className="sidebar-section">
                                <div className="sidebar-label">New Shoot</div>
                                <div className="field">
                                    <label className="field-label">Title *</label>
                                    <input type="text" value={title} onChange={e => setTitle(e.target.value)}
                                           onKeyDown={e => e.key === 'Enter' && addTask()} placeholder="e.g. Sarah's Wedding" />
                                </div>
                                <div className="field">
                                    <label className="field-label">Client</label>
                                    <input type="text" value={client} onChange={e => setClient(e.target.value)} placeholder="e.g. Sarah & James" />
                                </div>
                                <div className="field">
                                    <label className="field-label">Notes / Location</label>
                                    <input type="text" value={description} onChange={e => setDescription(e.target.value)} placeholder="e.g. Galle Fort, 4pm" />
                                </div>
                                <div className="field field-row">
                                    <div>
                                        <label className="field-label">Category</label>
                                        <select value={category} onChange={e => setCategory(e.target.value)}>
                                            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="field-label">Deadline</label>
                                        <input type="date" value={deadline} onChange={e => setDeadline(e.target.value)} />
                                    </div>
                                </div>
                                <div className="field">
                                    <label className="field-label">Priority</label>
                                    <div className="priority-toggle">
                                        <button className={`ptog normal ${priority === 'normal' ? 'active' : ''}`} onClick={() => setPriority('normal')}>● NORMAL</button>
                                        <button className={`ptog urgent ${priority === 'urgent' ? 'active' : ''}`} onClick={() => setPriority('urgent')}>▲ URGENT</button>
                                    </div>
                                </div>
                                <div className="field">
                                    <label className="field-label">Budget (LKR)</label>
                                    <input type="number" value={budget} onChange={e => setBudget(e.target.value)} placeholder="e.g. 50000" />
                                </div>
                            </div>

                            <div className="sidebar-section">
                                <div className="sidebar-label">Equipment</div>
                                {selectedEquip.length > 0 && (
                                    <div className="equip-summary">
                                        ✓ {selectedEquip.length} items · LKR {selectedEquip.reduce((s, e) => s + e.cost, 0).toLocaleString()}
                                    </div>
                                )}
                                <div className="equip-grid">
                                    {DEFAULT_EQUIPMENT.map(item => {
                                        const sel = selectedEquip.some(e => e.name === item.name);
                                        return (
                                            <div key={item.name} className={`equip-chip ${sel ? 'sel' : ''}`} onClick={() => toggleEquip(item)}>
                                                <div className="equip-cb">{sel ? '✓' : ''}</div>
                                                <span className="equip-nm">{item.name}</span>
                                                <span className="equip-lkr">{item.cost.toLocaleString()}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="sidebar-section">
                                <button className="btn-add" onClick={addTask}>+ Add Shoot</button>
                            </div>
                        </div>

                        {/* CONTENT */}
                        <div className="content">
                            <div className="toolbar">
                                <div className="search-wrap">
                                    <span className="search-icon">⌕</span>
                                    <input type="text" className="search-input" value={search}
                                           onChange={handleSearch} placeholder="Search shoots, clients, categories..." />
                                </div>
                                <button className={`btn-sm ${reversed ? 'active' : ''}`}
                                        onClick={() => { setReversed(!reversed); setSearchResults(null); setSearch(''); }}>
                                    {reversed ? '↑↓ Newest' : '↓↑ Oldest'}
                                </button>
                                {undoAvailable && <button className="btn-sm undo" onClick={undoDelete}>↩ Undo</button>}
                            </div>

                            <div className="catrow">
                                {['All', ...CATEGORIES].map(c => {
                                    const cfg = CATEGORY_CONFIG[c];
                                    return (
                                        <button key={c}
                                                className={`catbtn ${filterCat === c ? 'active' : ''}`}
                                                style={filterCat === c && cfg ? { borderColor: cfg.color + '60', color: cfg.color, background: cfg.bg } : {}}
                                                onClick={() => setFilterCat(c)}>
                                            {cfg ? cfg.icon + ' ' : ''}{c}
                                        </button>
                                    );
                                })}
                            </div>

                            <div className="fpills">
                                {fp.map(f => (
                                    <span key={f.label} className="fpill" style={{ background: f.bg, color: f.color, borderColor: f.color + '40' }}>
                    {f.label}
                  </span>
                                ))}
                            </div>

                            <div className="sec-head">
                                <div className="sec-title">Shoot Queue</div>
                                <div className="sec-count">
                                    {display.length} shoot{display.length !== 1 ? 's' : ''}
                                    {reversed && ' · reverse order'}
                                    {searchResults !== null && ` · results for "${search}"`}
                                </div>
                            </div>

                            {display.length === 0 ? (
                                <div className="empty">
                                    <div className="empty-ico">◎</div>
                                    <div className="empty-txt">No shoots found — add one from the sidebar</div>
                                </div>
                            ) : (
                                <div className="cards">
                                    {display.map((task, idx) => {
                                        const days   = getDaysLeft(task.deadline);
                                        const overdue = days !== null && days < 0 && !task.completed;
                                        const soon   = days !== null && days >= 0 && days <= 3 && !task.completed;
                                        const eTotal = (task.equipment || []).length;
                                        const eDone  = (task.equipment || []).filter(e => e.checked).length;
                                        const bOver  = task.budget > 0 && task.spent > task.budget;
                                        const cfg    = CATEGORY_CONFIG[task.category] || CATEGORY_CONFIG.General;
                                        const pct    = task.budget > 0 ? Math.min(((task.spent || 0) / task.budget) * 100, 100) : 0;

                                        return (
                                            <div key={task.id} className={`scard ${task.priority === 'urgent' ? 'urgent' : ''} ${task.completed ? 'done' : ''}`}>
                                                <div className={`card-stripe ${task.priority === 'urgent' ? 'stripe-urgent' : 'stripe-normal'}`} />
                                                <div className="card-main">
                                                    <div className="card-row1">
                                                        <span className={`card-title ${task.completed ? 'done' : ''}`}>{task.title}</span>
                                                        <span className="catpill" style={{ color: cfg.color, borderColor: cfg.color + '40', background: cfg.bg }}>
                              {cfg.icon} {task.category}
                            </span>
                                                        {task.priority === 'urgent' && !task.completed && <span className="badge badge-urg">URGENT</span>}
                                                        {task.completed && <span className="badge badge-done">DONE</span>}
                                                        {overdue && <span className="badge badge-over">OVERDUE</span>}
                                                        {bOver && <span className="badge badge-budget">OVER BUDGET</span>}
                                                    </div>
                                                    {task.description && <div className="card-desc">{task.description}</div>}
                                                    <div className="card-meta">
                                                        <span className="meta-i" style={{ color: '#7EB8C9' }}>NODE #{idx + 1}</span>
                                                        {task.client !== 'No Client' && <span className="meta-i" style={{ color: '#7EB8C9' }}>◉ {task.client}</span>}
                                                        {task.deadline && (
                                                            <span className="meta-i" style={{ color: overdue ? 'var(--red)' : soon ? 'var(--a)' : 'var(--green)' }}>
                                ◷ {overdue ? `${Math.abs(days)}d overdue` : days === 0 ? 'Due today' : `${days}d left`}
                              </span>
                                                        )}
                                                        {eTotal > 0 && <span className="meta-i" style={{ color: '#C97EB8' }}>◈ {eDone}/{eTotal} packed</span>}
                                                        {task.budget > 0 && (
                                                            <span className="meta-i" style={{ color: bOver ? 'var(--red)' : 'var(--a)' }}>
                                ◎ LKR {(task.spent || 0).toLocaleString()} / {task.budget.toLocaleString()}
                              </span>
                                                        )}
                                                    </div>
                                                    {task.budget > 0 && (
                                                        <div className="pbar-wrap">
                                                            <div className="pbar-track">
                                                                <div className="pbar-fill" style={{ width: `${pct}%`, background: bOver ? 'var(--red)' : 'linear-gradient(90deg,var(--a-d),var(--a))' }} />
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="card-actions">
                                                    <button className="act-btn manage" onClick={() => openModal(task)}>Manage</button>
                                                    <button className="act-btn complete" onClick={() => completeTask(task.id)}>{task.completed ? 'Reopen' : 'Done'}</button>
                                                    <button className="act-btn del" onClick={() => deleteTask(task.id)}>Delete</button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* BUDGET TAB */}
                {activeTab === 'budget' && (
                    <div className="content" style={{ maxWidth: 900, margin: '0 auto', width: '100%' }}>
                        <div className="budget-top">
                            <div className="bstat bb">
                                <div className="bstat-label">Total Budget</div>
                                <div className="bstat-val" style={{ color: 'var(--blue)' }}>LKR {totalBudget.toLocaleString()}</div>
                            </div>
                            <div className="bstat bg">
                                <div className="bstat-label">Total Spent</div>
                                <div className="bstat-val" style={{ color: totalSpent > totalBudget ? 'var(--red)' : 'var(--green)' }}>LKR {totalSpent.toLocaleString()}</div>
                            </div>
                            <div className="bstat ba">
                                <div className="bstat-label">Remaining</div>
                                <div className="bstat-val" style={{ color: 'var(--a)' }}>LKR {(totalBudget - totalSpent).toLocaleString()}</div>
                            </div>
                        </div>

                        <div className="sec-head">
                            <div className="sec-title">Per Shoot Breakdown</div>
                            <div className="sec-count">{tasks.filter(t => t.budget > 0).length} shoots with budget</div>
                        </div>

                        {tasks.filter(t => t.budget > 0).map(task => {
                            const pct  = Math.min(((task.spent || 0) / task.budget) * 100, 100);
                            const over = (task.spent || 0) > task.budget;
                            const ec   = (task.equipment || []).filter(e => e.checked);
                            return (
                                <div className="brow" key={task.id}>
                                    <div className="brow-top">
                                        <div>
                                            <div className="brow-name">{task.title}</div>
                                            <div className="brow-client">
                                                {task.client !== 'No Client' && `◉ ${task.client}`}
                                                {ec.length > 0 && `  ·  ◈ ${ec.length} gear used`}
                                                {task.extraExpenses > 0 && `  ·  + LKR ${task.extraExpenses} extras`}
                                            </div>
                                        </div>
                                        <div className="brow-amt" style={{ color: over ? 'var(--red)' : 'var(--green)' }}>
                                            LKR {(task.spent || 0).toLocaleString()}
                                            <span style={{ color: 'var(--t3)', fontWeight: 400 }}> / {task.budget.toLocaleString()}</span>
                                            {over && ' ▲'}
                                        </div>
                                    </div>
                                    <div className="pbar-track" style={{ height: 4 }}>
                                        <div className="pbar-fill" style={{ width: `${pct}%`, background: over ? 'var(--red)' : 'linear-gradient(90deg,var(--a-d),var(--a))' }} />
                                    </div>
                                </div>
                            );
                        })}

                        {tasks.filter(t => t.budget > 0).length === 0 && (
                            <div className="empty"><div className="empty-ico">◎</div><div className="empty-txt">No shoots with budget set yet</div></div>
                        )}
                    </div>
                )}

                {/* MANAGE MODAL */}
                {activeModal && modalTask && (
                    <div className="overlay" onClick={e => e.target === e.currentTarget && closeModal()}>
                        <div className="modal">
                            <div className="modal-head">
                                <div className="modal-title">Manage Shoot</div>
                                <div className="modal-sub">{modalTask.title}{modalTask.client !== 'No Client' && ` · ${modalTask.client}`}</div>
                            </div>

                            <div className="modal-sec">
                                <div className="modal-sec-title">Equipment Checklist — check items used</div>
                                {(modalTask.equipment || []).length === 0 && (
                                    <div style={{ color: 'var(--t3)', fontSize: 12, marginBottom: 10 }}>No equipment added.</div>
                                )}
                                {(modalTask.equipment || []).map((item, i) => (
                                    <div key={i} className={`erow ${item.checked ? 'checked' : ''}`}>
                                        <div className="eck" onClick={() => toggleEquipCheck(i)}>{item.checked ? '✓' : ''}</div>
                                        <span className="enm" onClick={() => toggleEquipCheck(i)}>{item.name}</span>
                                        <span className="elbl">LKR</span>
                                        <input className="ecost-inp" type="number" value={item.cost}
                                               onChange={e => updateEquipCost(i, e.target.value)}
                                               onClick={e => e.stopPropagation()} />
                                    </div>
                                ))}
                                <div className="add-custom-row">
                                    <input type="text" value={newEquipName} onChange={e => setNewEquipName(e.target.value)}
                                           placeholder="Custom item..." onKeyDown={e => e.key === 'Enter' && addCustomEquip()} style={{ flex: 2 }} />
                                    <input type="number" value={newEquipCost} onChange={e => setNewEquipCost(e.target.value)}
                                           placeholder="Cost" style={{ flex: 1 }} />
                                    <button className="btn-cancel" style={{ flex: 'none', padding: '7px 12px' }} onClick={addCustomEquip}>Add</button>
                                </div>
                            </div>

                            <div className="modal-sec">
                                <div className="modal-sec-title">Extra Expenses</div>
                                <div className="extra-row">
                                    <span className="extra-lbl">Travel / Food / Venue / Other (LKR)</span>
                                    <input type="number" value={extraExpenses} onChange={e => setExtraExpenses(e.target.value)} placeholder="0" style={{ width: 120 }} />
                                </div>
                            </div>

                            <div className="modal-sec">
                                <div className="modal-sec-title">Auto-Calculated Budget Summary</div>
                                <div className="bsumbox">
                                    <div className="bsrow"><span className="bsl">Gear Cost (checked items)</span><span className="bsv-a">LKR {gearCost.toLocaleString()}</span></div>
                                    <div className="bsrow"><span className="bsl">Extra Expenses</span><span className="bsv-a">LKR {(parseFloat(extraExpenses) || 0).toLocaleString()}</span></div>
                                    <div className="bsrow total">
                                        <span className="bsl">Total Spent</span>
                                        <span className={totalSpentModal > (modalTask.budget || 0) ? 'bsv-r' : 'bsv-g'}>LKR {totalSpentModal.toLocaleString()}</span>
                                    </div>
                                    <div className="bsrow" style={{ marginTop: 6 }}><span className="bsl">Budget Allocated</span><span className="bsv">LKR {(modalTask.budget || 0).toLocaleString()}</span></div>
                                    <div className="bsrow">
                                        <span className="bsl">Remaining</span>
                                        <span className={remaining < 0 ? 'bsv-r' : 'bsv-g'}>LKR {remaining.toLocaleString()}{remaining < 0 ? ' ▲ OVER' : ' ✓'}</span>
                                    </div>
                                    {modalTask.budget > 0 && (
                                        <div className="pbar-track" style={{ height: 4, marginTop: 12 }}>
                                            <div className="pbar-fill" style={{ width: `${Math.min((totalSpentModal / modalTask.budget) * 100, 100)}%`, background: remaining < 0 ? 'var(--red)' : 'linear-gradient(90deg,var(--a-d),var(--a))' }} />
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="modal-foot">
                                <button className="btn-save" onClick={saveModal}>Save & Calculate</button>
                                <button className="btn-cancel" onClick={closeModal}>Cancel</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}