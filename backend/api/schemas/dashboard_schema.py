from datetime import date
from typing import Literal

from pydantic import BaseModel


SituacaoCalorica = Literal[
    "deficit",
    "manutencao",
    "superavit",
]


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


class ResumoMetabolicoResposta(BaseModel):
    perfil_cadastrado: bool
    tmb: float | None
    gasto_diario: float | None
    saldo_calorico: float | None
    situacao_calorica: SituacaoCalorica | None


class DashboardResposta(BaseModel):
    data: date
    academia: ResumoAcademiaResposta
    corrida: ResumoCorridaResposta
    dieta: ResumoDietaResposta
    metabolismo: ResumoMetabolicoResposta