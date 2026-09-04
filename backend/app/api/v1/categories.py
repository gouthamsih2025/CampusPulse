from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.category import Category
from app.schemas.category import CategoryRead, CategoryCreate

router = APIRouter(prefix="/categories", tags=["Categories"])


@router.get("", response_model=List[CategoryRead])
def list_categories(db: Session = Depends(get_db)):
    """List all campus operational categories"""
    return db.query(Category).order_by(Category.name.asc()).all()


@router.post("", response_model=CategoryRead, status_code=status.HTTP_201_CREATED)
def create_category(cat_in: CategoryCreate, db: Session = Depends(get_db)):
    """Create a new category"""
    existing = db.query(Category).filter(Category.name == cat_in.name).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Category already exists"
        )
    cat = Category(
        name=cat_in.name,
        icon=cat_in.icon or "AlertCircle",
        description=cat_in.description,
        sla_hours=cat_in.sla_hours or 24,
    )
    db.add(cat)
    db.commit()
    db.refresh(cat)
    return cat
