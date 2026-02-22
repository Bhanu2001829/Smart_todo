

🎯 ShootFlow Pro  
Professional Photographer Workflow Manager  
PDSA Coursework – 24.1F

---

## 📌 Project Overview

**ShootFlow Pro** is a full-stack web application designed to manage the complete workflow of professional photographers.

The system allows users to:

- Manage shoot bookings  
- Track client details  
- Organize equipment checklists with associated costs  
- Monitor shoot budgets and expenses  
- Prioritize urgent tasks  
- Undo deleted tasks  
- View tasks in both forward and reverse order  

The application is powered by a custom implementation of a **Doubly Linked List (DLL)** built from scratch in Java.

> ⚠️ No external database is used. All data is stored within the Doubly Linked List structure.

---

## 🧠 Core Data Structure

### Doubly Linked List (Implemented from Scratch)

Each node stores a complete **Task object** containing:

- ID  
- Title  
- Client Name  
- Category  
- Priority (Normal / Urgent)  
- Deadline  
- Allocated Budget  
- Total Spent Amount  
- Equipment List with LKR costs  
- Completion Status  

### Why Doubly Linked List?

The Doubly Linked List was selected because it provides:

- O(1) insertion at the head (urgent tasks)  
- O(1) insertion at the tail (normal tasks)  
- Bidirectional traversal (forward and reverse viewing)  
- Efficient undo-delete functionality using stored node references  

---

## 🏗️ System Architecture

### Backend

- Java 17  
- Spring Boot 3.2  
- Maven  
- Custom DoublyLinkedList.java implementation  
- RESTful API  

Handles:

- Task insertion (head and tail)  
- Delete and undo-delete operations  
- Search functionality  
- Budget calculations  
- Forward and reverse traversal  

---

### Frontend

- React.js  
- Vite  
- Axios  

Provides:

- Interactive shoot task cards  
- Equipment checklist interface  
- Budget summary dashboard  
- Deadline countdown display  

---

## 🚀 How to Run the Project

### Backend

```bash
cd backend
mvn spring-boot:run
````

Runs on:
`http://localhost:8080`

---

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Runs on:
`http://localhost:5173`

---

## 🎓 Learning Outcomes Demonstrated

* Implementation of a Doubly Linked List from scratch
* Application of O(1) and O(n) algorithmic operations
* REST API development using Spring Boot
* Frontend and backend integration
* Real-world application of data structures and algorithms

---

👨‍💻 Author

**Bhanuka Rajasinghe**
HDSE – 24.1F
Programming Data Structures and Algorithms

---

📌 Conclusion

ShootFlow Pro demonstrates how selecting an appropriate data structure directly influences system performance and capabilities.

The project successfully applies:

* O(1) head and tail insertion
* Bidirectional traversal
* Node-based undo-delete functionality
* Data-driven budget management

This coursework proves that data structures are not only theoretical concepts but powerful tools for solving real-world software engineering problems.
