from datetime import date, datetime

from pydantic import BaseModel, Field


class ExercicioEntrada(BaseModel):
    nome: str
    grupo_muscular: str


class ExercicioResposta(ExercicioEntrada):
    id: int


class SerieEntrada(BaseModel):
    treino_id: int | None = Field(default=None, gt=0)
    exercicio_id: int = Field(gt=0)
    data: date
    peso: float = Field(ge=0)
    repeticoes: int = Field(gt=0)
    observacoes: str | None = None


class SerieResposta(SerieEntrada):
    id: int
    volume: float


class DivisaoEntrada(BaseModel):
    nome: str = Field(min_length=1, max_length=50)
    descricao: str | None = Field(
        default=None,
        max_length=150,
    )


class ExercicioDivisaoEntrada(BaseModel):
    exercicio_id: int = Field(gt=0)


class ExercicioDivisaoResposta(BaseModel):
    id: int
    exercicio_id: int
    nome: str
    grupo_muscular: str
    ordem: int


class DivisaoResposta(DivisaoEntrada):
    id: int


class DivisaoDetalhadaResposta(DivisaoResposta):
    exercicios: list[ExercicioDivisaoResposta]


class TreinoEntrada(BaseModel):
    divisao_id: int = Field(gt=0)
    observacoes: str | None = Field(
        default=None,
        max_length=500,
    )


class TreinoFinalizarEntrada(BaseModel):
    observacoes: str | None = Field(
        default=None,
        max_length=500,
    )


class TreinoResposta(BaseModel):
    id: int
    divisao_id: int
    divisao_nome: str | None
    iniciado_em: datetime
    finalizado_em: datetime | None
    observacoes: str | None
    finalizado: bool


class TreinoDetalhadoResposta(TreinoResposta):
    series: list[SerieResposta]