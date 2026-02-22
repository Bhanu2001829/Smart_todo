package com.shootflow.model;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

public class Task {

    private int    id;
    private String title;
    private String description;
    private String priority;
    private String client;
    private String category;
    private String deadline;
    private double budget;
    private double spent;
    private double extraExpenses;
    private double gearCost;
    private List<EquipmentItem> equipment;
    private boolean completed;
    private String  createdAt;
    private String  createdDate;

    // Default constructor — needed by Spring to parse JSON
    public Task() {
        this.equipment     = new ArrayList<>();
        this.spent         = 0;
        this.extraExpenses = 0;
        this.gearCost      = 0;
        this.completed     = false;
    }

    // Constructor used when creating a new task from the API
    public Task(int id, String title, String description, String priority,
                String client, String category, String deadline,
                double budget, List<EquipmentItem> equipment) {

        this.id          = id;
        this.title       = title;
        this.description = description != null ? description : "";
        this.priority    = priority    != null ? priority    : "normal";
        this.client      = client      != null ? client      : "No Client";
        this.category    = category    != null ? category    : "General";
        this.deadline    = deadline;
        this.budget      = budget;
        this.spent         = 0;
        this.extraExpenses = 0;
        this.gearCost      = 0;
        this.equipment   = equipment != null ? equipment : new ArrayList<>();
        this.completed   = false;
        this.createdAt   = LocalTime.now()
                .format(DateTimeFormatter.ofPattern("HH:mm:ss"));
        this.createdDate = LocalDate.now()
                .format(DateTimeFormatter.ofPattern("dd/MM/yyyy"));
    }

    // ── Getters ──────────────────────────────────────────────────────────────
    public int                 getId()            { return id; }
    public String              getTitle()         { return title; }
    public String              getDescription()   { return description; }
    public String              getPriority()      { return priority; }
    public String              getClient()        { return client; }
    public String              getCategory()      { return category; }
    public String              getDeadline()      { return deadline; }
    public double              getBudget()        { return budget; }
    public double              getSpent()         { return spent; }
    public double              getExtraExpenses() { return extraExpenses; }
    public double              getGearCost()      { return gearCost; }
    public List<EquipmentItem> getEquipment()     { return equipment; }
    public boolean             isCompleted()      { return completed; }
    public String              getCreatedAt()     { return createdAt; }
    public String              getCreatedDate()   { return createdDate; }

    // ── Setters ──────────────────────────────────────────────────────────────
    public void setId(int id)                               { this.id            = id; }
    public void setTitle(String title)                      { this.title         = title; }
    public void setDescription(String desc)                 { this.description   = desc; }
    public void setPriority(String priority)                { this.priority      = priority; }
    public void setClient(String client)                    { this.client        = client; }
    public void setCategory(String category)                { this.category      = category; }
    public void setDeadline(String deadline)                { this.deadline      = deadline; }
    public void setBudget(double budget)                    { this.budget        = budget; }
    public void setSpent(double spent)                      { this.spent         = spent; }
    public void setExtraExpenses(double extraExpenses)      { this.extraExpenses = extraExpenses; }
    public void setGearCost(double gearCost)                { this.gearCost      = gearCost; }
    public void setEquipment(List<EquipmentItem> equipment) { this.equipment     = equipment; }
    public void setCompleted(boolean completed)             { this.completed     = completed; }
    public void setCreatedAt(String createdAt)              { this.createdAt     = createdAt; }
    public void setCreatedDate(String createdDate)          { this.createdDate   = createdDate; }
}