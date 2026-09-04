# CampusPulse — System Architecture & Data Model

## 1. System Architecture Diagram

```
+-------------------------------------------------------------+
|                      Client Layer                           |
|  - Desktop / Mobile Browsers                                |
|  - Next.js 14 App Router UI (SSR & Client Components)       |
+------------------------------+------------------------------+
                               | HTTPS / JSON
                               v
+-------------------------------------------------------------+
|                    FastAPI Backend Layer                    |
|  - CORS & Request Validation (Pydantic v2)                  |
|  - Modular API Routers (/api/v1/tickets, /analytics, etc.)  |
|  - AI Triage Service (Gemini / OpenAI / Heuristic Fallback) |
|  - Business Services & State Transitions                    |
+------------------------------+------------------------------+
                               | SQLAlchemy 2.0 ORM
                               v
+-------------------------------------------------------------+
|                    Persistence Layer                        |
|  - PostgreSQL (Production: Neon / Railway / Supabase)       |
|  - SQLite (Local Development out-of-the-box fallback)       |
+-------------------------------------------------------------+
```

## 2. Relational Database Schema (ERD)

### Entities:
1. **users**:
   - `id` (UUID / Integer, Primary Key)
   - `email` (String, Unique, Indexed)
   - `full_name` (String)
   - `role` (Enum: `STUDENT`, `STAFF`, `ADMIN`, `TECHNICIAN`)
   - `department` (String, Nullable)
   - `created_at` (Timestamp)

2. **categories**:
   - `id` (Integer, Primary Key)
   - `name` (String, Unique - e.g., "HVAC", "Electrical", "Plumbing", "IT", "Cleanliness", "Lost & Found")
   - `icon` (String)
   - `description` (String)
   - `sla_hours` (Integer - Target resolution turnaround time in hours)

3. **tickets**:
   - `id` (Integer, Primary Key)
   - `ticket_code` (String, Unique Indexed - e.g., "CP-2026-001042")
   - `title` (String)
   - `description` (Text)
   - `category_id` (ForeignKey -> categories.id)
   - `building` (String - e.g., "Academic Block 1", "Hostel B", "Library")
   - `room` (String - e.g., "AB1-305", "Lab 2")
   - `severity` (Enum: `LOW`, `MEDIUM`, `HIGH`, `CRITICAL`)
   - `status` (Enum: `OPEN`, `IN_PROGRESS`, `RESOLVED`, `CLOSED`, `REJECTED`)
   - `reporter_name` (String)
   - `reporter_email` (String)
   - `assigned_to` (ForeignKey -> users.id, Nullable)
   - `ai_summary` (Text, Nullable)
   - `ai_confidence` (Float, Nullable)
   - `created_at` (Timestamp)
   - `updated_at` (Timestamp)
   - `resolved_at` (Timestamp, Nullable)

4. **ticket_comments**:
   - `id` (Integer, Primary Key)
   - `ticket_id` (ForeignKey -> tickets.id)
   - `author_name` (String)
   - `author_role` (String)
   - `comment` (Text)
   - `is_internal` (Boolean)
   - `created_at` (Timestamp)

5. **ticket_audit_logs**:
   - `id` (Integer, Primary Key)
   - `ticket_id` (ForeignKey -> tickets.id)
   - `actor_name` (String)
   - `action` (String - e.g., "STATUS_CHANGED", "ASSIGNED")
   - `old_value` (String, Nullable)
   - `new_value` (String, Nullable)
   - `created_at` (Timestamp)
