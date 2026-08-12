from collections import defaultdict
from decimal import Decimal

from sqlalchemy import and_
from sqlalchemy.orm import Session, joinedload

from app.models import Expense, ExpenseItem, ExpenseItemShare, ExpenseShare, Payment, User
from app.schemas import ExpenseCreate, PaymentCreate


def money(value: Decimal | float | int | None) -> Decimal:
    if value is None:
        return Decimal("0.00")
    return Decimal(str(value)).quantize(Decimal("0.01"))


def total_owed_to_me(db: Session, user_id: int) -> Decimal:
    rows = (
        db.query(ExpenseShare.amount)
        .join(Expense, Expense.id == ExpenseShare.expense_id)
        .filter(Expense.paid_by_id == user_id, ExpenseShare.user_id != user_id)
        .all()
    )
    return money(sum((row[0] for row in rows), Decimal("0")))


def total_i_owe(db: Session, user_id: int) -> Decimal:
    rows = (
        db.query(ExpenseShare.amount)
        .join(Expense, Expense.id == ExpenseShare.expense_id)
        .filter(ExpenseShare.user_id == user_id, Expense.paid_by_id != user_id)
        .all()
    )
    return money(sum((row[0] for row in rows), Decimal("0")))


def total_balance(db: Session, user_id: int) -> Decimal:
    return money(total_owed_to_me(db, user_id) - total_i_owe(db, user_id))


def balance_with(db: Session, user_id: int, friend_id: int) -> Decimal:
    friend_owes_me = (
        db.query(ExpenseShare.amount)
        .join(Expense, Expense.id == ExpenseShare.expense_id)
        .filter(Expense.paid_by_id == user_id, ExpenseShare.user_id == friend_id)
        .all()
    )
    i_owe_friend = (
        db.query(ExpenseShare.amount)
        .join(Expense, Expense.id == ExpenseShare.expense_id)
        .filter(Expense.paid_by_id == friend_id, ExpenseShare.user_id == user_id)
        .all()
    )
    owed = sum((row[0] for row in friend_owes_me), Decimal("0"))
    owing = sum((row[0] for row in i_owe_friend), Decimal("0"))
    return money(owed - owing)


def friends_i_owe(db: Session, user_id: int) -> dict[int, Decimal]:
    rows = (
        db.query(Expense.paid_by_id, ExpenseShare.amount)
        .join(Expense, Expense.id == ExpenseShare.expense_id)
        .filter(ExpenseShare.user_id == user_id, Expense.paid_by_id != user_id)
        .all()
    )
    totals: dict[int, Decimal] = defaultdict(lambda: Decimal("0"))
    for payer_id, amount in rows:
        totals[payer_id] += amount
    return {uid: money(amount) for uid, amount in totals.items() if amount > 0}


def friends_who_owe_me(db: Session, user_id: int) -> dict[int, Decimal]:
    rows = (
        db.query(ExpenseShare.user_id, ExpenseShare.amount)
        .join(Expense, Expense.id == ExpenseShare.expense_id)
        .filter(Expense.paid_by_id == user_id, ExpenseShare.user_id != user_id)
        .all()
    )
    totals: dict[int, Decimal] = defaultdict(lambda: Decimal("0"))
    for debtor_id, amount in rows:
        totals[debtor_id] += amount
    return {uid: money(amount) for uid, amount in totals.items() if amount > 0}


def calculate_expense_shares(db: Session, expense: Expense) -> None:
    db.query(ExpenseShare).filter(ExpenseShare.expense_id == expense.id).delete()
    db.flush()

    item_totals: dict[int, Decimal] = defaultdict(lambda: Decimal("0"))
    for item in expense.items:
        for share in item.shares:
            item_totals[share.user_id] += share.amount

    if not item_totals:
        return

    participants = len(item_totals)
    tax_per_user = money((expense.tax or Decimal("0")) / participants)
    tip_per_user = money((expense.tip or Decimal("0")) / participants)

    for user_id, item_total in item_totals.items():
        db.add(
            ExpenseShare(
                expense_id=expense.id,
                user_id=user_id,
                amount=money(item_total + tax_per_user + tip_per_user),
            )
        )
    db.flush()


def create_expense(db: Session, paid_by: User, payload: ExpenseCreate) -> Expense:
    items_total = money(sum((item.amount for item in payload.items), Decimal("0")))
    expense = Expense(
        paid_by_id=paid_by.id,
        description=payload.description,
        date=payload.date,
        tax=money(payload.tax),
        tip=money(payload.tip),
        total_amount=money(items_total + payload.tax + payload.tip),
    )
    db.add(expense)
    db.flush()

    for item_data in payload.items:
        item = ExpenseItem(
            expense_id=expense.id,
            description=item_data.description,
            amount=money(item_data.amount),
        )
        db.add(item)
        db.flush()
        for share_data in item_data.shares:
            db.add(
                ExpenseItemShare(
                    expense_item_id=item.id,
                    user_id=share_data.user_id,
                    amount=money(share_data.amount),
                )
            )

    db.flush()
    db.refresh(expense)
    expense = (
        db.query(Expense)
        .options(
            joinedload(Expense.items).joinedload(ExpenseItem.shares),
            joinedload(Expense.shares),
            joinedload(Expense.paid_by),
        )
        .filter(Expense.id == expense.id)
        .one()
    )
    calculate_expense_shares(db, expense)
    db.commit()
    return (
        db.query(Expense)
        .options(
            joinedload(Expense.items).joinedload(ExpenseItem.shares).joinedload(ExpenseItemShare.user),
            joinedload(Expense.shares).joinedload(ExpenseShare.user),
            joinedload(Expense.paid_by),
        )
        .filter(Expense.id == expense.id)
        .one()
    )


def apply_payment(db: Session, payer: User, payload: PaymentCreate) -> Payment:
    if payload.payee_id == payer.id:
        raise ValueError("Payer and payee must be different")

    payee = db.query(User).filter(User.id == payload.payee_id).first()
    if not payee:
        raise ValueError("Payee not found")

    payment = Payment(
        payer_id=payer.id,
        payee_id=payee.id,
        amount=money(payload.amount),
        notes=payload.notes,
        date=payload.date,
    )
    db.add(payment)
    db.flush()

    settlement = Expense(
        paid_by_id=payer.id,
        description=f"Payment to {payee.name}",
        date=payload.date,
        total_amount=money(payload.amount),
        tax=Decimal("0.00"),
        tip=Decimal("0.00"),
    )
    db.add(settlement)
    db.flush()

    db.add(ExpenseShare(expense_id=settlement.id, user_id=payer.id, amount=money(-payload.amount)))
    db.add(ExpenseShare(expense_id=settlement.id, user_id=payee.id, amount=money(payload.amount)))
    db.commit()

    return (
        db.query(Payment)
        .options(joinedload(Payment.payer), joinedload(Payment.payee))
        .filter(Payment.id == payment.id)
        .one()
    )


def expenses_between(db: Session, payer_id: int, participant_id: int) -> list[Expense]:
    return (
        db.query(Expense)
        .join(ExpenseShare, ExpenseShare.expense_id == Expense.id)
        .options(
            joinedload(Expense.paid_by),
            joinedload(Expense.shares).joinedload(ExpenseShare.user),
            joinedload(Expense.items).joinedload(ExpenseItem.shares).joinedload(ExpenseItemShare.user),
        )
        .filter(and_(Expense.paid_by_id == payer_id, ExpenseShare.user_id == participant_id))
        .order_by(Expense.date.desc(), Expense.id.desc())
        .distinct()
        .all()
    )
