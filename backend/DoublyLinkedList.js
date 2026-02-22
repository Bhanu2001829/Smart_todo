class Node {
    constructor(data) {
        this.data = data;
        this.prev = null;
        this.next = null;
    }
}

class DoublyLinkedList {
    constructor() {
        this.head = null;
        this.tail = null;
        this.size = 0;
        this.lastDeleted = null;
    }

    append(data) {
        const node = new Node(data);
        if (!this.head) { this.head = node; this.tail = node; }
        else {
            node.prev = this.tail;
            this.tail.next = node;
            this.tail = node;
        }
        this.size++;
    }

    prepend(data) {
        const node = new Node(data);
        if (!this.head) { this.head = node; this.tail = node; }
        else {
            node.next = this.head;
            this.head.prev = node;
            this.head = node;
        }
        this.size++;
    }

    delete(id) {
        let current = this.head;
        while (current) {
            if (current.data.id === id) {
                this.lastDeleted = current.data;
                if (current.prev) current.prev.next = current.next;
                else this.head = current.next;
                if (current.next) current.next.prev = current.prev;
                else this.tail = current.prev;
                this.size--;
                return true;
            }
            current = current.next;
        }
        return false;
    }

    undoDelete() {
        if (!this.lastDeleted) return false;
        const task = this.lastDeleted;
        this.lastDeleted = null;
        if (task.priority === 'urgent') this.prepend(task);
        else this.append(task);
        return true;
    }

    toArray() {
        const result = [];
        let current = this.head;
        while (current) { result.push(current.data); current = current.next; }
        return result;
    }

    toReverseArray() {
        const result = [];
        let current = this.tail;
        while (current) { result.push(current.data); current = current.prev; }
        return result;
    }

    search(keyword) {
        const result = [];
        const kw = keyword.toLowerCase();
        let current = this.head;
        while (current) {
            const d = current.data;
            if (
                d.title.toLowerCase().includes(kw) ||
                d.client.toLowerCase().includes(kw) ||
                d.category.toLowerCase().includes(kw)
            ) result.push(d);
            current = current.next;
        }
        return result;
    }

    complete(id) {
        let current = this.head;
        while (current) {
            if (current.data.id === id) {
                current.data.completed = !current.data.completed;
                return true;
            }
            current = current.next;
        }
        return false;
    }

    // equipment is now array of { name, cost, checked }
    // spent = sum of cost of checked items + extraExpenses
    updateEquipment(id, equipment, extraExpenses) {
        let current = this.head;
        while (current) {
            if (current.data.id === id) {
                current.data.equipment = equipment;

                // Calculate gear cost from checked items
                const gearCost = equipment
                    .filter(e => e.checked === true)
                    .reduce((sum, e) => sum + (parseFloat(e.cost) || 0), 0);

                const extra = parseFloat(extraExpenses) || 0;

                // Save everything back to the node
                current.data.spent         = gearCost + extra;
                current.data.extraExpenses = extra;
                current.data.gearCost      = gearCost;

                console.log(`✅ Task ${id} | Gear: ${gearCost} | Extra: ${extra} | Total Spent: ${current.data.spent}`);
                return true;
            }
            current = current.next;
        }
        return false;
    }
}

module.exports = DoublyLinkedList;