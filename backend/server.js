const express = require('express');
const cors = require('cors');
const DoublyLinkedList = require('./DoublyLinkedList');

const app = express();
app.use(cors());
app.use(express.json());

const list = new DoublyLinkedList();
let idCounter = 1;

// GET all tasks
app.get('/tasks', (req, res) => {
    res.json({ tasks: list.toArray(), size: list.size });
});

// GET reverse
app.get('/tasks/reverse', (req, res) => {
    res.json({ tasks: list.toReverseArray(), size: list.size });
});

// SEARCH
app.get('/tasks/search', (req, res) => {
    res.json(list.search(req.query.keyword || ''));
});

// ADD task
app.post('/tasks', (req, res) => {
    const { title, description, priority, client, category, deadline, budget, equipment } = req.body;
    if (!title) return res.status(400).json({ error: 'Title is required' });

    const task = {
        id: idCounter++,
        title,
        description: description || '',
        priority: priority || 'normal',
        client: client || 'No Client',
        category: category || 'General',
        deadline: deadline || null,
        budget: parseFloat(budget) || 0,          // NEW - budget amount
        spent: 0,                                  // NEW - amount spent
        equipment: equipment || [],                // NEW - gear list
        equipmentChecked: [],                      // NEW - checked gear
        completed: false,
        createdAt: new Date().toLocaleTimeString(),
        createdDate: new Date().toLocaleDateString()
    };

    if (priority === 'urgent') list.prepend(task);
    else list.append(task);

    res.json({ success: true, tasks: list.toArray() });
});

// DELETE task
app.delete('/tasks/:id', (req, res) => {
    const deleted = list.delete(parseInt(req.params.id));
    res.json({ success: deleted, tasks: list.toArray() });
});

// UNDO delete
app.post('/tasks/undo', (req, res) => {
    const success = list.undoDelete();
    res.json({ success, tasks: list.toArray() });
});

// COMPLETE task
app.patch('/tasks/:id/complete', (req, res) => {
    const success = list.complete(parseInt(req.params.id));
    res.json({ success, tasks: list.toArray() });
});

// UPDATE equipment checklist
app.patch('/tasks/:id/equipment', (req, res) => {
    const { equipment, equipmentChecked } = req.body;
    const success = list.updateEquipment(parseInt(req.params.id), equipment, equipmentChecked);
    res.json({ success, tasks: list.toArray() });
});

// UPDATE budget spent
app.patch('/tasks/:id/budget', (req, res) => {
    const { spent } = req.body;
    const success = list.updateBudget(parseInt(req.params.id), spent);
    res.json({ success, tasks: list.toArray() });
});

app.listen(5000, () => {
    console.log('✅ Backend running at http://localhost:5000');
});