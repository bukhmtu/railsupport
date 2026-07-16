"""
Ma'lumotlar bazasini boshlang'ich ma'lumotlar bilan to'ldirish.
Ishlatish: python -m app.seed
"""
from .core.database import SessionLocal, engine
from .core import database
from . import models
from .models.user import User
from .models.ticket import Ticket
from .models.log import Log
from .core.security import hash_password
from datetime import datetime


def seed():
    # Jadvallarni yaratish
    database.Base.metadata.create_all(bind=engine)

    db = SessionLocal()

    # Agar allaqachon ma'lumot bo'lsa — o'tkazib yuborish
    if db.query(User).count() > 0:
        print("Ma'lumotlar allaqachon mavjud, seed o'tkazib yuborildi.")
        db.close()
        return

    print("Seed boshlandi...")

    # ─── Foydalanuvchilar ────────────────────────────────────────
    users_data = [
        ("Karimov Bobur",      "admin", "1234", "admin"),
        ("Yusupov Sardor",     "disp1", "1234", "dispatcher"),
        ("Nazarova Malika",    "disp2", "1234", "dispatcher"),
        ("Toshmatov Jasur",    "tech1", "1234", "technician"),
        ("Rakhimov Ulugbek",   "tech2", "1234", "technician"),
        ("Mirzayeva Dilnoza",  "user1", "1234", "employee"),
        ("Abdullayev Firdavs", "user2", "1234", "employee"),
    ]

    users = {}
    for fullname, username, password, role in users_data:
        u = User(fullname=fullname, username=username, password=hash_password(password), role=role)
        db.add(u)
        db.flush()
        users[username] = u
        print(f"  Foydalanuvchi: {username} ({role})")

    db.flush()

    # ─── Ticketlar ───────────────────────────────────────────────
    tickets_data = [
        {
            "fullname": "Mirzayeva Dilnoza", "department": "Moliya",
            "phone": "+998901234567", "problem_type": "Internet",
            "description": "Internet ishlamayapti, sahifalar ochilmayapti",
            "status": "tugallandi", "priority": "yuqori",
            "created_by_u": "user1", "assigned_to_u": "tech1",
            "created_at": datetime(2025, 5, 14, 9, 15),
            "assigned_at": datetime(2025, 5, 14, 9, 20),
            "resolved_at": datetime(2025, 5, 14, 11, 30),
        },
        {
            "fullname": "Abdullayev Firdavs", "department": "Kadrlar",
            "phone": "+998901234568", "problem_type": "Printer",
            "description": "Printer qog'oz tortmayapti",
            "status": "jarayon", "priority": "orta",
            "created_by_u": "user2", "assigned_to_u": "tech1",
            "created_at": datetime(2025, 5, 14, 10, 0),
            "assigned_at": datetime(2025, 5, 14, 10, 10),
        },
        {
            "fullname": "Xasanov Mirzo", "department": "Buxgalteriya",
            "phone": "+998901234569", "problem_type": "Kompyuter",
            "description": "Kompyuter yoqilmayapti, qora ekran chiqyapti",
            "status": "qabul", "priority": "yuqori",
            "created_by_u": "user1", "assigned_to_u": "tech2",
            "created_at": datetime(2025, 5, 15, 8, 30),
            "assigned_at": datetime(2025, 5, 15, 8, 45),
        },
        {
            "fullname": "Mirzayeva Dilnoza", "department": "Moliya",
            "phone": "+998901234567", "problem_type": "Dastur ishlamayapti",
            "description": "1C dasturi ishga tushmayapti, xato beradi",
            "status": "yangi", "priority": "orta",
            "created_by_u": "user1", "assigned_to_u": None,
            "created_at": datetime(2025, 5, 15, 11, 20),
        },
        {
            "fullname": "Tursunov Hamid", "department": "Aloqa markazi",
            "phone": "+998901234570", "problem_type": "Telefon",
            "description": "IP telefon qo'ng'iroq qilmayapti",
            "status": "yangi", "priority": "past",
            "created_by_u": "user2", "assigned_to_u": None,
            "created_at": datetime(2025, 5, 15, 12, 5),
        },
        {
            "fullname": "Ergasheva Nilufar", "department": "IT Bo'lim",
            "phone": "+998901234571", "problem_type": "Kamera",
            "description": "3-qavat kamerasi tasvirni bermayapti",
            "status": "bekor", "priority": "past",
            "created_by_u": "user1", "assigned_to_u": None,
            "created_at": datetime(2025, 5, 13, 14, 0),
        },
        {
            "fullname": "Sobirov Akmal", "department": "Xavfsizlik",
            "phone": "+998901234572", "problem_type": "Server",
            "description": "Server xonasida harorat ko'tarilgan, ogohlantirish beryapti",
            "status": "jarayon", "priority": "yuqori",
            "created_by_u": "user1", "assigned_to_u": "tech1",
            "created_at": datetime(2025, 5, 15, 13, 0),
            "assigned_at": datetime(2025, 5, 15, 13, 5),
        },
    ]

    for td in tickets_data:
        t = Ticket(
            fullname=td["fullname"],
            department=td["department"],
            phone=td["phone"],
            problem_type=td["problem_type"],
            description=td["description"],
            status=td["status"],
            priority=td["priority"],
            created_by=users[td["created_by_u"]].id,
            assigned_to=users[td["assigned_to_u"]].id if td.get("assigned_to_u") else None,
            created_at=td.get("created_at", datetime.utcnow()),
            assigned_at=td.get("assigned_at"),
            resolved_at=td.get("resolved_at"),
        )
        db.add(t)

    db.flush()

    # ─── Loglar ─────────────────────────────────────────────────
    logs_data = [
        ("Murojaat #1 tugallandi",             "tech1"),
        ("Murojaat #2 texnikga biriktirildi",  "disp1"),
        ("Murojaat #7 tugallandi",             "tech2"),
        ("Yangi murojaat #8 qabul qilindi",    "disp2"),
        ("Foydalanuvchi user2 tizimga kirdi",  "admin"),
    ]
    for action, uname in logs_data:
        db.add(Log(action=action, user_id=users[uname].id))

    db.commit()
    print("✅ Seed muvaffaqiyatli yakunlandi!")
    print("\nDemo login ma'lumotlari:")
    print("  admin / 1234  →  Admin")
    print("  disp1 / 1234  →  Dispetcher")
    print("  tech1 / 1234  →  Texnik")
    print("  user1 / 1234  →  Xodim")
    db.close()


if __name__ == "__main__":
    seed()
