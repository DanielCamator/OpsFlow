# OpsFlow — Work Order Management System

A full-stack web application for managing internal work orders. Built with ASP.NET Core, React (TypeScript), PostgreSQL, and Docker.

---

## Technology choices

| Layer            | Technology                   |
| ---------------- | ---------------------------- |
| Backend          | C# / ASP.NET Core 10 Web API |
| ORM              | Entity Framework Core 10     |
| Database         | PostgreSQL 16                |
| Frontend         | React 18 + TypeScript + Vite |
| Auth             | JWT (JSON Web Tokens)        |
| Containerization | Docker + Docker Compose      |
| Testing          | xUnit + Moq                  |

**Why PostgreSQL:** It offers robust relational database support, excellent integration with EF Core, works well in Docker with the Alpine image, and is free to use.

**Why JWT:** Stateless, easy to test, and straightforward to implement role claims without needing a session store.

---
