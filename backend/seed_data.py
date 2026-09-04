"""
CampusPulse Database Seeder
Populates categories, technicians/users, and realistic campus tickets with audit trails.
"""
from datetime import datetime, timedelta
from app.core.database import SessionLocal, Base, engine
from app.models import Category, User, Ticket, TicketComment, TicketAuditLog, UserRole, TicketSeverity, TicketStatus
from app.services.ai_triage import AITriageService

# Ensure tables exist
Base.metadata.create_all(bind=engine)


def seed():
    db = SessionLocal()
    try:
        print("[+] Seeding CampusPulse Database...")

        # 1. Seed Categories
        categories_data = [
            {"name": "Air Conditioning (HVAC)", "icon": "Wind", "description": "AC units, chillers, thermostats, cooling issues", "sla_hours": 12},
            {"name": "Electrical", "icon": "Zap", "description": "Lights, fans, switchboards, power sockets, wiring", "sla_hours": 8},
            {"name": "Plumbing", "icon": "Droplets", "description": "Water leaks, washrooms, taps, drainage, coolers", "sla_hours": 6},
            {"name": "IT & Audio-Visual", "icon": "Monitor", "description": "Projectors, Wi-Fi access points, podium mics, lab PCs", "sla_hours": 4},
            {"name": "Cleanliness & Sanitation", "icon": "Sparkles", "description": "Classroom cleaning, washroom hygiene, garbage bins", "sla_hours": 4},
            {"name": "Furniture & Carpentry", "icon": "Hammer", "description": "Desks, chairs, doors, window latches, whiteboards", "sla_hours": 24},
            {"name": "Lost & Found", "icon": "HelpCircle", "description": "Valuables, ID cards, keys, electronic accessories", "sla_hours": 48},
            {"name": "Infrastructure", "icon": "Building", "description": "Civil repairs, tiles, stairs, railings, elevators", "sla_hours": 36},
        ]

        cat_map = {}
        for c in categories_data:
            existing = db.query(Category).filter(Category.name == c["name"]).first()
            if not existing:
                cat = Category(**c)
                db.add(cat)
                db.commit()
                db.refresh(cat)
                cat_map[c["name"]] = cat.id
            else:
                cat_map[c["name"]] = existing.id

        # 2. Seed Technicians & Admin Users
        users_data = [
            {"email": "admin@campus.edu", "full_name": "Operations Admin", "role": UserRole.ADMIN, "department": "Campus Operations"},
            {"email": "rajesh.elec@campus.edu", "full_name": "Rajesh Kumar (HVAC & Electrical)", "role": UserRole.TECHNICIAN, "department": "Electrical Maintenance"},
            {"email": "suresh.plumb@campus.edu", "full_name": "Suresh Patel (Plumbing & Civil)", "role": UserRole.TECHNICIAN, "department": "Facilities & Plumbing"},
            {"email": "anita.it@campus.edu", "full_name": "Anita Sharma (IT & AV Support)", "role": UserRole.TECHNICIAN, "department": "IT Infrastructure"},
            {"email": "sunita.housekeeping@campus.edu", "full_name": "Sunita Devi (Sanitation Lead)", "role": UserRole.STAFF, "department": "Housekeeping"},
        ]

        user_map = {}
        for u in users_data:
            existing = db.query(User).filter(User.email == u["email"]).first()
            if not existing:
                user = User(**u)
                db.add(user)
                db.commit()
                db.refresh(user)
                user_map[u["full_name"]] = user.id
            else:
                user_map[u["full_name"]] = existing.id

        # 3. Seed Realistic Sample Tickets
        if db.query(Ticket).count() == 0:
            sample_tickets = [
                {
                    "code": "CP-2026-100201",
                    "title": "AC water leakage causing a safety hazard",
                    "description": "The AC in AB1-305 has been leaking water since morning and students are almost slipping.",
                    "category_name": "Air Conditioning (HVAC)",
                    "building": "Academic Block 1",
                    "room": "AB1-305",
                    "severity": TicketSeverity.HIGH,
                    "status": TicketStatus.OPEN,
                    "reporter_name": "Aarav Mehta",
                    "reporter_email": "aarav.m@student.campus.edu",
                    "assigned_to": user_map.get("Rajesh Kumar (HVAC & Electrical)"),
                    "days_ago": 0.2,
                },
                {
                    "code": "CP-2026-100202",
                    "title": "Ceiling fan sparking and producing loud humming sound",
                    "description": "In Room 204 of Academic Block 2, the center ceiling fan is sparking intermittently when turned to speed 5.",
                    "category_name": "Electrical",
                    "building": "Academic Block 2",
                    "room": "AB2-204",
                    "severity": TicketSeverity.CRITICAL,
                    "status": TicketStatus.IN_PROGRESS,
                    "reporter_name": "Prof. S. Ranganathan",
                    "reporter_email": "s.ranganathan@faculty.campus.edu",
                    "assigned_to": user_map.get("Rajesh Kumar (HVAC & Electrical)"),
                    "days_ago": 1.5,
                },
                {
                    "code": "CP-2026-100203",
                    "title": "Main Projector HDMI input flickering during lectures",
                    "description": "Projector in Seminar Hall LH-1 loses signal every 5 minutes when connecting laptop via HDMI cable.",
                    "category_name": "IT & Audio-Visual",
                    "building": "Academic Block 1",
                    "room": "LH-1",
                    "severity": TicketSeverity.MEDIUM,
                    "status": TicketStatus.IN_PROGRESS,
                    "reporter_name": "Neha Gupta",
                    "reporter_email": "neha.g@student.campus.edu",
                    "assigned_to": user_map.get("Anita Sharma (IT & AV Support)"),
                    "days_ago": 2.0,
                },
                {
                    "code": "CP-2026-100204",
                    "title": "Water pressure low on 3rd floor washroom",
                    "description": "Hostel Block B 3rd floor washroom taps have virtually zero water pressure since yesterday evening.",
                    "category_name": "Plumbing",
                    "building": "Hostel Block B",
                    "room": "3rd Floor Washroom",
                    "severity": TicketSeverity.HIGH,
                    "status": TicketStatus.RESOLVED,
                    "reporter_name": "Rohan Verma",
                    "reporter_email": "rohan.v@student.campus.edu",
                    "assigned_to": user_map.get("Suresh Patel (Plumbing & Civil)"),
                    "days_ago": 3.2,
                    "resolved_ago": 0.5,
                },
                {
                    "code": "CP-2026-100205",
                    "title": "Lost black Dell laptop charger in Central Library",
                    "description": "Left a 65W Dell USB-C charger on table #14 in the 1st floor reading zone around 4 PM.",
                    "category_name": "Lost & Found",
                    "building": "Central Library",
                    "room": "1st Floor Table 14",
                    "severity": TicketSeverity.LOW,
                    "status": TicketStatus.OPEN,
                    "reporter_name": "Kavya Nair",
                    "reporter_email": "kavya.n@student.campus.edu",
                    "assigned_to": None,
                    "days_ago": 0.5,
                },
                {
                    "code": "CP-2026-100206",
                    "title": "Broken chair armrest in Lab 3",
                    "description": "Workstation 18 in Computer Lab 3 has a loose armrest that came off completely.",
                    "category_name": "Furniture & Carpentry",
                    "building": "Academic Block 3",
                    "room": "Lab 3 (WS-18)",
                    "severity": TicketSeverity.LOW,
                    "status": TicketStatus.RESOLVED,
                    "reporter_name": "Tanmay Joshi",
                    "reporter_email": "tanmay.j@student.campus.edu",
                    "assigned_to": user_map.get("Suresh Patel (Plumbing & Civil)"),
                    "days_ago": 5.0,
                    "resolved_ago": 1.2,
                },
            ]

            now = datetime.utcnow()
            for t_data in sample_tickets:
                created_dt = now - timedelta(days=t_data["days_ago"])
                resolved_dt = now - timedelta(days=t_data["resolved_ago"]) if "resolved_ago" in t_data else None

                triage = AITriageService.triage_text(t_data["description"])
                t = Ticket(
                    ticket_code=t_data["code"],
                    title=t_data["title"],
                    description=t_data["description"],
                    category_id=cat_map[t_data["category_name"]],
                    building=t_data["building"],
                    room=t_data["room"],
                    severity=t_data["severity"],
                    status=t_data["status"],
                    reporter_name=t_data["reporter_name"],
                    reporter_email=t_data["reporter_email"],
                    assigned_to=t_data["assigned_to"],
                    ai_summary=triage.summary,
                    ai_confidence=triage.confidence,
                    is_ai_triaged=True,
                    created_at=created_dt,
                    updated_at=resolved_dt or created_dt,
                    resolved_at=resolved_dt,
                )
                db.add(t)
                db.commit()
                db.refresh(t)

                # Seed comments
                db.add(TicketComment(
                    ticket_id=t.id,
                    author_name=t.reporter_name,
                    author_role="Student",
                    comment=t.description,
                    created_at=created_dt,
                ))

                if t.status in (TicketStatus.IN_PROGRESS, TicketStatus.RESOLVED):
                    db.add(TicketComment(
                        ticket_id=t.id,
                        author_name="Operations Desk",
                        author_role="Admin",
                        comment="Technician has been dispatched to assess the site.",
                        created_at=created_dt + timedelta(hours=1),
                    ))

                if t.status == TicketStatus.RESOLVED:
                    db.add(TicketComment(
                        ticket_id=t.id,
                        author_name="Suresh Patel",
                        author_role="Technician",
                        comment="Issue resolved. Replacement valve installed and pressure tested.",
                        created_at=resolved_dt,
                    ))

                # Audit logs
                db.add(TicketAuditLog(
                    ticket_id=t.id,
                    actor_name=t.reporter_name,
                    action="TICKET_CREATED",
                    old_value=None,
                    new_value=f"Created with status {TicketStatus.OPEN.value}",
                    created_at=created_dt,
                ))
                if t.status == TicketStatus.RESOLVED:
                    db.add(TicketAuditLog(
                        ticket_id=t.id,
                        actor_name="Operations Desk",
                        action="STATUS_CHANGED",
                        old_value="IN_PROGRESS",
                        new_value="RESOLVED",
                        created_at=resolved_dt,
                    ))

            db.commit()
            print("[+] Successfully seeded 6 sample tickets with comments and audit logs!")
        else:
            print("[i] Tickets already exist, skipping ticket seeding.")

    finally:
        db.close()


if __name__ == "__main__":
    seed()
