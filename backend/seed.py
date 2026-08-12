"""Seed demo users for local development."""

from app.auth.security import hash_password
from app.database import Base, SessionLocal, engine
from app.models import User


def seed() -> None:
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        demos = [
            ("alice@example.com", "Alice Johnson", "password123"),
            ("bob@example.com", "Bob Smith", "password123"),
            ("cara@example.com", "Cara Lee", "password123"),
        ]
        for email, name, password in demos:
            if not db.query(User).filter(User.email == email).first():
                db.add(
                    User(
                        email=email,
                        name=name,
                        hashed_password=hash_password(password),
                        mobile_number=None,
                    )
                )
        db.commit()
        print("Seeded demo users: alice@example.com / bob@example.com / cara@example.com (password123)")
    finally:
        db.close()


if __name__ == "__main__":
    seed()
