from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.user import User
from app.models.enums import UserRole
from app.schemas.user import UserRead, UserCreate

router = APIRouter(prefix="/users", tags=["Users"])


@router.get("", response_model=List[UserRead])
def list_users(
    role: Optional[UserRole] = Query(None, description="Filter by user role"),
    department: Optional[str] = Query(None, description="Filter by department"),
    db: Session = Depends(get_db),
):
    """List staff, technicians, and administrators"""
    query = db.query(User)
    if role:
        query = query.filter(User.role == role)
    if department:
        query = query.filter(User.department == department)
    return query.order_by(User.full_name.asc()).all()


@router.post("", response_model=UserRead, status_code=status.HTTP_201_CREATED)
def create_user(user_in: UserCreate, db: Session = Depends(get_db)):
    """Create a user / staff member"""
    existing = db.query(User).filter(User.email == user_in.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User with this email already exists"
        )
    user = User(
        email=user_in.email,
        full_name=user_in.full_name,
        role=user_in.role,
        department=user_in.department,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user
