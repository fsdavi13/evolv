from contextlib import asynccontextmanager

from fastapi import FastAPI

from backend.api.routers.academia_router import router as academia_router
from backend.database.connection import inicializar_banco


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

app.include_router(academia_router)


@app.get("/health")
def verificar_saude() -> dict[str, str]:
    return {"status": "ok"}