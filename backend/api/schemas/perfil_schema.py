from typing import Literal

from pydantic import BaseModel, Field


Sexo = Literal[
    "masculino",
    "feminino",
]

NivelAtividade = Literal[
    "sedentario",
    "levemente_ativo",
    "moderadamente_ativo",
    "muito_ativo",
    "extremamente_ativo",
]


class PerfilEntrada(BaseModel):
    peso_kg: float = Field(gt=0)
    altura_cm: float = Field(gt=0)
    idade: int = Field(gt=0)
    sexo: Sexo
    nivel_atividade: NivelAtividade


class PerfilResposta(PerfilEntrada):
    id: int


class CalculoMetabolicoResposta(BaseModel):
    perfil: PerfilResposta
    tmb: float
    gasto_diario: float