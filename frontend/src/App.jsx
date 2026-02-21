import { useState, useEffect } from 'react';
import axios from 'axios';

const API = 'http://localhost:5000';
const CATEGORIES = ['Wedding', 'Portrait', 'Event', 'Commercial', 'Nature', 'Product', 'General'];
const CATEGORY_COLORS = {
    Wedding: '#ff6b9d', Portrait: '#a855f7', Event: '#3b82f6',
    Commercial: '#f59e0b', Nature: '#22c55e', Product: '#06b6d4', General: '#6b7280'
};
const DEFAULT_EQUIPMENT = ['Camera Body', 'Lens 50mm', 'Tripod', 'Flash', 'Memory Cards', 'Battery Pack', 'Reflector', 'Laptop'];

function getDaysLeft(deadline) {
    if (!deadline) return null;
    return Math.ceil((new Date(deadline) - new Date()) / (1000 * 60 * 60 * 24));
}

const dark = { minHeight: '100vh', background: '#0a0a14', fontFamily: 'Segoe UI, sans-serif', color: 'white' };
const card = { background: '#13131f', borderRadius: 14, padding: 22, marginBottom: 20, border: '1px solid #222' };
const inp = { padding: '10px 14px', borderRadius: 8, border: '1px solid #2a2a4a', background: '#0a0a14', color: 'white', fontSize: 14, width: '100%', boxSizing: 'border-box' };
const btn = (bg) => ({ padding: '10px 18px', background: bg, color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 'bold', fontSize: 14 });

