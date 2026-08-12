from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.database import Base, engine
from app.routers import auth, expenses, payments


@asynccontextmanager
async def lifespan(_: FastAPI):
    Base.metadata.create_all(bind=engine)
    yield


settings = get_settings()

app = FastAPI(
    title="Splitwise API",
    description="Expense splitting API built with FastAPI, React, and PostgreSQL",
    version="1.0.0",
    lifespan=lifespan,
)

cors_origins = settings.cors_origin_list
app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins if cors_origins != ["*"] else ["*"],
    allow_credentials=cors_origins != ["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(expenses.router)
app.include_router(payments.router)


@app.get("/api/health")
def health() -> dict[str, str]:
    return {"status": "ok"}
