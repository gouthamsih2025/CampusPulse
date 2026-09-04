from sqlalchemy import Column, Integer, String, Text
from sqlalchemy.orm import relationship
from app.core.database import Base


class Category(Base):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, index=True, nullable=False)
    icon = Column(String(50), default="AlertCircle")
    description = Column(Text, nullable=True)
    sla_hours = Column(Integer, default=24, nullable=False)

    # Relationships
    tickets = relationship("Ticket", back_populates="category")
