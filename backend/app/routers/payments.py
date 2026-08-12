from fastapi import APIRouter, HTTPException, status

from app.auth.security import CurrentUser, DbSession
from app.schemas import PaymentCreate, PaymentOut
from app.services import balances

router = APIRouter(prefix="/api/payments", tags=["payments"])


@router.post("", response_model=PaymentOut, status_code=status.HTTP_201_CREATED)
def create_payment(payload: PaymentCreate, current_user: CurrentUser, db: DbSession) -> PaymentOut:
    try:
        payment = balances.apply_payment(db, current_user, payload)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    return PaymentOut.model_validate(payment)
