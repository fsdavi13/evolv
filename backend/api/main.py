from contextlib import asynccontextmanager

from fastapi import FastAPI

from backend.api.routers.academia_router import router as academia_router
from backend.database.connection import inicializar_banco
from backend.api.routers.corrida_router import router as corrida_router
from backend.api.routers.dieta_router import router as dieta_router
from backend.api.routers.dashboard_router import (
    router as dashboard_router,
)
from fastapi.middleware.cors import CORSMiddleware
from backend.api.routers.perfil_router import router as perfil_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    inicializar_banco()
    yield


app = FastAPI(
    title="Evolv API",
    description="API para gerenciamento de treinos, corridas e alimentação.",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(academia_router)
app.include_router(corrida_router)
app.include_router(dieta_router)
app.include_router(dashboard_router)
app.include_router(perfil_router)


@app.get("/health")
def verificar_saude() -> dict[str, str]:
    return {"status": "ok"}

