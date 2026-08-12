from datetime import date
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator


class UserBase(BaseModel):
    email: EmailStr
    name: str = Field(min_length=1, max_length=255)
    mobile_number: str | None = None


class UserCreate(UserBase):
    password: str = Field(min_length=6, max_length=128)


class UserOut(UserBase):
    model_config = ConfigDict(from_attributes=True)

    id: int


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


class ExpenseItemShareIn(BaseModel):
    user_id: int
    amount: Decimal = Field(gt=0)


class ExpenseItemIn(BaseModel):
    description: str = Field(min_length=1, max_length=255)
    amount: Decimal = Field(gt=0)
    shares: list[ExpenseItemShareIn] = Field(min_length=1)

    @field_validator("shares")
    @classmethod
    def shares_sum_to_amount(cls, shares: list[ExpenseItemShareIn], info):
        amount = info.data.get("amount")
        if amount is None:
            return shares
        total = sum((share.amount for share in shares), Decimal("0"))
        if abs(total - amount) > Decimal("0.02"):
            raise ValueError(f"Sum of shares ({total}) must equal item amount ({amount})")
        return shares


class ExpenseCreate(BaseModel):
    description: str | None = None
    date: date
    tax: Decimal = Field(default=Decimal("0.00"), ge=0)
    tip: Decimal = Field(default=Decimal("0.00"), ge=0)
    items: list[ExpenseItemIn] = Field(min_length=1)


class ExpenseItemShareOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    amount: Decimal
    user: UserOut | None = None


class ExpenseItemOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    description: str
    amount: Decimal
    shares: list[ExpenseItemShareOut] = []


class ExpenseShareOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    amount: Decimal
    user: UserOut | None = None


class ExpenseOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    paid_by_id: int
    description: str | None
    date: date
    total_amount: Decimal
    tax: Decimal
    tip: Decimal
    paid_by: UserOut | None = None
    items: list[ExpenseItemOut] = []
    shares: list[ExpenseShareOut] = []


class PaymentCreate(BaseModel):
    payee_id: int
    amount: Decimal = Field(gt=0)
    notes: str | None = None
    date: date


class PaymentOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    payer_id: int
    payee_id: int
    amount: Decimal
    notes: str | None
    date: date
    payer: UserOut | None = None
    payee: UserOut | None = None


class FriendBalance(BaseModel):
    user: UserOut
    amount: Decimal


class DashboardOut(BaseModel):
    total_balance: Decimal
    total_i_owe: Decimal
    total_owed_to_me: Decimal
    friends_i_owe: list[FriendBalance]
    friends_who_owe_me: list[FriendBalance]
    recent_expenses: list[ExpenseOut]
    friends: list[UserOut]


class PersonDetailOut(BaseModel):
    friend: UserOut
    balance: Decimal
    expenses_i_paid: list[ExpenseOut]
    expenses_friend_paid: list[ExpenseOut]
