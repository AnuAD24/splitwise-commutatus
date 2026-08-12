from fastapi import APIRouter, HTTPException, status
from sqlalchemy.orm import Session, joinedload

from app.auth.security import CurrentUser, DbSession
from app.models import Expense, ExpenseItem, ExpenseItemShare, ExpenseShare, User
from app.schemas import (
    DashboardOut,
    ExpenseCreate,
    ExpenseOut,
    FriendBalance,
    PersonDetailOut,
    UserOut,
)
from app.services import balances

router = APIRouter(prefix="/api", tags=["app"])


def _load_expense(db: Session, expense_id: int) -> Expense | None:
    return (
        db.query(Expense)
        .options(
            joinedload(Expense.paid_by),
            joinedload(Expense.shares).joinedload(ExpenseShare.user),
            joinedload(Expense.items).joinedload(ExpenseItem.shares).joinedload(ExpenseItemShare.user),
        )
        .filter(Expense.id == expense_id)
        .first()
    )


@router.get("/users", response_model=list[UserOut])
def list_users(current_user: CurrentUser, db: DbSession) -> list[User]:
    return db.query(User).filter(User.id != current_user.id).order_by(User.name.asc()).all()


@router.get("/dashboard", response_model=DashboardOut)
def dashboard(current_user: CurrentUser, db: DbSession) -> DashboardOut:
    friends = db.query(User).filter(User.id != current_user.id).order_by(User.name.asc()).all()
    friend_map = {user.id: user for user in friends}

    i_owe = balances.friends_i_owe(db, current_user.id)
    owe_me = balances.friends_who_owe_me(db, current_user.id)

    recent = (
        db.query(Expense)
        .options(
            joinedload(Expense.paid_by),
            joinedload(Expense.shares).joinedload(ExpenseShare.user),
            joinedload(Expense.items).joinedload(ExpenseItem.shares).joinedload(ExpenseItemShare.user),
        )
        .filter(Expense.paid_by_id == current_user.id)
        .order_by(Expense.date.desc(), Expense.id.desc())
        .limit(10)
        .all()
    )

    return DashboardOut(
        total_balance=balances.total_balance(db, current_user.id),
        total_i_owe=balances.total_i_owe(db, current_user.id),
        total_owed_to_me=balances.total_owed_to_me(db, current_user.id),
        friends_i_owe=[
            FriendBalance(user=UserOut.model_validate(friend_map[uid]), amount=amount)
            for uid, amount in i_owe.items()
            if uid in friend_map
        ],
        friends_who_owe_me=[
            FriendBalance(user=UserOut.model_validate(friend_map[uid]), amount=amount)
            for uid, amount in owe_me.items()
            if uid in friend_map
        ],
        recent_expenses=[ExpenseOut.model_validate(expense) for expense in recent],
        friends=[UserOut.model_validate(user) for user in friends],
    )


@router.get("/people/{friend_id}", response_model=PersonDetailOut)
def person_detail(friend_id: int, current_user: CurrentUser, db: DbSession) -> PersonDetailOut:
    friend = db.query(User).filter(User.id == friend_id).first()
    if not friend or friend.id == current_user.id:
        raise HTTPException(status_code=404, detail="Friend not found")

    return PersonDetailOut(
        friend=UserOut.model_validate(friend),
        balance=balances.balance_with(db, current_user.id, friend.id),
        expenses_i_paid=[
            ExpenseOut.model_validate(expense)
            for expense in balances.expenses_between(db, current_user.id, friend.id)
        ],
        expenses_friend_paid=[
            ExpenseOut.model_validate(expense)
            for expense in balances.expenses_between(db, friend.id, current_user.id)
        ],
    )


@router.get("/expenses", response_model=list[ExpenseOut])
def list_expenses(current_user: CurrentUser, db: DbSession) -> list[ExpenseOut]:
    expenses = (
        db.query(Expense)
        .options(
            joinedload(Expense.paid_by),
            joinedload(Expense.shares).joinedload(ExpenseShare.user),
            joinedload(Expense.items).joinedload(ExpenseItem.shares).joinedload(ExpenseItemShare.user),
        )
        .filter(Expense.paid_by_id == current_user.id)
        .order_by(Expense.date.desc(), Expense.id.desc())
        .all()
    )
    return [ExpenseOut.model_validate(expense) for expense in expenses]


@router.get("/expenses/{expense_id}", response_model=ExpenseOut)
def get_expense(expense_id: int, current_user: CurrentUser, db: DbSession) -> ExpenseOut:
    expense = _load_expense(db, expense_id)
    if not expense:
        raise HTTPException(status_code=404, detail="Expense not found")

    participant_ids = {share.user_id for share in expense.shares} | {expense.paid_by_id}
    if current_user.id not in participant_ids:
        raise HTTPException(status_code=404, detail="Expense not found")
    return ExpenseOut.model_validate(expense)


@router.post("/expenses", response_model=ExpenseOut, status_code=status.HTTP_201_CREATED)
def create_expense(payload: ExpenseCreate, current_user: CurrentUser, db: DbSession) -> ExpenseOut:
    user_ids = {share.user_id for item in payload.items for share in item.shares}
    existing = {user.id for user in db.query(User).filter(User.id.in_(user_ids)).all()}
    if user_ids - existing:
        raise HTTPException(status_code=400, detail="One or more share users do not exist")
    if current_user.id not in user_ids:
        raise HTTPException(status_code=400, detail="You must be included in at least one item share")

    expense = balances.create_expense(db, current_user, payload)
    return ExpenseOut.model_validate(expense)


@router.delete("/expenses/{expense_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_expense(expense_id: int, current_user: CurrentUser, db: DbSession) -> None:
    expense = db.query(Expense).filter(Expense.id == expense_id, Expense.paid_by_id == current_user.id).first()
    if not expense:
        raise HTTPException(status_code=404, detail="Expense not found")
    db.delete(expense)
    db.commit()
