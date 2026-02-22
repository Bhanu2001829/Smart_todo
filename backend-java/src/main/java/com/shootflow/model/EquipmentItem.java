package com.shootflow.model;

public class EquipmentItem {

    private String name;
    private double cost;
    private boolean checked;

    public EquipmentItem() {}

    public EquipmentItem(String name, double cost, boolean checked) {
        this.name    = name;
        this.cost    = cost;
        this.checked = checked;
    }

    public String  getName()             { return name; }
    public double  getCost()             { return cost; }
    public boolean isChecked()           { return checked; }
    public void    setName(String name)         { this.name    = name; }
    public void    setCost(double cost)         { this.cost    = cost; }
    public void    setChecked(boolean checked)  { this.checked = checked; }
}