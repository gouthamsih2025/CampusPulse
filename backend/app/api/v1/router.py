from fastapi import APIRouter
from app.api.v1.tickets import router as tickets_router
from app.api.v1.categories import router as categories_router
from app.api.v1.users import router as users_router
from app.api.v1.analytics import router as analytics_router

api_router = APIRouter()
api_router.include_router(tickets_router)
api_router.include_router(categories_router)
api_router.include_router(users_router)
api_router.include_router(analytics_router)
