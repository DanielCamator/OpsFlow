# 🤖 AI Usage Disclosure

In compliance with the challenge requirements, this document outlines how artificial intelligence was utilized to assist in building OpsFlow.

---

## 1. AI Tools Used

| Tool | Provider |
|---|---|
| **Gemini** | Google |

---

## 2. Areas of Assistance

Gemini was leveraged as a collaborative coding peer for:

- 🗺️ Establishing an optimized step-by-step development roadmap
- 🏗️ Structuring the initial project repository and configuration boilerplate
- 🐛 Troubleshooting syntax errors and optimizing database entity mappings

---

## 3. Example of AI Productivity Boost

During the initial planning phase, Gemini quickly helped scaffold the relational layout and suggested architectural separation patterns for the .NET backend Web API — saving hours of configuration and boilerplate coding time.

---

## 4. Example of AI Error Correction

During development of the domain state machine, Gemini suggested generic validation rules that permitted **invalid state jumps** — such as:

- Moving a ticket directly from `New` → `InProgress` without an assignee
- Allowing `Cancelled` tickets to be re-assigned

Upon review, those lenient suggestions were rejected and the domain methods (`AssignTo`, `StartWork`, `ReportBlocked`, etc.) were manually refactored to enforce explicit state verification guards, throwing `InvalidOperationException` server-side when violated.

---

## 5. Areas of Least Confidence

Due to strict time constraints near the deadline, automated backend unit tests could not be written. While manual testing was thorough, a programmatic suite validating the state machine rules would provide absolute confidence in long-term system stability.

---

<div align="center">
  <sub><a href="./README.md">← Back to README</a></sub>
</div>
