package com.shootflow.controller;

import com.shootflow.ds.DoublyLinkedList;
import com.shootflow.model.EquipmentItem;
import com.shootflow.model.Task;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@CrossOrigin(origins = "*")
public class TaskController {

    // Single shared DLL — same as: const list = new DoublyLinkedList()
    private final DoublyLinkedList list = new DoublyLinkedList();
    private int idCounter = 1;

    // GET /tasks — normal order
    @GetMapping("/tasks")
    public Map<String, Object> getTasks() {
        Map<String, Object> res = new HashMap<>();
        res.put("tasks", list.toList());
        res.put("size",  list.getSize());
        return res;
    }

    // GET /tasks/reverse — reverse order [Feature 3]
    @GetMapping("/tasks/reverse")
    public Map<String, Object> getTasksReverse() {
        Map<String, Object> res = new HashMap<>();
        res.put("tasks", list.toReverseList());
        res.put("size",  list.getSize());
        return res;
    }

    // GET /tasks/search?keyword=xxx
    @GetMapping("/tasks/search")
    public List<Task> searchTasks(
            @RequestParam(defaultValue = "") String keyword) {
        return list.search(keyword);
    }

    // POST /tasks — add new task
    @PostMapping("/tasks")
    public Map<String, Object> addTask(@RequestBody Map<String, Object> body) {

        String title       = (String) body.getOrDefault("title", "");
        String description = (String) body.getOrDefault("description", "");
        String priority    = (String) body.getOrDefault("priority", "normal");
        String client      = (String) body.getOrDefault("client", "No Client");
        String category    = (String) body.getOrDefault("category", "General");
        String deadline    = (String) body.getOrDefault("deadline", null);
        double budget      = body.get("budget") != null
                ? Double.parseDouble(body.get("budget").toString()) : 0;

        // Parse equipment from JSON → List<EquipmentItem>
        List<EquipmentItem> equipment = parseEquipment(body.get("equipment"));

        Task task = new Task(idCounter++, title, description, priority,
                client, category, deadline, budget, equipment);

        // Feature 1 — urgent → HEAD in O(1), normal → TAIL in O(1)
        if ("urgent".equals(priority)) list.prepend(task);
        else                           list.append(task);

        Map<String, Object> res = new HashMap<>();
        res.put("success", true);
        res.put("tasks",   list.toList());
        return res;
    }

    // DELETE /tasks/:id
    @DeleteMapping("/tasks/{id}")
    public Map<String, Object> deleteTask(@PathVariable int id) {
        boolean success = list.delete(id);
        Map<String, Object> res = new HashMap<>();
        res.put("success", success);
        res.put("tasks",   list.toList());
        return res;
    }

    // POST /tasks/undo — restore last deleted [Feature 2]
    @PostMapping("/tasks/undo")
    public Map<String, Object> undoDelete() {
        boolean success = list.undoDelete();
        Map<String, Object> res = new HashMap<>();
        res.put("success", success);
        res.put("tasks",   list.toList());
        return res;
    }

    // PATCH /tasks/:id/complete
    @PatchMapping("/tasks/{id}/complete")
    public Map<String, Object> completeTask(@PathVariable int id) {
        boolean success = list.complete(id);
        Map<String, Object> res = new HashMap<>();
        res.put("success", success);
        res.put("tasks",   list.toList());
        return res;
    }

    // PATCH /tasks/:id/equipment — auto-calculates spent [Feature 6 & 7]
    @PatchMapping("/tasks/{id}/equipment")
    public Map<String, Object> updateEquipment(
            @PathVariable int id,
            @RequestBody Map<String, Object> body) {

        List<EquipmentItem> equipment = parseEquipment(body.get("equipment"));
        double extraExpenses = body.get("extraExpenses") != null
                ? Double.parseDouble(body.get("extraExpenses").toString()) : 0;

        System.out.println("Equipment update → task " + id
                + " | items: " + equipment.size()
                + " | extra: " + extraExpenses);

        boolean success = list.updateEquipment(id, equipment, extraExpenses);

        // Log the updated spent value
        list.toList().stream()
                .filter(t -> t.getId() == id)
                .findFirst()
                .ifPresent(t -> System.out.println(
                        "Spent after update: " + t.getSpent()));

        Map<String, Object> res = new HashMap<>();
        res.put("success", success);
        res.put("tasks",   list.toList());
        return res;
    }

    // ── Helper — parse raw JSON list into List<EquipmentItem> ────────────────
    private List<EquipmentItem> parseEquipment(Object raw) {
        List<EquipmentItem> result = new ArrayList<>();
        if (raw instanceof List<?> rawList) {
            for (Object item : rawList) {
                if (item instanceof Map) {
                    Map map = (Map) item;
                    String  name    = map.get("name")    != null ? map.get("name").toString()    : "";
                    double  cost    = map.get("cost")    != null ? Double.parseDouble(map.get("cost").toString()) : 0;
                    boolean checked = map.get("checked") != null && Boolean.parseBoolean(map.get("checked").toString());
                    result.add(new EquipmentItem(name, cost, checked));
                }
            }
        }
        return result;
    }
}