import { useState, useEffect } from 'react';
import axios from 'axios';

const API = 'http://localhost:5000';

const CATEGORIES = ['Wedding', 'Portrait', 'Event', 'Commercial', 'Nature', 'Product', 'General'];

const CATEGORY_CONFIG = {
    Wedding:    { color: '#f472b6', bg: 'rgba(244,114,182,0.12)', icon: '💍' },
    Portrait:   { color: '#a78bfa', bg: 'rgba(167,139,250,0.12)', icon: '🎭' },
    Event:      { color: '#60a5fa', bg: 'rgba(96,165,250,0.12)',  icon: '🎪' },
    Commercial: { color: '#fbbf24', bg: 'rgba(251,191,36,0.12)',  icon: '📦' },
    Nature:     { color: '#34d399', bg: 'rgba(52,211,153,0.12)',  icon: '🌿' },
    Product:    { color: '#22d3ee', bg: 'rgba(34,211,238,0.12)',  icon: '✨' },
    General:    { color: '#9ca3af', bg: 'rgba(156,163,175,0.12)', icon: '📋' },
};

// Default equipment with preset prices (LKR)
const DEFAULT_EQUIPMENT = [
    { name: 'Camera Body',    cost: 5000  },
    { name: 'Lens 50mm',      cost: 3000  },
    { name: 'Lens 85mm',      cost: 4000  },
    { name: 'Tripod',         cost: 1500  },
    { name: 'Flash',          cost: 2000  },
    { name: 'Memory Cards',   cost: 800   },
    { name: 'Battery Pack',   cost: 1200  },
    { name: 'Reflector',      cost: 600   },
    { name: 'Light Stand',    cost: 1800  },
    { name: 'Laptop',         cost: 3500  },
    { name: 'SD Card Reader', cost: 400   },
    { name: 'Filters',        cost: 900   },
];

function getDaysLeft(deadline) {
    if (!deadline) return null;
    return Math.ceil((new Date(deadline) - new Date()) / (1000 * 60 * 60 * 24));
}

