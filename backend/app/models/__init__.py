from datetime import datetime
from decimal import Decimal

from sqlalchemy import Date, DateTime, ForeignKey, Numeric, String, Text, UniqueConstraint, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    mobile_number: Mapped[str | None] = mapped_column(String(50), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    expenses_paid: Mapped[list["Expense"]] = relationship(back_populates="paid_by", cascade="all, delete-orphan")
    expense_shares: Mapped[list["ExpenseShare"]] = relationship(back_populates="user", cascade="all, delete-orphan")
    expense_item_shares: Mapped[list["ExpenseItemShare"]] = relationship(
        back_populates="user", cascade="all, delete-orphan"
    )
    payments_made: Mapped[list["Payment"]] = relationship(
        back_populates="payer", foreign_keys="Payment.payer_id", cascade="all, delete-orphan"
    )
    payments_received: Mapped[list["Payment"]] = relationship(
        back_populates="payee", foreign_keys="Payment.payee_id", cascade="all, delete-orphan"
    )


class Expense(Base):
    __tablename__ = "expenses"

    id: Mapped[int] = mapped_column(primary_key=True)
    paid_by_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False, index=True)
    description: Mapped[str | None] = mapped_column(String(255), nullable=True)
    date: Mapped[datetime] = mapped_column(Date, nullable=False)
    total_amount: Mapped[Decimal] = mapped_column(Numeric(10, 2), default=Decimal("0.00"), nullable=False)
    tax: Mapped[Decimal] = mapped_column(Numeric(10, 2), default=Decimal("0.00"), nullable=False)
    tip: Mapped[Decimal] = mapped_column(Numeric(10, 2), default=Decimal("0.00"), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    paid_by: Mapped[User] = relationship(back_populates="expenses_paid")
    items: Mapped[list["ExpenseItem"]] = relationship(back_populates="expense", cascade="all, delete-orphan")
    shares: Mapped[list["ExpenseShare"]] = relationship(back_populates="expense", cascade="all, delete-orphan")


class ExpenseItem(Base):
    __tablename__ = "expense_items"

    id: Mapped[int] = mapped_column(primary_key=True)
    expense_id: Mapped[int] = mapped_column(ForeignKey("expenses.id"), nullable=False, index=True)
    description: Mapped[str] = mapped_column(String(255), nullable=False)
    amount: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    expense: Mapped[Expense] = relationship(back_populates="items")
    shares: Mapped[list["ExpenseItemShare"]] = relationship(
        back_populates="expense_item", cascade="all, delete-orphan"
    )


class ExpenseItemShare(Base):
    __tablename__ = "expense_item_shares"
    __table_args__ = (UniqueConstraint("expense_item_id", "user_id", name="uq_item_user_share"),)

    id: Mapped[int] = mapped_column(primary_key=True)
    expense_item_id: Mapped[int] = mapped_column(ForeignKey("expense_items.id"), nullable=False, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False, index=True)
    amount: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    expense_item: Mapped[ExpenseItem] = relationship(back_populates="shares")
    user: Mapped[User] = relationship(back_populates="expense_item_shares")


class ExpenseShare(Base):
    __tablename__ = "expense_shares"
    __table_args__ = (UniqueConstraint("expense_id", "user_id", name="uq_expense_user_share"),)

    id: Mapped[int] = mapped_column(primary_key=True)
    expense_id: Mapped[int] = mapped_column(ForeignKey("expenses.id"), nullable=False, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False, index=True)
    amount: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    expense: Mapped[Expense] = relationship(back_populates="shares")
    user: Mapped[User] = relationship(back_populates="expense_shares")


class Payment(Base):
    __tablename__ = "payments"

    id: Mapped[int] = mapped_column(primary_key=True)
    payer_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False, index=True)
    payee_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False, index=True)
    amount: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    date: Mapped[datetime] = mapped_column(Date, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    payer: Mapped[User] = relationship(back_populates="payments_made", foreign_keys=[payer_id])
    payee: Mapped[User] = relationship(back_populates="payments_received", foreign_keys=[payee_id])
