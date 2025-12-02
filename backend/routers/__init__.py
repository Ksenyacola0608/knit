from .auth import router as auth_router
from .users import router as users_router
from .services import router as services_router
from .orders import router as orders_router
from .reviews import router as reviews_router
from .messages import router as messages_router
from .notifications import router as notifications_router

__all__ = [
    "auth_router",
    "users_router",
    "services_router",
    "orders_router",
    "reviews_router",
    "messages_router",
    "notifications_router"
]
