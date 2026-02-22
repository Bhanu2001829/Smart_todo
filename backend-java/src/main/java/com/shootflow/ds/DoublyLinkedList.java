package com.shootflow.ds;

import com.shootflow.model.EquipmentItem;
import com.shootflow.model.Task;
import java.util.ArrayList;
import java.util.List;

public class DoublyLinkedList {

    // ── Inner Node class ─────────────────────────────────────────────────────
    // JS: class Node { constructor(data) { this.data=data; this.prev=null; this.next=null; } }
    private static class Node {
        Task data;
        Node prev;
        Node next;
        Node(Task data) {
            this.data = data;
            this.prev = null;
            this.next = null;
        }
    }

    // ── Fields ───────────────────────────────────────────────────────────────
    // JS: this.head = null; this.tail = null; this.size = 0; this.lastDeleted = null;
    private Node head;
    private Node tail;
    private int  size;
    private Task lastDeleted;

    public DoublyLinkedList() {
        this.head        = null;
        this.tail        = null;
        this.size        = 0;
        this.lastDeleted = null;
    }

    // ── append() ─────────────────────────────────────────────────────────────
    // Adds task to END — normal priority — O(1)
    // JS: append(data) { const node = new Node(data); if (!this.head) {...} else {...} this.size++; }
    public void append(Task data) {
        Node node = new Node(data);
        if (head == null) {
            head = node;
            tail = node;
        } else {
            node.prev = tail;
            tail.next = node;
            tail      = node;
        }
        size++;
    }

    // ── prepend() ────────────────────────────────────────────────────────────
    // Adds task to FRONT — urgent priority — O(1)  [Feature 1]
    // JS: prepend(data) { const node = new Node(data); if (!this.head) {...} else {...} this.size++; }
    public void prepend(Task data) {
        Node node = new Node(data);
        if (head == null) {
            head = node;
            tail = node;
        } else {
            node.next = head;
            head.prev = node;
            head      = node;
        }
        size++;
    }

    // ── delete() ─────────────────────────────────────────────────────────────
    // Removes node by ID, saves to lastDeleted for undo — O(n)  [Feature 2]
    // JS: delete(id) { let current = this.head; while (current) { if (current.data.id === id) {...} } }
    public boolean delete(int id) {
        Node current = head;
        while (current != null) {
            if (current.data.getId() == id) {
                lastDeleted = current.data;

                if (current.prev != null) current.prev.next = current.next;
                else                      head              = current.next;

                if (current.next != null) current.next.prev = current.prev;
                else                      tail              = current.prev;

                size--;
                return true;
            }
            current = current.next;
        }
        return false;
    }

    // ── undoDelete() ─────────────────────────────────────────────────────────
    // Restores last deleted task — O(1)  [Feature 2]
    // JS: undoDelete() { if (!this.lastDeleted) return false; ... prepend or append }
    public boolean undoDelete() {
        if (lastDeleted == null) return false;
        Task task   = lastDeleted;
        lastDeleted = null;
        if ("urgent".equals(task.getPriority())) prepend(task);
        else                                      append(task);
        return true;
    }

    // ── toList() ─────────────────────────────────────────────────────────────
    // Forward traversal head→tail — O(n)
    // JS: toArray() { const result=[]; let current=this.head; while(current){...} return result; }
    public List<Task> toList() {
        List<Task> result  = new ArrayList<>();
        Node       current = head;
        while (current != null) {
            result.add(current.data);
            current = current.next;
        }
        return result;
    }

    // ── toReverseList() ──────────────────────────────────────────────────────
    // Backward traversal tail→head using .prev pointers — O(n)  [Feature 3]
    // Only possible with a Doubly Linked List!
    // JS: toReverseArray() { const result=[]; let current=this.tail; while(current){...current=current.prev} }
    public List<Task> toReverseList() {
        List<Task> result  = new ArrayList<>();
        Node       current = tail;
        while (current != null) {
            result.add(current.data);
            current = current.prev;
        }
        return result;
    }

    // ── search() ─────────────────────────────────────────────────────────────
    // Search by keyword across title, client, category — O(n)
    // JS: search(keyword) { ... d.title.toLowerCase().includes(kw) || d.client... }
    public List<Task> search(String keyword) {
        List<Task> result  = new ArrayList<>();
        String     kw      = keyword.toLowerCase();
        Node       current = head;
        while (current != null) {
            Task d = current.data;
            if (d.getTitle().toLowerCase().contains(kw)    ||
                    d.getClient().toLowerCase().contains(kw)   ||
                    d.getCategory().toLowerCase().contains(kw)) {
                result.add(d);
            }
            current = current.next;
        }
        return result;
    }

    // ── complete() ───────────────────────────────────────────────────────────
    // Toggle completed status — O(n)
    // JS: complete(id) { ... current.data.completed = !current.data.completed; }
    public boolean complete(int id) {
        Node current = head;
        while (current != null) {
            if (current.data.getId() == id) {
                current.data.setCompleted(!current.data.isCompleted());
                return true;
            }
            current = current.next;
        }
        return false;
    }

    // ── updateEquipment() ────────────────────────────────────────────────────
    // Updates equipment and AUTO-CALCULATES spent  [Feature 6 & 7]
    //
    // JS equivalent:
    //   updateEquipment(id, equipment, extraExpenses) {
    //     ...
    //     const gearCost = equipment.filter(e=>e.checked).reduce((sum,e)=>sum+e.cost, 0);
    //     current.data.spent = gearCost + extra;
    //   }
    public boolean updateEquipment(int id,
                                   List<EquipmentItem> equipment,
                                   double extraExpenses) {
        Node current = head;
        while (current != null) {
            if (current.data.getId() == id) {

                // Save updated equipment into the node
                current.data.setEquipment(equipment);

                // Auto-calculate gear cost from CHECKED items only
                // JS: equipment.filter(e => e.checked === true).reduce((sum, e) => sum + e.cost, 0)
                double gearCost = equipment.stream()
                        .filter(EquipmentItem::isChecked)
                        .mapToDouble(EquipmentItem::getCost)
                        .sum();

                double extra = extraExpenses > 0 ? extraExpenses : 0;

                // Save calculated values back into the node
                current.data.setGearCost(gearCost);
                current.data.setExtraExpenses(extra);
                current.data.setSpent(gearCost + extra); // ← budget tab reads this

                System.out.printf(
                        "✅ Task %d | Gear: %.2f | Extra: %.2f | Total Spent: %.2f%n",
                        id, gearCost, extra, current.data.getSpent()
                );
                return true;
            }
            current = current.next;
        }
        return false;
    }

    public int getSize() { return size; }
}