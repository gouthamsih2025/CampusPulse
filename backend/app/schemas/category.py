from typing import Optional
from pydantic import BaseModel, ConfigDict


class CategoryBase(BaseModel):
    name: str
    icon: Optional[str] = "AlertCircle"
    description: Optional[str] = None
    sla_hours: Optional[int] = 24


class CategoryCreate(CategoryBase):
    pass


class CategoryRead(CategoryBase):
    id: int

    model_config = ConfigDict(from_attributes=True)
