const express = require('express');
const cors = require('cors');
const DoublyLinkedList = require('./DoublyLinkedList');

const app = express();
app.use(cors());
app.use(express.json());

const list = new DoublyLinkedList();
let idCounter = 1;

app.get('/tasks', (req, res) => {
    res.json({ tasks: list.toArray(), size: list.size });
});

app.get('/tasks/reverse', (req, res) => {
    res.json({ tasks: list.toReverseArray(), size: list.size });
});

app.get('/tasks/search', (req, res) => {
    res.json(list.search(req.query.keyword || ''));
});

app.post('/tasks', (req, res) => {
    const { title, description, priority } = req.body;
    if (!title) return res.status(400).json({ error: 'Title is required' });

    const task = {
        id: idCounter++,
        title,
        description: description || '',
        priority: priority || 'normal',
        completed: false,
        createdAt: new Date().toLocaleTimeString()
    };

    if (priority === 'urgent') list.prepend(task);
    else list.append(task);

    res.json({ success: true, tasks: list.toArray() });
});

app.delete('/tasks/:id', (req, res) => {
    const deleted = list.delete(parseInt(req.params.id));
    res.json({ success: deleted, tasks: list.toArray() });
});

app.post('/tasks/undo', (req, res) => {
    const success = list.undoDelete();
    res.json({ success, tasks: list.toArray() });
});

app.patch('/tasks/:id/complete', (req, res) => {
    const success = list.complete(parseInt(req.params.id));
    res.json({ success, tasks: list.toArray() });
});

app.listen(5000, () => {
    console.log('✅ Backend running at http://localhost:5000');
});