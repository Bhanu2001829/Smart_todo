import { useState, useEffect } from 'react';
import axios from 'axios';

const API = 'http://localhost:5000';

export default function App() {
    const [tasks, setTasks] = useState([]);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [priority, setPriority] = useState('normal');
    const [reversed, setReversed] = useState(false);
    const [search, setSearch] = useState('');
    const [searchResults, setSearchResults] = useState(null);
    const [undoAvailable, setUndoAvailable] = useState(false);

    useEffect(() => { fetchTasks(); }, [reversed]);

    const fetchTasks = async () => {
        const url = reversed ? `${API}/tasks/reverse` : `${API}/tasks`;
        const res = await axios.get(url);
        setTasks(res.data.tasks);
    };

    const addTask = async () => {
        if (!title.trim()) return alert('Please enter a task title!');
        await axios.post(`${API}/tasks`, { title, description, priority });
        setTitle('');
        setDescription('');
        setPriority('normal');
        setUndoAvailable(false);
        setSearchResults(null);
        fetchTasks();
    };

    const deleteTask = async (id) => {
        await axios.delete(`${API}/tasks/${id}`);
        setUndoAvailable(true);
        setSearchResults(null);
        fetchTasks();
    };

    const undoDelete = async () => {
        await axios.post(`${API}/tasks/undo`);
        setUndoAvailable(false);
        fetchTasks();
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

    const displayTasks = searchResults !== null ? searchResults : tasks;
    const urgentCount = tasks.filter(t => t.priority === 'urgent' && !t.completed).length;
    const completedCount = tasks.filter(t => t.completed).length;

    return (
        <div style={{ minHeight: '100vh', background: '#f0f2f5', fontFamily: 'Segoe UI, sans-serif' }}>

            {/* NAVBAR */}
            <div style={{ background: '#2564cf', color: 'white', padding: '15px 30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ margin: 0, fontSize: 22 }}>📋 SmartTodo</h1>
                    <small style={{ opacity: 0.8 }}>Enhanced Microsoft To Do — Powered by Doubly Linked List</small>
                </div>
                <div style={{ display: 'flex', gap: 20, fontSize: 14 }}>
                    <span>🔴 Urgent: {urgentCount}</span>
                    <span>✅ Done: {completedCount}</span>
                    <span>📌 Total: {tasks.length}</span>
                </div>
            </div>

            <div style={{ maxWidth: 800, margin: '30px auto', padding: '0 20px' }}>

                {/* ADD TASK */}
                <div style={{ background: 'white', borderRadius: 12, padding: 25, marginBottom: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                    <h2 style={{ margin: '0 0 15px', color: '#2564cf' }}>➕ Add New Task</h2>
                    <input
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && addTask()}
                        placeholder="What do you need to do?"
                        style={{ width: '100%', padding: '10px 14px', marginBottom: 10, borderRadius: 8, border: '1px solid #ddd', fontSize: 15, boxSizing: 'border-box' }}
                    />
                    <input
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                        placeholder="Add a note (optional)"
                        style={{ width: '100%', padding: '10px 14px', marginBottom: 12, borderRadius: 8, border: '1px solid #ddd', fontSize: 14, boxSizing: 'border-box' }}
                    />
                    <div style={{ display: 'flex', gap: 10 }}>
                        <select
                            value={priority}
                            onChange={e => setPriority(e.target.value)}
                            style={{ flex: 1, padding: '10px 14px', borderRadius: 8, border: '1px solid #ddd', fontSize: 14 }}
                        >
                            <option value="normal">🟢 Normal — Add to end of list</option>
                            <option value="urgent">🔴 Urgent — Jump to top instantly</option>
                        </select>
                        <button
                            onClick={addTask}
                            style={{ padding: '10px 28px', background: '#2564cf', color: 'white', border: 'none', borderRadius: 8, fontSize: 15, fontWeight: 'bold', cursor: 'pointer' }}
                        >
                            Add Task
                        </button>
                    </div>
                </div>

                {/* CONTROLS */}
                <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
                    <input
                        value={search}
                        onChange={handleSearch}
                        placeholder="🔍 Search tasks..."
                        style={{ flex: 1, padding: '10px 14px', borderRadius: 8, border: '1px solid #ddd', fontSize: 14, minWidth: 180 }}
                    />
                    <button
                        onClick={() => { setReversed(!reversed); setSearchResults(null); setSearch(''); }}
                        style={{ padding: '10px 16px', background: reversed ? '#6f42c1' : '#6c757d', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 'bold' }}
                    >
                        {reversed ? '🔁 Newest First (ON)' : '🔃 Oldest First'}
                    </button>
                    {undoAvailable && (
                        <button
                            onClick={undoDelete}
                            style={{ padding: '10px 16px', background: '#fd7e14', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 'bold' }}
                        >
                            ↩️ Undo Delete
                        </button>
                    )}
                </div>

                {/* FEATURE BADGES */}
                <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
                    <span style={{ background: '#fff0f0', border: '1px solid #ffcccc', color: '#cc0000', padding: '4px 12px', borderRadius: 20, fontSize: 12 }}>🔴 Feature 1: Urgent Priority Insert</span>
                    <span style={{ background: '#fff8f0', border: '1px solid #ffddb3', color: '#c85a00', padding: '4px 12px', borderRadius: 20, fontSize: 12 }}>↩️ Feature 2: Undo Delete</span>
                    <span style={{ background: '#f5f0ff', border: '1px solid #d4b3ff', color: '#5a00cc', padding: '4px 12px', borderRadius: 20, fontSize: 12 }}>🔁 Feature 3: Reverse View</span>
                </div>

                {/* TASKS HEADER */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <h2 style={{ margin: 0 }}>📌 Tasks ({displayTasks.length})</h2>
                    <div style={{ fontSize: 13 }}>
                        {reversed && <span style={{ color: '#6f42c1', fontWeight: 'bold' }}>← Reverse View Active</span>}
                        {searchResults !== null && <span style={{ color: '#2564cf', fontWeight: 'bold' }}>← Results for "{search}"</span>}
                    </div>
                </div>

                {/* EMPTY STATE */}
                {displayTasks.length === 0 && (
                    <div style={{ textAlign: 'center', padding: 60, color: '#aaa', background: 'white', borderRadius: 12 }}>
                        <div style={{ fontSize: 48 }}>📭</div>
                        <p>No tasks yet! Add your first task above.</p>
                    </div>
                )}

                {/* TASK CARDS */}
                {displayTasks.map((task, index) => (
                    <div key={task.id} style={{
                        background: task.completed ? '#f8fff8' : task.priority === 'urgent' ? '#fff8f8' : 'white',
                        border: `2px solid ${task.priority === 'urgent' && !task.completed ? '#ffaaaa' : task.completed ? '#aaddaa' : '#e8e8e8'}`,
                        borderRadius: 10, padding: '14px 18px', marginBottom: 10,
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        boxShadow: '0 1px 4px rgba(0,0,0,0.06)'
                    }}>
                        <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                                <span>{task.priority === 'urgent' ? '🔴' : '🟢'}</span>
                                <strong style={{ fontSize: 15, textDecoration: task.completed ? 'line-through' : 'none', color: task.completed ? '#999' : '#222' }}>
                                    {task.title}
                                </strong>
                                {task.priority === 'urgent' && !task.completed && (
                                    <span style={{ background: '#ff4444', color: 'white', fontSize: 10, padding: '2px 8px', borderRadius: 10 }}>URGENT</span>
                                )}
                                {task.completed && (
                                    <span style={{ background: '#28a745', color: 'white', fontSize: 10, padding: '2px 8px', borderRadius: 10 }}>DONE</span>
                                )}
                            </div>
                            {task.description && (
                                <p style={{ margin: '0 0 4px 24px', color: '#666', fontSize: 13 }}>{task.description}</p>
                            )}
                            <small style={{ color: '#bbb', marginLeft: 24 }}>🕐 {task.createdAt} | Node #{index + 1}</small>
                        </div>
                        <div style={{ display: 'flex', gap: 6, marginLeft: 12 }}>
                            <button onClick={() => completeTask(task.id)}
                                    style={{ padding: '6px 12px', background: task.completed ? '#6c757d' : '#28a745', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 16 }}>
                                {task.completed ? '↺' : '✓'}
                            </button>
                            <button onClick={() => deleteTask(task.id)}
                                    style={{ padding: '6px 12px', background: '#dc3545', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 16 }}>
                                🗑
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}