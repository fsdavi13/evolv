from typing import Annotated

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    status,
)

from backend.api.dependencies import obter_perfil_service
from backend.api.schemas.perfil_schema import (
    CalculoMetabolicoResposta,
    PerfilEntrada,
    PerfilResposta,
)
from backend.services.perfil_service import PerfilService


router = APIRouter(
    prefix="/perfil",
    tags=["Perfil"],
)


PerfilServiceDependencia = Annotated[
    PerfilService,
    Depends(obter_perfil_service),
]


def converter_perfil(perfil) -> PerfilResposta:
    return PerfilResposta(
        id=perfil.id,
        peso_kg=perfil.peso_kg,
        altura_cm=perfil.altura_cm,
        idade=perfil.idade,
        sexo=perfil.sexo,
        nivel_atividade=perfil.nivel_atividade,
    )


@router.put(
    "",
    response_model=PerfilResposta,
)
def salvar_perfil(
    dados: PerfilEntrada,
    service: PerfilServiceDependencia,
):
    try:
        perfil = service.salvar_perfil(
            peso_kg=dados.peso_kg,
            altura_cm=dados.altura_cm,
            idade=dados.idade,
            sexo=dados.sexo,
            nivel_atividade=dados.nivel_atividade,
        )

        return converter_perfil(perfil)

    except ValueError as erro:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(erro),
        ) from erro


@router.get(
    "",
    response_model=PerfilResposta,
)
def buscar_perfil(
    service: PerfilServiceDependencia,
):
    try:
        perfil = service.buscar_perfil()
        return converter_perfil(perfil)

    except ValueError as erro:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(erro),
        ) from erro


@router.get(
    "/calculo-metabolico",
    response_model=CalculoMetabolicoResposta,
)
def obter_calculo_metabolico(
    service: PerfilServiceDependencia,
):
    try:
        resumo = service.obter_resumo()

        return CalculoMetabolicoResposta(
            perfil=converter_perfil(resumo["perfil"]),
            tmb=resumo["tmb"],
            gasto_diario=resumo["gasto_diario"],
        )

    except ValueError as erro:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(erro),
        ) from erro