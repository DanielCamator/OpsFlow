# OpsFlow 🔧

### Work Order Management System

> A lightweight full-stack web application for internal operations teams to manage customer work orders throughout their entire lifecycle — from intake to closure.

---

## 📋 Table of Contents

1. [Project Overview](#1-project-overview)
2. [Technology Choices](#2-technology-choices)
3. [How to Run Locally](#3-how-to-run-the-app-locally)
4. [URLs and Ports](#4-urls-and-ports)
5. [Seeded Test Users & Roles](#5-seeded-test-users-and-roles)
6. [Assumptions & Business Rules](#6-assumptions-and-business-rules)
7. [Known Limitations](#7-known-limitations--testing)

---

## 1. Project Overview

OpsFlow enables operations teams to efficiently **review, prioritize, assign, track, and close** customer requests in one place.

Key capabilities:

- **Secure backend API** with Role-Based Access Control (RBAC)
- **Automated state tracking** with enforced lifecycle transitions
- **Centralized dashboard** for high-level operations monitoring
- **Context-aware UI** that adapts to each user's operational permissions

---

## 2. Technology Choices

| Layer                | Technology                              | Reason                                                          |
| -------------------- | --------------------------------------- | --------------------------------------------------------------- |
| **Backend**          | ASP.NET Core Web API (.NET 8) + EF Core | Robust, typed API with ORM support                              |
| **Frontend**         | React (TypeScript/JavaScript)           | Clear, responsive UI/UX states                                  |
| **Database**         | PostgreSQL                              | Enterprise-grade reliability, relational integrity, open-source |
| **Containerization** | Docker & Docker Compose                 | Identical execution environment for all reviewers               |

---

## 3. How to Run the App Locally

The entire stack is containerized and orchestrated via **Docker Compose**.

**Prerequisites:** Make sure [Docker Desktop](https://www.docker.com/products/docker-desktop/) is installed and running.

```bash
# 1. Open your terminal at the root of the repository
# 2. Build and start all services
docker compose up --build
```

Once containers are up and healthy, open your browser and navigate to the app.

---

## 4. URLs and Ports

| Service         | URL                   |
| --------------- | --------------------- |
| **Frontend UI** | http://localhost:80   |
| **Backend API** | http://localhost:5000 |

---

## 5. Seeded Test Users and Roles

The database is automatically initialized with the following development users to test RBAC:

| Username | Email               | Password     | Role        | Permissions                                            |
| -------- | ------------------- | ------------ | ----------- | ------------------------------------------------------ |
| Admin    | admin@opsflow.com   | `admin123`   | **Admin**   | Full system access, management, and settings           |
| Manager  | manager@opsflow.com | `manager123` | **Manager** | Create, assign, change status/priority, view summaries |
| Agent 1  | agent1@opsflow.com  | `agent123`   | **Agent**   | Update progress, block, or work on assigned tickets    |
| Agent 2  | agent2@opsflow.com  | `agent123`   | **Agent**   | Update progress, block, or work on assigned tickets    |
| Viewer   | viewer@opsflow.com  | `viewer123`  | **Viewer**  | Read-only access — no write actions                    |

---

## 6. Assumptions and Business Rules

### Work Order Lifecycle & Transitions

State transitions are **explicitly managed at the domain level** to protect data integrity. Blind status changes are rejected via server-side logic:

```
New ──► Assigned ──► InProgress ──► Completed
                         │
                         ▼
                       Blocked ──► InProgress
                         │
                         ▼
                      Cancelled
```

| Rule                       | Description                                                                                                          |
| -------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| **Assignment Requirement** | A work order cannot go to `InProgress` directly from `New`. It must first be `Assigned` to a user.                   |
| **Work Progression**       | Work can only start or resume (`InProgress`) if the order is currently `Assigned` or `Blocked`.                      |
| **Blocking Restrictions**  | An order can only be marked `Blocked` if it is currently `InProgress`.                                               |
| **Closure Finality**       | Once `Completed` or `Cancelled`, a work order is **locked** — no further assignment or status regression is allowed. |

### Overdue Tickets

A work order is classified as **Overdue** when:

- Its `DueDate` has passed (`DueDate < DateTime.UtcNow`), **and**
- Its status is neither `Completed` nor `Cancelled`

### Cancellation vs. Deletion

> Hard deletion is **not supported**.

In line with real-world business tracking requirements, removing an order from active work transitions it to a `Cancelled` state. This preserves historical records and full audit trails.

---

## 7. Known Limitations & Testing

### Backend Unit Tests

Due to time constraints during the development window, automated backend unit tests were omitted. Core validation and transition rules were **manually verified** across all roles using Postman and UI testing.

### Google OAuth

Not implemented. The application relies entirely on the local secure credential hashing system and the development-seeded users above.

---

## 🤖 AI Usage

This project was built with AI assistance. See [`AI_USAGE.md`](./AI_USAGE.md) for full disclosure on tools used, areas of assistance, and corrections made.