export default function App() {
    const [tasks, setTasks] = useState([]);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [priority, setPriority] = useState('normal');
    const [client, setClient] = useState('');
    const [category, setCategory] = useState('General');
    const [deadline, setDeadline] = useState('');
    const [budget, setBudget] = useState('');
    const [selectedEquipment, setSelectedEquipment] = useState([]);
    const [reversed, setReversed] = useState(false);
    const [search, setSearch] = useState('');
    const [searchResults, setSearchResults] = useState(null);
    const [undoAvailable, setUndoAvailable] = useState(false);
    const [filterCategory, setFilterCategory] = useState('All');
    const [activeModal, setActiveModal] = useState(null); // task id for modal
    const [modalTask, setModalTask] = useState(null);
    const [newEquipItem, setNewEquipItem] = useState('');
    const [spentInput, setSpentInput] = useState('');
    const [activeTab, setActiveTab] = useState('shoots'); // shoots | budget

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
            deadline, budget, equipment: selectedEquipment
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

    const openModal = (task) => {
        setModalTask({ ...task });
        setSpentInput(task.spent || 0);
        setActiveModal(task.id);
    };

    const closeModal = () => { setActiveModal(null); setModalTask(null); };

    const toggleEquipCheck = (item) => {
        const checked = modalTask.equipmentChecked || [];
        const updated = checked.includes(item)
            ? checked.filter(i => i !== item)
            : [...checked, item];
        setModalTask({ ...modalTask, equipmentChecked: updated });
    };

    const addEquipItem = () => {
        if (!newEquipItem.trim()) return;
        setModalTask({ ...modalTask, equipment: [...(modalTask.equipment || []), newEquipItem.trim()] });
        setNewEquipItem('');
    };

    const saveModal = async () => {
        await axios.patch(`${API}/tasks/${modalTask.id}/equipment`, {
            equipment: modalTask.equipment,
            equipmentChecked: modalTask.equipmentChecked
        });
        await axios.patch(`${API}/tasks/${modalTask.id}/budget`, { spent: spentInput });
        fetchTasks();
        closeModal();
    };

    const toggleDefaultEquip = (item) => {
        setSelectedEquipment(prev =>
            prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]
        );
    };

    let displayTasks = searchResults !== null ? searchResults : tasks;
    if (filterCategory !== 'All') displayTasks = displayTasks.filter(t => t.category === filterCategory);

    const totalBudget = tasks.reduce((sum, t) => sum + (t.budget || 0), 0);
    const totalSpent = tasks.reduce((sum, t) => sum + (t.spent || 0), 0);
    const urgentCount = tasks.filter(t => t.priority === 'urgent' && !t.completed).length;
    const overdueCount = tasks.filter(t => { const d = getDaysLeft(t.deadline); return d !== null && d < 0 && !t.completed; }).length;
    const completedCount = tasks.filter(t => t.completed).length;

    return (
        <div style={dark}>

            {/* NAVBAR */}
            <div style={{ background: 'linear-gradient(135deg, #13131f, #1a1a2e)', padding: '16px 30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #222' }}>
                <div>
                    <h1 style={{ margin: 0, fontSize: 24 }}>📷 ShootFlow Pro</h1>
                    <small style={{ color: '#666' }}>Photographer Workflow Manager — Doubly Linked List</small>
                </div>
                <div style={{ display: 'flex', gap: 18, fontSize: 13 }}>
                    <span style={{ color: '#ff6b6b' }}>🔴 {urgentCount} Urgent</span>
                    <span style={{ color: '#ff9f43' }}>⚠️ {overdueCount} Overdue</span>
                    <span style={{ color: '#54a0ff' }}>✅ {completedCount} Done</span>
                    <span style={{ color: '#aaa' }}>📌 {tasks.length} Total</span>
                </div>
            </div>

            {/* TABS */}
            <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid #222', background: '#13131f' }}>
                {[['shoots', '📷 Shoots'], ['budget', '💰 Budget Summary']].map(([key, label]) => (
                    <button key={key} onClick={() => setActiveTab(key)}
                            style={{ padding: '12px 28px', background: 'none', border: 'none', color: activeTab === key ? '#54a0ff' : '#666', borderBottom: activeTab === key ? '2px solid #54a0ff' : '2px solid transparent', cursor: 'pointer', fontSize: 14, fontWeight: 'bold' }}>
                        {label}
                    </button>
                ))}
            </div>

            <div style={{ maxWidth: 960, margin: '24px auto', padding: '0 20px' }}>

                {/* ===== SHOOTS TAB ===== */}
                {activeTab === 'shoots' && <>

                    {/* ADD FORM */}
                    <div style={card}>
                        <h2 style={{ margin: '0 0 16px', color: '#54a0ff' }}>➕ New Shoot / Task</h2>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                            <input value={title} onChange={e => setTitle(e.target.value)}
                                   placeholder="📷 Shoot title" style={inp} onKeyDown={e => e.key === 'Enter' && addTask()} />
                            <input value={client} onChange={e => setClient(e.target.value)}
                                   placeholder="👤 Client name" style={inp} />
                        </div>
                        <input value={description} onChange={e => setDescription(e.target.value)}
                               placeholder="📝 Notes / location / special requests"
                               style={{ ...inp, marginBottom: 12 }} />
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 12, marginBottom: 16 }}>
                            <select value={category} onChange={e => setCategory(e.target.value)} style={inp}>
                                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                            </select>
                            <select value={priority} onChange={e => setPriority(e.target.value)} style={inp}>
                                <option value="normal">🟢 Normal</option>
                                <option value="urgent">🔴 Urgent</option>
                            </select>
                            <input type="date" value={deadline} onChange={e => setDeadline(e.target.value)} style={inp} />
                            <input type="number" value={budget} onChange={e => setBudget(e.target.value)}
                                   placeholder="💰 Budget (LKR)" style={inp} />
                        </div>

                        {/* Equipment selector */}
                        <div style={{ marginBottom: 16 }}>
                            <p style={{ margin: '0 0 8px', color: '#888', fontSize: 13 }}>🎒 Select Equipment for this shoot:</p>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                                {DEFAULT_EQUIPMENT.map(item => (
                                    <button key={item} onClick={() => toggleDefaultEquip(item)}
                                            style={{ padding: '5px 12px', borderRadius: 20, border: 'none', cursor: 'pointer', fontSize: 12,
                                                background: selectedEquipment.includes(item) ? '#54a0ff' : '#2a2a4a', color: 'white' }}>
                                        {selectedEquipment.includes(item) ? '✓ ' : ''}{item}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <button onClick={addTask} style={btn('#54a0ff')}>Add Shoot</button>
                    </div>

                    {/* CONTROLS */}
                    <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
                        <input value={search} onChange={handleSearch}
                               placeholder="🔍 Search shoots, clients, categories..."
                               style={{ ...inp, flex: 1, minWidth: 200 }} />
                        <button onClick={() => { setReversed(!reversed); setSearchResults(null); setSearch(''); }}
                                style={btn(reversed ? '#6f42c1' : '#444')}>
                            {reversed ? '🔁 Newest First (ON)' : '🔃 Oldest First'}
                        </button>
                        {undoAvailable && (
                            <button onClick={undoDelete} style={btn('#fd7e14')}>↩️ Undo Delete</button>
                        )}
                    </div>

                    {/* CATEGORY FILTER */}
                    <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
                        {['All', ...CATEGORIES].map(c => (
                            <button key={c} onClick={() => setFilterCategory(c)}
                                    style={{ padding: '5px 14px', borderRadius: 20, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 'bold',
                                        background: filterCategory === c ? (CATEGORY_COLORS[c] || '#54a0ff') : '#2a2a4a', color: 'white' }}>
                                {c}
                            </button>
                        ))}
                    </div>

                    {/* FEATURE BADGES */}
                    <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
                        {[
                            ['#ff000033','#ff6b6b','🔴 F1: Urgent Insert'],
                            ['#fd7e1433','#fd7e14','↩️ F2: Undo Delete'],
                            ['#6f42c133','#a78bfa','🔁 F3: Reverse View'],
                            ['#54a0ff33','#54a0ff','👤 F4: Client + Category'],
                            ['#22c55e33','#22c55e','⏳ F5: Deadline Countdown'],
                            ['#06b6d433','#06b6d4','🎒 F6: Equipment Checklist'],
                            ['#f59e0b33','#f59e0b','💰 F7: Budget Tracker'],
                        ].map(([bg, color, label]) => (
                            <span key={label} style={{ background: bg, border: `1px solid ${color}`, color, padding: '4px 12px', borderRadius: 20, fontSize: 11 }}>{label}</span>
                        ))}
                    </div>

                    {/* TASKS */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                        <h2 style={{ margin: 0 }}>🗂 Shoots ({displayTasks.length})</h2>
                        <div style={{ fontSize: 13, color: '#888' }}>
                            {reversed && <span style={{ color: '#a78bfa' }}>← Reverse View Active &nbsp;</span>}
                            {searchResults !== null && <span style={{ color: '#54a0ff' }}>← Results for "{search}"</span>}
                        </div>
                    </div>

                    {displayTasks.length === 0 && (
                        <div style={{ textAlign: 'center', padding: 60, color: '#444', background: '#13131f', borderRadius: 12 }}>
                            <div style={{ fontSize: 48 }}>📭</div>
                            <p>No shoots found. Add your first one above!</p>
                        </div>
                    )}

                    {displayTasks.map((task, index) => {
                        const daysLeft = getDaysLeft(task.deadline);
                        const isOverdue = daysLeft !== null && daysLeft < 0 && !task.completed;
                        const isDueSoon = daysLeft !== null && daysLeft >= 0 && daysLeft <= 3 && !task.completed;
                        const equipTotal = (task.equipment || []).length;
                        const equipDone = (task.equipmentChecked || []).length;
                        const budgetOver = task.budget > 0 && task.spent > task.budget;

                        return (
                            <div key={task.id} style={{
                                background: task.completed ? '#0a140a' : isOverdue ? '#140a0a' : '#13131f',
                                border: `2px solid ${isOverdue ? '#ff4444' : task.priority === 'urgent' ? '#ff6b6b44' : '#222'}`,
                                borderRadius: 12, padding: '16px 18px', marginBottom: 10,
                                display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'
                            }}>
                                <div style={{ flex: 1 }}>
                                    {/* ROW 1 - title & badges */}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
                                        <span>{task.priority === 'urgent' ? '🔴' : '🟢'}</span>
                                        <strong style={{ fontSize: 15, textDecoration: task.completed ? 'line-through' : 'none', color: task.completed ? '#444' : 'white' }}>
                                            {task.title}
                                        </strong>
                                        <span style={{ background: CATEGORY_COLORS[task.category] || '#6b7280', color: 'white', fontSize: 10, padding: '2px 10px', borderRadius: 10 }}>{task.category}</span>
                                        {task.priority === 'urgent' && !task.completed && <span style={{ background: '#ff4444', color: 'white', fontSize: 10, padding: '2px 8px', borderRadius: 10 }}>URGENT</span>}
                                        {task.completed && <span style={{ background: '#22c55e', color: 'white', fontSize: 10, padding: '2px 8px', borderRadius: 10 }}>DONE</span>}
                                        {isOverdue && <span style={{ background: '#ff4444', color: 'white', fontSize: 10, padding: '2px 8px', borderRadius: 10 }}>OVERDUE</span>}
                                        {budgetOver && <span style={{ background: '#f59e0b', color: 'white', fontSize: 10, padding: '2px 8px', borderRadius: 10 }}>OVER BUDGET</span>}
                                    </div>

                                    {/* ROW 2 - client & notes */}
                                    <div style={{ marginLeft: 24, marginBottom: 8 }}>
                                        {task.client !== 'No Client' && <span style={{ color: '#54a0ff', fontSize: 13 }}>👤 {task.client} &nbsp;</span>}
                                        {task.description && <span style={{ color: '#666', fontSize: 13 }}>— {task.description}</span>}
                                    </div>

                                    {/* ROW 3 - stats row */}
                                    <div style={{ marginLeft: 24, display: 'flex', gap: 18, flexWrap: 'wrap', fontSize: 12 }}>
                                        <span style={{ color: '#555' }}>Node #{index + 1} | {task.createdDate}</span>

                                        {/* Feature 5 - Deadline */}
                                        {task.deadline && (
                                            <span style={{ color: isOverdue ? '#ff4444' : isDueSoon ? '#ff9f43' : '#22c55e', fontWeight: 'bold' }}>
                        {isOverdue ? `⚠️ Overdue ${Math.abs(daysLeft)}d` : daysLeft === 0 ? '🔥 Due Today!' : `⏳ ${daysLeft}d left`}
                      </span>
                                        )}

                                        {/* Feature 6 - Equipment */}
                                        {equipTotal > 0 && (
                                            <span style={{ color: equipDone === equipTotal ? '#22c55e' : '#06b6d4' }}>
                        🎒 {equipDone}/{equipTotal} gear packed
                      </span>
                                        )}

                                        {/* Feature 7 - Budget */}
                                        {task.budget > 0 && (
                                            <span style={{ color: budgetOver ? '#f59e0b' : '#22c55e' }}>
                        💰 LKR {task.spent || 0} / {task.budget}
                      </span>
                                        )}
                                    </div>
                                </div>

                                {/* BUTTONS */}
                                <div style={{ display: 'flex', gap: 6, marginLeft: 12, flexShrink: 0 }}>
                                    <button onClick={() => openModal(task)}
                                            style={{ padding: '6px 12px', background: '#2a2a4a', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 13 }}>
                                        🎒 Manage
                                    </button>
                                    <button onClick={() => completeTask(task.id)}
                                            style={{ padding: '6px 12px', background: task.completed ? '#444' : '#22c55e', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer' }}>
                                        {task.completed ? '↺' : '✓'}
                                    </button>
                                    <button onClick={() => deleteTask(task.id)}
                                            style={{ padding: '6px 12px', background: '#dc3545', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer' }}>
                                        🗑
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </>}

                {/* ===== BUDGET TAB ===== */}
                {activeTab === 'budget' && (
                    <div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 24 }}>
                            {[
                                ['💰 Total Budget', `LKR ${totalBudget.toLocaleString()}`, '#54a0ff'],
                                ['💸 Total Spent', `LKR ${totalSpent.toLocaleString()}`, totalSpent > totalBudget ? '#ff4444' : '#22c55e'],
                                ['📊 Remaining', `LKR ${(totalBudget - totalSpent).toLocaleString()}`, '#f59e0b'],
                            ].map(([label, value, color]) => (
                                <div key={label} style={{ ...card, textAlign: 'center' }}>
                                    <p style={{ margin: '0 0 8px', color: '#888', fontSize: 13 }}>{label}</p>
                                    <h2 style={{ margin: 0, color, fontSize: 24 }}>{value}</h2>
                                </div>
                            ))}
                        </div>

                        <div style={card}>
                            <h3 style={{ margin: '0 0 16px', color: '#54a0ff' }}>📋 Per Shoot Breakdown</h3>
                            {tasks.filter(t => t.budget > 0).map(task => {
                                const percent = Math.min((task.spent / task.budget) * 100, 100);
                                const over = task.spent > task.budget;
                                return (
                                    <div key={task.id} style={{ marginBottom: 16 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                                            <span style={{ fontSize: 14 }}>📷 {task.title} {task.client !== 'No Client' && `— ${task.client}`}</span>
                                            <span style={{ fontSize: 13, color: over ? '#ff4444' : '#22c55e' }}>
                        LKR {task.spent} / {task.budget} {over && '⚠️ OVER'}
                      </span>
                                        </div>
                                        <div style={{ background: '#2a2a4a', borderRadius: 10, height: 10, overflow: 'hidden' }}>
                                            <div style={{ width: `${percent}%`, height: '100%', background: over ? '#ff4444' : '#54a0ff', borderRadius: 10, transition: 'width 0.3s' }} />
                                        </div>
                                    </div>
                                );
                            })}
                            {tasks.filter(t => t.budget > 0).length === 0 && (
                                <p style={{ color: '#555', textAlign: 'center' }}>No shoots with budget set yet.</p>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* ===== EQUIPMENT & BUDGET MODAL ===== */}
            {activeModal && modalTask && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: '#000000cc', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div style={{ background: '#13131f', borderRadius: 16, padding: 28, width: 520, maxHeight: '85vh', overflowY: 'auto', border: '1px solid #2a2a4a' }}>
                        <h2 style={{ margin: '0 0 4px', color: '#54a0ff' }}>🎒 Manage: {modalTask.title}</h2>
                        <p style={{ color: '#666', margin: '0 0 20px', fontSize: 13 }}>👤 {modalTask.client}</p>

                        {/* EQUIPMENT */}
                        <h3 style={{ color: '#06b6d4', margin: '0 0 12px' }}>Equipment Checklist</h3>
                        {(modalTask.equipment || []).length === 0 && <p style={{ color: '#555', fontSize: 13 }}>No equipment added yet.</p>}
                        {(modalTask.equipment || []).map(item => (
                            <div key={item} onClick={() => toggleEquipCheck(item)}
                                 style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', marginBottom: 6, background: '#0a0a14', borderRadius: 8, cursor: 'pointer',
                                     border: `1px solid ${(modalTask.equipmentChecked || []).includes(item) ? '#22c55e' : '#2a2a4a'}` }}>
                                <span style={{ fontSize: 18 }}>{(modalTask.equipmentChecked || []).includes(item) ? '✅' : '⬜'}</span>
                                <span style={{ textDecoration: (modalTask.equipmentChecked || []).includes(item) ? 'line-through' : 'none', color: (modalTask.equipmentChecked || []).includes(item) ? '#555' : 'white' }}>
                  {item}
                </span>
                            </div>
                        ))}

                        {/* Add custom equipment */}
                        <div style={{ display: 'flex', gap: 8, marginTop: 10, marginBottom: 20 }}>
                            <input value={newEquipItem} onChange={e => setNewEquipItem(e.target.value)}
                                   placeholder="Add custom gear item..."
                                   onKeyDown={e => e.key === 'Enter' && addEquipItem()}
                                   style={{ ...inp, flex: 1 }} />
                            <button onClick={addEquipItem} style={btn('#06b6d4')}>Add</button>
                        </div>

                        {/* BUDGET */}
                        <h3 style={{ color: '#f59e0b', margin: '0 0 12px' }}>💰 Budget Tracker</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 8 }}>
                            <div style={{ background: '#0a0a14', padding: 14, borderRadius: 8, textAlign: 'center' }}>
                                <p style={{ margin: '0 0 4px', color: '#888', fontSize: 12 }}>Total Budget</p>
                                <p style={{ margin: 0, color: '#54a0ff', fontSize: 20, fontWeight: 'bold' }}>LKR {modalTask.budget || 0}</p>
                            </div>
                            <div style={{ background: '#0a0a14', padding: 14, borderRadius: 8, textAlign: 'center' }}>
                                <p style={{ margin: '0 0 4px', color: '#888', fontSize: 12 }}>Amount Spent</p>
                                <p style={{ margin: 0, color: spentInput > modalTask.budget ? '#ff4444' : '#22c55e', fontSize: 20, fontWeight: 'bold' }}>LKR {spentInput}</p>
                            </div>
                        </div>
                        <input type="number" value={spentInput} onChange={e => setSpentInput(e.target.value)}
                               placeholder="Enter amount spent so far..."
                               style={{ ...inp, marginBottom: 20 }} />

                        {/* SAVE & CLOSE */}
                        <div style={{ display: 'flex', gap: 10 }}>
                            <button onClick={saveModal} style={{ ...btn('#54a0ff'), flex: 1 }}>💾 Save Changes</button>
                            <button onClick={closeModal} style={{ ...btn('#444'), flex: 1 }}>✕ Close</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}