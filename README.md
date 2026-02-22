🎯 ShootFlow Pro
Professional Photographer Workflow Manager

PDSA Coursework – 24.1F 
📌 Project Overview

ShootFlow Pro is a full-stack web application designed to manage the complete workflow of professional photographers.

It allows users to:

  Manage shoot bookings

  Track client details

  Organize equipment checklists with costs

  Monitor shoot budgets

  Prioritize urgent tasks

  Undo deleted tasks

  View tasks in forward and reverse order

The system is powered by a custom implementation of a Doubly Linked List (DLL) built from scratch in Java.

⚠️ No external database is used — all data is stored inside the DLL structure.

🧠 Core Data Structure
Doubly Linked List (Implemented from Scratch)

Each node contains a full Task object with:

id

title

client name

category

priority (Normal / Urgent)

deadline

budget

spent amount

equipment list with LKR costs

completed status

Why Doubly Linked List?

The DLL was selected because it provides:

✅ O(1) insertion at HEAD (urgent tasks)

✅ O(1) insertion at TAIL (normal tasks)

✅ Bidirectional traversal (forward & reverse)

✅ Efficient undo-delete using stored node reference
🏗️ System Architecture
🔹 Backend

Java 17

Spring Boot 3.2

Maven

Custom DoublyLinkedList.java

RESTful API

Handles:

Task insertion (head/tail)

Delete & undo-delete

Search

Budget calculations

Forward & reverse traversal

🔹 Frontend

React.js

Vite

Axios

Provides:

Interactive shoot cards

Equipment checklist UI

Budget summary dashboard

Deadline countdown display

💡 Novelty of the System

Unlike common tools such as:

Microsoft To Do

Trello

Todoist
ShootFlow Pro:

Implements a real data structure (DLL) as the core storage

Uses O(1) head insertion for urgent tasks

Supports undo-delete in O(1)

Enables reverse view using .prev pointer traversal

Integrates photography-specific budget + equipment tracking

Calculates total spent dynamically from checklist items

This is not a generic task manager — it is a data-structure-driven workflow system.

🚀 How to Run the Project
Backend
cd backend
mvn spring-boot:run

Runs on:

http://localhost:8080
Frontend
cd frontend
npm install
npm run dev

Runs on:

http://localhost:5173
earning Outcomes Demonstrated

Implementation of a Doubly Linked List from scratch

Application of O(1) and O(n) operations

REST API development using Spring Boot

Frontend-backend integration

Real-world application of data structures

👨‍💻 Author

Bhanuka Rajasinghe
HDSE – 24.1F 
Programming Data Structures and Algorithms

📌 Conclusion

ShootFlow Pro demonstrates how choosing the correct data structure directly impacts system capabilities.

The project successfully applies:

O(1) head/tail insertion

Bidirectional traversal

Node-based undo-delete

Data-driven budget management

This coursework proves that data structures are not just theoretical — they are powerful real-world engineering tools.
