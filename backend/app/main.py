from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.database import Base, engine
from app.api.v1.router import api_router
from app.models import *  # Ensure all models are registered with Base


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Auto-create tables on startup (works with both SQLite and Postgres)
    Base.metadata.create_all(bind=engine)
    # Seed default categories if none exist
    from app.models.category import Category
    from app.core.database import SessionLocal
    from sqlalchemy.orm import Session
    def _seed_categories():
        db: Session = SessionLocal()
        try:
            if db.query(Category).count() == 0:
                sample = [
                    {"name": "Electrical", "icon": "Zap", "description": "Electrical issues", "sla_hours": 24},
                    {"name": "Plumbing", "icon": "Droplet", "description": "Plumbing issues", "sla_hours": 48},
                    {"name": "HVAC", "icon": "Thermometer", "description": "Heating/cooling issues", "sla_hours": 72},
                ]
                for cat in sample:
                    db.add(Category(**cat))
                db.commit()
        finally:
            db.close()
    _seed_categories()
    yield


app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Intelligent Campus Operations & Issue-Management API",
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# CORS Setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Permits local Next.js frontend dev
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API Router
app.include_router(api_router, prefix=settings.API_V1_STR)


@app.get("/", tags=["Health"])
def health_check():
    return {
        "status": "online",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "docs_url": "/docs",
        "environment": settings.ENVIRONMENT,
    }