// ─── styles ────────────────────────────────────────────────────────────────
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg: #080810; --surface: #0f0f1c; --surface2: #16162a;
    --border: rgba(255,255,255,0.06); --border2: rgba(255,255,255,0.1);
    --text: #e8e8f0; --muted: #6b6b8a;
    --accent: #e85d9a; --accent2: #7c6af5;
    --gold: #f5c842; --green: #3ddc84; --red: #ff4d6d;
    --font-display: 'Bebas Neue', sans-serif;
    --font-body: 'DM Sans', sans-serif;
    --font-mono: 'DM Mono', monospace;
  }
  body { background: var(--bg); color: var(--text); font-family: var(--font-body); min-height: 100vh; overflow-x: hidden; }
  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-thumb { background: var(--accent2); border-radius: 2px; }
  body::before {
    content: ''; position: fixed; inset: 0; pointer-events: none; z-index: 9999; opacity: 0.4;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.03'/%3E%3C/svg%3E");
  }
  .orb { position: fixed; border-radius: 50%; filter: blur(120px); pointer-events: none; z-index: 0; opacity: 0.15; }
  .orb-1 { width: 600px; height: 600px; background: var(--accent); top: -200px; right: -100px; }
  .orb-2 { width: 500px; height: 500px; background: var(--accent2); bottom: -200px; left: -100px; }
  .app { position: relative; z-index: 1; }

  .navbar {
    position: sticky; top: 0; z-index: 100;
    backdrop-filter: blur(20px); background: rgba(8,8,16,0.85);
    border-bottom: 1px solid var(--border);
    padding: 0 40px; display: flex; align-items: center; justify-content: space-between; height: 64px;
  }
  .logo { display: flex; align-items: baseline; gap: 8px; }
  .logo-text {
    font-family: var(--font-display); font-size: 28px; letter-spacing: 2px;
    background: linear-gradient(135deg, var(--accent), var(--accent2));
    -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
  }
  .logo-sub { font-size: 11px; color: var(--muted); font-family: var(--font-mono); letter-spacing: 1px; }
  .nav-stats { display: flex; gap: 16px; align-items: center; }
  .stat-pill { display: flex; align-items: center; gap: 6px; font-size: 12px; font-family: var(--font-mono); color: var(--muted); padding: 4px 12px; border-radius: 20px; border: 1px solid var(--border); background: var(--surface); }
  .stat-pill.urgent { color: var(--red); border-color: rgba(255,77,109,0.3); }
  .stat-pill.done   { color: var(--green); border-color: rgba(61,220,132,0.3); }
  .stat-pill.over   { color: var(--gold); border-color: rgba(245,200,66,0.3); }

  .tabs { display: flex; padding: 0 40px; border-bottom: 1px solid var(--border); background: rgba(8,8,16,0.6); backdrop-filter: blur(10px); }
  .tab-btn { background: none; border: none; color: var(--muted); font-family: var(--font-body); font-size: 13px; font-weight: 500; padding: 14px 20px; cursor: pointer; border-bottom: 2px solid transparent; transition: all 0.2s; }
  .tab-btn:hover { color: var(--text); }
  .tab-btn.active { color: var(--accent); border-bottom-color: var(--accent); }

  .main { max-width: 1000px; margin: 0 auto; padding: 32px 24px; }
  .card { background: var(--surface); border: 1px solid var(--border); border-radius: 16px; padding: 24px; margin-bottom: 20px; }
  .form-title { font-family: var(--font-display); font-size: 22px; letter-spacing: 2px; margin-bottom: 20px; display: flex; align-items: center; gap: 10px; }
  .form-title span { color: var(--accent); }
  .form-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px; }
  .form-grid-4 { display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 12px; margin-bottom: 16px; }
  .field-wrap { display: flex; flex-direction: column; }
  .field-label { display: block; font-size: 10px; font-family: var(--font-mono); color: var(--muted); text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 6px; }
  input, select { background: var(--surface2); border: 1px solid var(--border); border-radius: 10px; color: var(--text); font-family: var(--font-body); font-size: 14px; padding: 10px 14px; outline: none; transition: all 0.2s; width: 100%; }
  input:focus, select:focus { border-color: var(--accent2); box-shadow: 0 0 0 3px rgba(124,106,245,0.1); }
  input::placeholder { color: var(--muted); }
  select option { background: var(--surface2); }

  /* Equipment selector in form */
  .equip-selector-label { font-size: 10px; font-family: var(--font-mono); color: var(--muted); text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 10px; }
  .equip-selector-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-bottom: 20px; }
  .equip-selector-item {
    display: flex; align-items: center; justify-content: space-between;
    padding: 8px 12px; border-radius: 10px; border: 1px solid var(--border);
    background: var(--surface2); cursor: pointer; transition: all 0.15s; gap: 8px;
  }
  .equip-selector-item:hover { border-color: var(--border2); }
  .equip-selector-item.selected { background: rgba(124,106,245,0.1); border-color: var(--accent2); }
  .equip-selector-name { font-size: 12px; font-family: var(--font-mono); color: var(--muted); flex: 1; }
  .equip-selector-item.selected .equip-selector-name { color: var(--accent2); }
  .equip-selector-cost { font-size: 11px; font-family: var(--font-mono); color: var(--gold); white-space: nowrap; }
  .equip-selector-check { font-size: 14px; width: 16px; }

  .btn { display: inline-flex; align-items: center; justify-content: center; gap: 6px; border: none; border-radius: 10px; cursor: pointer; font-family: var(--font-body); font-weight: 600; font-size: 13px; padding: 10px 20px; transition: all 0.2s; }
  .btn-primary { background: linear-gradient(135deg, var(--accent), var(--accent2)); color: white; box-shadow: 0 4px 20px rgba(232,93,154,0.3); }
  .btn-primary:hover { transform: translateY(-1px); box-shadow: 0 6px 24px rgba(232,93,154,0.4); }
  .btn-ghost { background: var(--surface2); color: var(--text); border: 1px solid var(--border); }
  .btn-ghost:hover { border-color: var(--border2); }
  .btn-purple { background: rgba(124,106,245,0.15); color: var(--accent2); border: 1px solid rgba(124,106,245,0.3); }
  .btn-purple.active { background: var(--accent2); color: white; }
  .btn-orange { background: rgba(251,146,60,0.15); color: #fb923c; border: 1px solid rgba(251,146,60,0.3); }
  .btn-danger { background: rgba(255,77,109,0.1); color: var(--red); border: 1px solid rgba(255,77,109,0.2); padding: 7px 12px; border-radius: 8px; }
  .btn-success { background: rgba(61,220,132,0.1); color: var(--green); border: 1px solid rgba(61,220,132,0.2); padding: 7px 12px; border-radius: 8px; }
  .btn-manage { background: rgba(255,255,255,0.04); color: var(--muted); border: 1px solid var(--border); padding: 7px 14px; border-radius: 8px; font-size: 12px; }
  .btn-manage:hover { color: var(--text); border-color: var(--border2); }

  .controls { display: flex; gap: 10px; margin-bottom: 16px; flex-wrap: wrap; align-items: center; }
  .cat-filter { display: flex; gap: 8px; margin-bottom: 20px; flex-wrap: wrap; }
  .cat-pill { padding: 5px 14px; border-radius: 20px; border: 1px solid var(--border); background: var(--surface2); color: var(--muted); font-size: 11px; font-family: var(--font-mono); cursor: pointer; transition: all 0.15s; }
  .cat-pill.active { color: white; border-color: transparent; }
  .feature-badges { display: flex; gap: 8px; margin-bottom: 24px; flex-wrap: wrap; }
  .feature-badge { font-size: 10px; font-family: var(--font-mono); padding: 4px 10px; border-radius: 6px; letter-spacing: 0.5px; border: 1px solid; }
  .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
  .section-title { font-family: var(--font-display); font-size: 20px; letter-spacing: 2px; }
  .section-meta { font-size: 12px; color: var(--muted); font-family: var(--font-mono); }

  .shoot-card { background: var(--surface); border: 1px solid var(--border); border-radius: 14px; padding: 18px 20px; margin-bottom: 10px; display: flex; gap: 16px; align-items: flex-start; transition: all 0.2s; position: relative; overflow: hidden; animation: fadeIn 0.3s ease forwards; }
  .shoot-card::before { content: ''; position: absolute; left: 0; top: 0; bottom: 0; width: 3px; border-radius: 3px 0 0 3px; }
  .shoot-card:hover { border-color: var(--border2); transform: translateX(2px); }
  .shoot-card.urgent { border-color: rgba(255,77,109,0.25); background: rgba(255,77,109,0.03); }
  .shoot-card.urgent::before { background: var(--red); }
  .shoot-card.normal::before { background: var(--border); }
  .shoot-card.completed { opacity: 0.45; }
  .card-body { flex: 1; min-width: 0; }
  .card-top { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; margin-bottom: 8px; }
  .card-title { font-weight: 600; font-size: 15px; }
  .card-title.done { text-decoration: line-through; color: var(--muted); }
  .badge { font-size: 10px; font-family: var(--font-mono); padding: 2px 8px; border-radius: 4px; letter-spacing: 0.5px; font-weight: 500; }
  .badge-urgent { background: rgba(255,77,109,0.15); color: var(--red); border: 1px solid rgba(255,77,109,0.3); }
  .badge-done   { background: rgba(61,220,132,0.12); color: var(--green); border: 1px solid rgba(61,220,132,0.25); }
  .badge-over   { background: rgba(255,77,109,0.12); color: var(--red); border: 1px solid rgba(255,77,109,0.25); }
  .badge-budget { background: rgba(245,200,66,0.12); color: var(--gold); border: 1px solid rgba(245,200,66,0.25); }
  .cat-badge { font-size: 10px; font-family: var(--font-mono); padding: 3px 10px; border-radius: 20px; }
  .card-meta { display: flex; gap: 18px; flex-wrap: wrap; margin-top: 8px; font-size: 12px; color: var(--muted); font-family: var(--font-mono); }
  .meta-item { display: flex; align-items: center; gap: 5px; }
  .card-actions { display: flex; gap: 6px; flex-shrink: 0; align-items: center; margin-top: 2px; }
  .progress-bar { height: 4px; background: var(--surface2); border-radius: 2px; overflow: hidden; margin-top: 8px; }
  .progress-fill { height: 100%; border-radius: 2px; transition: width 0.4s; }

  .empty { text-align: center; padding: 80px 20px; color: var(--muted); }
  .empty-icon { font-size: 56px; margin-bottom: 16px; opacity: 0.4; }
  .empty-text { font-size: 15px; font-family: var(--font-mono); }

  /* Budget tab */
  .budget-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; margin-bottom: 24px; }
  .budget-stat { background: var(--surface); border: 1px solid var(--border); border-radius: 14px; padding: 22px; text-align: center; position: relative; overflow: hidden; }
  .budget-stat::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px; }
  .budget-stat.blue::before { background: linear-gradient(90deg, var(--accent2), var(--accent)); }
  .budget-stat.green::before { background: var(--green); }
  .budget-stat.gold::before { background: var(--gold); }
  .budget-label { font-size: 10px; font-family: var(--font-mono); color: var(--muted); text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 10px; }
  .budget-value { font-family: var(--font-display); font-size: 30px; letter-spacing: 1px; }
  .budget-row { background: var(--surface); border: 1px solid var(--border); border-radius: 12px; padding: 16px 20px; margin-bottom: 10px; }
  .budget-row-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
  .budget-shoot-name { font-weight: 600; font-size: 14px; }
  .budget-shoot-client { font-size: 12px; color: var(--muted); font-family: var(--font-mono); }
  .budget-amounts { font-size: 13px; font-family: var(--font-mono); }

  /* Modal */
  .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.75); backdrop-filter: blur(8px); display: flex; align-items: center; justify-content: center; z-index: 500; padding: 20px; }
  .modal { background: var(--surface); border: 1px solid var(--border2); border-radius: 20px; padding: 28px; width: 100%; max-width: 580px; max-height: 88vh; overflow-y: auto; box-shadow: 0 40px 80px rgba(0,0,0,0.5); }
  .modal-title { font-family: var(--font-display); font-size: 22px; letter-spacing: 2px; margin-bottom: 4px; background: linear-gradient(135deg, var(--accent), var(--accent2)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
  .modal-sub { font-size: 12px; color: var(--muted); font-family: var(--font-mono); margin-bottom: 24px; }
  .modal-section { margin-bottom: 24px; }
  .modal-section-title { font-family: var(--font-mono); font-size: 10px; text-transform: uppercase; letter-spacing: 2px; color: var(--muted); margin-bottom: 12px; padding-bottom: 6px; border-bottom: 1px solid var(--border); }

  /* Equipment rows inside modal */
  .equip-row {
    display: grid; grid-template-columns: auto 1fr auto auto;
    align-items: center; gap: 12px;
    padding: 10px 14px; background: var(--surface2);
    border: 1px solid var(--border); border-radius: 10px; margin-bottom: 6px;
    cursor: pointer; transition: all 0.15s;
  }
  .equip-row:hover { border-color: var(--border2); }
  .equip-row.checked { border-color: rgba(61,220,132,0.3); background: rgba(61,220,132,0.05); }
  .equip-check { font-size: 16px; }
  .equip-name { font-size: 13px; font-family: var(--font-mono); }
  .equip-name.done { text-decoration: line-through; color: var(--muted); }
  .equip-cost-input { width: 110px; padding: 5px 10px; font-size: 12px; text-align: right; border-radius: 6px; }
  .equip-cost-label { font-size: 10px; color: var(--muted); font-family: var(--font-mono); white-space: nowrap; }

  /* Budget summary inside modal */
  .budget-summary-box { background: var(--surface2); border: 1px solid var(--border); border-radius: 12px; padding: 16px; margin-bottom: 16px; }
  .budget-summary-row { display: flex; justify-content: space-between; align-items: center; padding: 6px 0; font-size: 13px; font-family: var(--font-mono); }
  .budget-summary-row.total { border-top: 1px solid var(--border); margin-top: 6px; padding-top: 10px; font-size: 15px; font-weight: bold; }
  .budget-summary-row.remaining { font-size: 13px; }
  .budget-label-text { color: var(--muted); }
  .budget-value-text { color: var(--text); }
  .budget-value-green { color: var(--green); }
  .budget-value-red { color: var(--red); }
  .budget-value-gold { color: var(--gold); }
  .budget-value-accent { color: var(--accent2); }

  /* Extra expenses input */
  .extra-expense-row { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; }
  .extra-label { font-size: 12px; font-family: var(--font-mono); color: var(--muted); white-space: nowrap; }
  .extra-input { flex: 1; }

  .modal-actions { display: flex; gap: 10px; }
  @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
  @media (max-width: 700px) {
    .form-grid-2, .form-grid-4 { grid-template-columns: 1fr; }
    .equip-selector-grid { grid-template-columns: repeat(2, 1fr); }
    .budget-grid { grid-template-columns: 1fr; }
    .nav-stats { display: none; }
    .navbar, .tabs { padding: 0 16px; }
    .main { padding: 16px; }
  }
`;

export default function App() {
    const [tasks, setTasks]                   = useState([]);
    const [title, setTitle]                   = useState('');
    const [description, setDescription]       = useState('');
    const [priority, setPriority]             = useState('normal');
    const [client, setClient]                 = useState('');
    const [category, setCategory]             = useState('General');
    const [deadline, setDeadline]             = useState('');
    const [budget, setBudget]                 = useState('');
    // selectedEquipment = [{ name, cost, checked: false }]
    const [selectedEquipment, setSelectedEquipment] = useState([]);
    const [reversed, setReversed]             = useState(false);
    const [search, setSearch]                 = useState('');
    const [searchResults, setSearchResults]   = useState(null);
    const [undoAvailable, setUndoAvailable]   = useState(false);
    const [filterCategory, setFilterCategory] = useState('All');
    const [activeModal, setActiveModal]       = useState(null);
    const [modalTask, setModalTask]           = useState(null);
    const [newEquipName, setNewEquipName]     = useState('');
    const [newEquipCost, setNewEquipCost]     = useState('');
    const [extraExpenses, setExtraExpenses]   = useState(0);
    const [activeTab, setActiveTab]           = useState('shoots');

    useEffect(() => { fetchTasks(); }, [reversed]);

    const fetchTasks = async () => {
        const url = reversed ? `${API}/tasks/reverse` : `${API}/tasks`;
        const res = await axios.get(url);
        setTasks(res.data.tasks);
    };

    const addTask = async () => {
        if (!title.trim()) return alert('Please enter a shoot title!');
        await axios.post(`${API}/tasks`, {
            title, description, priority, client, category,
            deadline, budget,
            equipment: selectedEquipment   // [{ name, cost, checked }]
        });
        setTitle(''); setDescription(''); setPriority('normal');
        setClient(''); setCategory('General'); setDeadline('');
        setBudget(''); setSelectedEquipment([]);
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
        const val = e.target.value;
        setSearch(val);
        if (!val.trim()) { setSearchResults(null); return; }
        const res = await axios.get(`${API}/tasks/search?keyword=${val}`);
        setSearchResults(res.data);
    };

    // Toggle equipment in the add form
    const toggleDefaultEquip = (item) => {
        setSelectedEquipment(prev => {
            const exists = prev.find(e => e.name === item.name);
            if (exists) return prev.filter(e => e.name !== item.name);
            return [...prev, { name: item.name, cost: item.cost, checked: false }];
        });
    };

    // ── Modal ──────────────────────────────────────────────────────────────────
    const openModal = (task) => {
        setModalTask({ ...task, equipment: task.equipment ? [...task.equipment] : [] });
        setExtraExpenses(task.extraExpenses || 0);
        setActiveModal(task.id);
    };

    const closeModal = () => { setActiveModal(null); setModalTask(null); };

    // Toggle checked on an equipment item inside modal
    const toggleEquipCheck = (index) => {
        const updated = modalTask.equipment.map((e, i) =>
            i === index ? { ...e, checked: !e.checked } : e
        );
        setModalTask({ ...modalTask, equipment: updated });
    };

    // Edit cost of an item inside modal
    const updateEquipCost = (index, cost) => {
        const updated = modalTask.equipment.map((e, i) =>
            i === index ? { ...e, cost: parseFloat(cost) || 0 } : e
        );
        setModalTask({ ...modalTask, equipment: updated });
    };

    // Add custom item inside modal
    const addCustomEquip = () => {
        if (!newEquipName.trim()) return;
        setModalTask({
            ...modalTask,
            equipment: [
                ...modalTask.equipment,
                { name: newEquipName.trim(), cost: parseFloat(newEquipCost) || 0, checked: false }
            ]
        });
        setNewEquipName(''); setNewEquipCost('');
    };

    // Auto-calculated values inside modal
    const gearCost    = modalTask
        ? modalTask.equipment.filter(e => e.checked).reduce((s, e) => s + (parseFloat(e.cost) || 0), 0)
        : 0;
    const totalSpentModal = gearCost + (parseFloat(extraExpenses) || 0);
    const remaining       = modalTask ? (modalTask.budget || 0) - totalSpentModal : 0;

    const saveModal = async () => {
        try {
            const response = await axios.patch(`${API}/tasks/${modalTask.id}/equipment`, {
                equipment: modalTask.equipment,
                extraExpenses: parseFloat(extraExpenses) || 0
            });

            console.log('Save response:', response.data);

            // Directly update tasks from response instead of re-fetching
            if (response.data.tasks) {
                setTasks(response.data.tasks);
            }

            closeModal();

            // Also re-fetch to make sure everything is in sync
            await fetchTasks();

        } catch (err) {
            console.error('Save failed:', err);
            alert('Failed to save. Check console for details.');
        }
    };

    // Display tasks
    let displayTasks = searchResults !== null ? searchResults : tasks;
    if (filterCategory !== 'All') displayTasks = displayTasks.filter(t => t.category === filterCategory);

    const totalBudget    = tasks.reduce((s, t) => s + (t.budget  || 0), 0);
    const totalSpent     = tasks.reduce((s, t) => s + (t.spent   || 0), 0);
    const urgentCount    = tasks.filter(t => t.priority === 'urgent' && !t.completed).length;
    const overdueCount   = tasks.filter(t => { const d = getDaysLeft(t.deadline); return d !== null && d < 0 && !t.completed; }).length;
    const completedCount = tasks.filter(t => t.completed).length;

    return (
        <>
            <style>{styles}</style>
            <div className="app">
                <div className="orb orb-1" /><div className="orb orb-2" />

                {/* NAVBAR */}
                <nav className="navbar">
                    <div className="logo">
                        <span className="logo-text">📷 SHOOTFLOW</span>
                        <span className="logo-sub">PRO</span>
                    </div>
                    <div className="nav-stats">
                        <div className="stat-pill urgent">🔴 {urgentCount} urgent</div>
                        <div className="stat-pill over">⚠️ {overdueCount} overdue</div>
                        <div className="stat-pill done">✓ {completedCount} done</div>
                        <div className="stat-pill">◈ {tasks.length} total</div>
                    </div>
                </nav>

                {/* TABS */}
                <div className="tabs">
                    {[['shoots','📷  Shoots'], ['budget','💰  Budget Overview']].map(([key, label]) => (
                        <button key={key} className={`tab-btn ${activeTab === key ? 'active' : ''}`}
                                onClick={() => setActiveTab(key)}>{label}</button>
                    ))}
                </div>

                <div className="main">

                    {/* ═══════════ SHOOTS TAB ═══════════ */}
                    {activeTab === 'shoots' && <>

                        {/* ADD FORM */}
                        <div className="card">
                            <div className="form-title"><span>+</span> NEW SHOOT</div>

                            <div className="form-grid-2">
                                <div className="field-wrap">
                                    <label className="field-label">Shoot Title *</label>
                                    <input value={title} onChange={e => setTitle(e.target.value)}
                                           onKeyDown={e => e.key === 'Enter' && addTask()}
                                           placeholder="e.g. Sarah's Wedding Day" />
                                </div>
                                <div className="field-wrap">
                                    <label className="field-label">Client Name</label>
                                    <input value={client} onChange={e => setClient(e.target.value)} placeholder="e.g. Sarah & James" />
                                </div>
                            </div>

                            <div className="field-wrap" style={{ marginBottom: 12 }}>
                                <label className="field-label">Notes / Location</label>
                                <input value={description} onChange={e => setDescription(e.target.value)}
                                       placeholder="e.g. Sunset shoot at Galle Fort" />
                            </div>

                            <div className="form-grid-4">
                                <div className="field-wrap">
                                    <label className="field-label">Category</label>
                                    <select value={category} onChange={e => setCategory(e.target.value)}>
                                        {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                                    </select>
                                </div>
                                <div className="field-wrap">
                                    <label className="field-label">Priority</label>
                                    <select value={priority} onChange={e => setPriority(e.target.value)}>
                                        <option value="normal">🟢 Normal</option>
                                        <option value="urgent">🔴 Urgent</option>
                                    </select>
                                </div>
                                <div className="field-wrap">
                                    <label className="field-label">Deadline</label>
                                    <input type="date" value={deadline} onChange={e => setDeadline(e.target.value)} />
                                </div>
                                <div className="field-wrap">
                                    <label className="field-label">Budget (LKR)</label>
                                    <input type="number" value={budget} onChange={e => setBudget(e.target.value)} placeholder="e.g. 50000" />
                                </div>
                            </div>

                            {/* Equipment selector with prices */}
                            <div className="equip-selector-label">🎒 Select Equipment — click to include (prices preset, editable in Manage)</div>
                            <div className="equip-selector-grid">
                                {DEFAULT_EQUIPMENT.map(item => {
                                    const isSelected = selectedEquipment.some(e => e.name === item.name);
                                    return (
                                        <div key={item.name}
                                             className={`equip-selector-item ${isSelected ? 'selected' : ''}`}
                                             onClick={() => toggleDefaultEquip(item)}>
                                            <span className="equip-selector-check">{isSelected ? '✓' : ''}</span>
                                            <span className="equip-selector-name">{item.name}</span>
                                            <span className="equip-selector-cost">LKR {item.cost.toLocaleString()}</span>
                                        </div>
                                    );
                                })}
                            </div>

                            {selectedEquipment.length > 0 && (
                                <div style={{ marginBottom: 16, fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--accent2)' }}>
                                    ✓ {selectedEquipment.length} items selected —
                                    Gear total: LKR {selectedEquipment.reduce((s, e) => s + e.cost, 0).toLocaleString()}
                                    &nbsp;(actual spent calculated when you check items in Manage)
                                </div>
                            )}

                            <button className="btn btn-primary" onClick={addTask}>＋ Add Shoot</button>
                        </div>

                        {/* CONTROLS */}
                        <div className="controls">
                            <input value={search} onChange={handleSearch}
                                   placeholder="🔍  Search shoots, clients, categories..."
                                   style={{ flex: 1, minWidth: 200 }} />
                            <button className={`btn btn-purple ${reversed ? 'active' : ''}`}
                                    onClick={() => { setReversed(!reversed); setSearchResults(null); setSearch(''); }}>
                                {reversed ? '🔁 Newest First' : '🔃 Oldest First'}
                            </button>
                            {undoAvailable && (
                                <button className="btn btn-orange" onClick={undoDelete}>↩ Undo Delete</button>
                            )}
                        </div>

                        {/* CATEGORY FILTER */}
                        <div className="cat-filter">
                            {['All', ...CATEGORIES].map(c => {
                                const cfg = CATEGORY_CONFIG[c];
                                return (
                                    <button key={c}
                                            className={`cat-pill ${filterCategory === c ? 'active' : ''}`}
                                            style={filterCategory === c && cfg ? { background: cfg.color, borderColor: cfg.color } : {}}
                                            onClick={() => setFilterCategory(c)}>
                                        {cfg ? cfg.icon + ' ' : ''}{c}
                                    </button>
                                );
                            })}
                        </div>

                        {/* FEATURE BADGES */}
                        <div className="feature-badges">
                            {[
                                ['rgba(255,77,109,0.1)','#ff4d6d','🔴 F1: Urgent Insert'],
                                ['rgba(251,146,60,0.1)','#fb923c','↩ F2: Undo Delete'],
                                ['rgba(124,106,245,0.1)','#7c6af5','🔁 F3: Reverse View'],
                                ['rgba(96,165,250,0.1)','#60a5fa','👤 F4: Client + Category'],
                                ['rgba(52,211,153,0.1)','#34d399','⏳ F5: Deadline'],
                                ['rgba(34,211,238,0.1)','#22d3ee','🎒 F6: Equipment + Cost'],
                                ['rgba(245,200,66,0.1)','#f5c842','💰 F7: Auto Budget Calc'],
                            ].map(([bg, color, label]) => (
                                <span key={label} className="feature-badge" style={{ background: bg, color, borderColor: color + '55' }}>
                  {label}
                </span>
                            ))}
                        </div>

                        {/* SECTION HEADER */}
                        <div className="section-header">
                            <div className="section-title">SHOOTS ({displayTasks.length})</div>
                            <div className="section-meta">
                                {reversed && '← REVERSE VIEW  '}
                                {searchResults !== null && `← RESULTS FOR "${search}"`}
                            </div>
                        </div>

                        {displayTasks.length === 0 && (
                            <div className="empty">
                                <div className="empty-icon">📭</div>
                                <div className="empty-text">No shoots found — add your first one above</div>
                            </div>
                        )}

                        {/* SHOOT CARDS */}
                        {displayTasks.map((task, index) => {
                            const daysLeft   = getDaysLeft(task.deadline);
                            const isOverdue  = daysLeft !== null && daysLeft < 0 && !task.completed;
                            const isDueSoon  = daysLeft !== null && daysLeft >= 0 && daysLeft <= 3 && !task.completed;
                            const equipTotal = (task.equipment || []).length;
                            const equipDone  = (task.equipment || []).filter(e => e.checked).length;
                            const budgetOver = task.budget > 0 && task.spent > task.budget;
                            const cfg        = CATEGORY_CONFIG[task.category] || CATEGORY_CONFIG.General;

                            return (
                                <div key={task.id}
                                     className={`shoot-card ${task.priority === 'urgent' ? 'urgent' : 'normal'} ${task.completed ? 'completed' : ''}`}>
                                    <div className="card-body">
                                        <div className="card-top">
                                            <span className={`card-title ${task.completed ? 'done' : ''}`}>{task.title}</span>
                                            <span className="cat-badge"
                                                  style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.color}44` }}>
                        {cfg.icon} {task.category}
                      </span>
                                            {task.priority === 'urgent' && !task.completed && <span className="badge badge-urgent">URGENT</span>}
                                            {task.completed  && <span className="badge badge-done">DONE</span>}
                                            {isOverdue       && <span className="badge badge-over">OVERDUE</span>}
                                            {budgetOver      && <span className="badge badge-budget">OVER BUDGET</span>}
                                        </div>

                                        {task.description && (
                                            <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 8 }}>{task.description}</div>
                                        )}

                                        <div className="card-meta">
                                            {task.client !== 'No Client' && (
                                                <span className="meta-item" style={{ color: '#60a5fa' }}>👤 {task.client}</span>
                                            )}
                                            <span className="meta-item">NODE #{index + 1}</span>
                                            {task.deadline && (
                                                <span className="meta-item" style={{ color: isOverdue ? 'var(--red)' : isDueSoon ? 'var(--gold)' : 'var(--green)' }}>
                          {isOverdue ? `⚠ OVERDUE ${Math.abs(daysLeft)}d` : daysLeft === 0 ? '🔥 TODAY' : `⏳ ${daysLeft}d left`}
                        </span>
                                            )}
                                            {equipTotal > 0 && (
                                                <span className="meta-item" style={{ color: '#22d3ee' }}>
                          🎒 {equipDone}/{equipTotal} packed
                        </span>
                                            )}
                                            {task.budget > 0 && (
                                                <span className="meta-item" style={{ color: budgetOver ? 'var(--gold)' : 'var(--green)' }}>
                          💰 LKR {(task.spent || 0).toLocaleString()} / {task.budget.toLocaleString()}
                        </span>
                                            )}
                                        </div>

                                        {task.budget > 0 && (
                                            <div className="progress-bar">
                                                <div className="progress-fill" style={{
                                                    width: `${Math.min(((task.spent || 0) / task.budget) * 100, 100)}%`,
                                                    background: budgetOver
                                                        ? 'var(--red)'
                                                        : 'linear-gradient(90deg, var(--accent2), var(--accent))'
                                                }} />
                                            </div>
                                        )}
                                    </div>

                                    <div className="card-actions">
                                        <button className="btn btn-manage" onClick={() => openModal(task)}>🎒 Manage</button>
                                        <button className={`btn ${task.completed ? 'btn-ghost' : 'btn-success'}`}
                                                onClick={() => completeTask(task.id)}>
                                            {task.completed ? '↺' : '✓'}
                                        </button>
                                        <button className="btn btn-danger" onClick={() => deleteTask(task.id)}>✕</button>
                                    </div>
                                </div>
                            );
                        })}
                    </>}

                    {/* ═══════════ BUDGET TAB ═══════════ */}
                    {activeTab === 'budget' && (
                        <div>
                            <div className="budget-grid">
                                <div className="budget-stat blue">
                                    <div className="budget-label">Total Budget</div>
                                    <div className="budget-value" style={{ color: 'var(--accent2)' }}>LKR {totalBudget.toLocaleString()}</div>
                                </div>
                                <div className="budget-stat green">
                                    <div className="budget-label">Total Spent</div>
                                    <div className="budget-value" style={{ color: totalSpent > totalBudget ? 'var(--red)' : 'var(--green)' }}>
                                        LKR {totalSpent.toLocaleString()}
                                    </div>
                                </div>
                                <div className="budget-stat gold">
                                    <div className="budget-label">Remaining</div>
                                    <div className="budget-value" style={{ color: 'var(--gold)' }}>
                                        LKR {(totalBudget - totalSpent).toLocaleString()}
                                    </div>
                                </div>
                            </div>

                            <div className="card">
                                <div className="section-title" style={{ marginBottom: 20, fontSize: 16 }}>PER SHOOT BREAKDOWN</div>
                                {tasks.filter(t => t.budget > 0).map(task => {
                                    const pct  = Math.min(((task.spent || 0) / task.budget) * 100, 100);
                                    const over = (task.spent || 0) > task.budget;
                                    const equipChecked = (task.equipment || []).filter(e => e.checked);
                                    return (
                                        <div className="budget-row" key={task.id}>
                                            <div className="budget-row-top">
                                                <div>
                                                    <div className="budget-shoot-name">📷 {task.title}</div>
                                                    {task.client !== 'No Client' && (
                                                        <div className="budget-shoot-client">
                                                            👤 {task.client}
                                                            {equipChecked.length > 0 && ` · 🎒 ${equipChecked.length} gear items used`}
                                                            {task.extraExpenses > 0 && ` · 💸 LKR ${task.extraExpenses} extras`}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="budget-amounts" style={{ color: over ? 'var(--red)' : 'var(--green)' }}>
                                                    LKR {(task.spent || 0).toLocaleString()} / {task.budget.toLocaleString()}
                                                    {over && ' ⚠'}
                                                </div>
                                            </div>
                                            <div className="progress-bar" style={{ height: 6 }}>
                                                <div className="progress-fill"
                                                     style={{ width: `${pct}%`, background: over ? 'var(--red)' : 'linear-gradient(90deg,var(--accent2),var(--accent))' }} />
                                            </div>
                                        </div>
                                    );
                                })}
                                {tasks.filter(t => t.budget > 0).length === 0 && (
                                    <div className="empty" style={{ padding: 40 }}>
                                        <div className="empty-text">No shoots with budget set yet</div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* ═══════════ MANAGE MODAL ═══════════ */}
                {activeModal && modalTask && (
                    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && closeModal()}>
                        <div className="modal">
                            <div className="modal-title">🎒 MANAGE SHOOT</div>
                            <div className="modal-sub">
                                📷 {modalTask.title}
                                {modalTask.client !== 'No Client' && ` · 👤 ${modalTask.client}`}
                            </div>

                            {/* EQUIPMENT CHECKLIST */}
                            <div className="modal-section">
                                <div className="modal-section-title">Equipment Checklist — check items used, costs auto-sum</div>

                                {(modalTask.equipment || []).length === 0 && (
                                    <div style={{ color: 'var(--muted)', fontSize: 13, marginBottom: 12 }}>
                                        No equipment added for this shoot.
                                    </div>
                                )}

                                {(modalTask.equipment || []).map((item, i) => (
                                    <div key={i} className={`equip-row ${item.checked ? 'checked' : ''}`}>
                    <span className="equip-check" onClick={() => toggleEquipCheck(i)}>
                      {item.checked ? '✅' : '⬜'}
                    </span>
                                        <span className={`equip-name ${item.checked ? 'done' : ''}`}
                                              onClick={() => toggleEquipCheck(i)}>
                      {item.name}
                    </span>
                                        <span className="equip-cost-label">LKR</span>
                                        <input
                                            className="equip-cost-input"
                                            type="number"
                                            value={item.cost}
                                            onChange={e => updateEquipCost(i, e.target.value)}
                                            onClick={e => e.stopPropagation()}
                                        />
                                    </div>
                                ))}

                                {/* Add custom item */}
                                <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                                    <input value={newEquipName} onChange={e => setNewEquipName(e.target.value)}
                                           placeholder="Custom item name..."
                                           onKeyDown={e => e.key === 'Enter' && addCustomEquip()}
                                           style={{ flex: 2 }} />
                                    <input value={newEquipCost} onChange={e => setNewEquipCost(e.target.value)}
                                           placeholder="LKR cost" type="number"
                                           style={{ flex: 1 }} />
                                    <button className="btn btn-ghost" onClick={addCustomEquip}>Add</button>
                                </div>
                            </div>

                            {/* EXTRA EXPENSES */}
                            <div className="modal-section">
                                <div className="modal-section-title">Extra Expenses (travel, food, venue, other)</div>
                                <div className="extra-expense-row">
                                    <span className="extra-label">LKR</span>
                                    <input className="extra-input" type="number" value={extraExpenses}
                                           onChange={e => setExtraExpenses(e.target.value)}
                                           placeholder="e.g. 2500" />
                                </div>
                            </div>

                            {/* AUTO BUDGET SUMMARY */}
                            <div className="modal-section">
                                <div className="modal-section-title">💰 Auto-Calculated Budget Summary</div>
                                <div className="budget-summary-box">
                                    <div className="budget-summary-row">
                                        <span className="budget-label-text">🎒 Gear Cost (checked items)</span>
                                        <span className="budget-value-accent">LKR {gearCost.toLocaleString()}</span>
                                    </div>
                                    <div className="budget-summary-row">
                                        <span className="budget-label-text">💸 Extra Expenses</span>
                                        <span className="budget-value-gold">LKR {(parseFloat(extraExpenses) || 0).toLocaleString()}</span>
                                    </div>
                                    <div className="budget-summary-row total">
                                        <span className="budget-label-text">TOTAL SPENT</span>
                                        <span className={totalSpentModal > (modalTask.budget || 0) ? 'budget-value-red' : 'budget-value-green'}>
                      LKR {totalSpentModal.toLocaleString()}
                    </span>
                                    </div>
                                    <div className="budget-summary-row remaining">
                                        <span className="budget-label-text">Budget Allocated</span>
                                        <span className="budget-value-text">LKR {(modalTask.budget || 0).toLocaleString()}</span>
                                    </div>
                                    <div className="budget-summary-row remaining">
                                        <span className="budget-label-text">Remaining</span>
                                        <span className={remaining < 0 ? 'budget-value-red' : 'budget-value-green'}>
                      LKR {remaining.toLocaleString()} {remaining < 0 ? '⚠ OVER BUDGET' : '✓'}
                    </span>
                                    </div>
                                    {/* mini progress bar */}
                                    {modalTask.budget > 0 && (
                                        <div className="progress-bar" style={{ height: 6, marginTop: 12 }}>
                                            <div className="progress-fill" style={{
                                                width: `${Math.min((totalSpentModal / modalTask.budget) * 100, 100)}%`,
                                                background: remaining < 0 ? 'var(--red)' : 'linear-gradient(90deg,var(--accent2),var(--accent))'
                                            }} />
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="modal-actions">
                                <button className="btn btn-primary" style={{ flex: 1 }} onClick={saveModal}>
                                    💾 Save & Calculate
                                </button>
                                <button className="btn btn-ghost" style={{ flex: 1 }} onClick={closeModal}>✕ Close</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}