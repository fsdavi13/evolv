from datetime import date

from pydantic import BaseModel, Field


class ExercicioEntrada(BaseModel):
    nome: str
    grupo_muscular: str


class ExercicioResposta(ExercicioEntrada):
    id: int


class SerieEntrada(BaseModel):
    exercicio_id: int
    data: date
    peso: float = Field(ge=0)
    repeticoes: int = Field(gt=0)
    observacoes: str | None = None


class SerieResposta(SerieEntrada):
    id: int
    volume: float