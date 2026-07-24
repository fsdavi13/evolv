from datetime import date

from pydantic import BaseModel


class ResumoAcademiaResposta(BaseModel):
    quantidade_series: int
    quantidade_exercicios: int
    volume_total: float


class ResumoCorridaResposta(BaseModel):
    quantidade_corridas: int
    distancia_total_km: float
    tempo_total_segundos: int
    melhor_pace: str | None


class ResumoDietaResposta(BaseModel):
    quantidade_registros: int
    calorias: float
    proteinas_g: float
    carboidratos_g: float
    gorduras_g: float


class DashboardResposta(BaseModel):
    data: date
    academia: ResumoAcademiaResposta
    corrida: ResumoCorridaResposta
    dieta: ResumoDietaResposta