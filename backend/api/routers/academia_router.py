from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status

from backend.api.dependencies import obter_academia_service
from backend.api.schemas.academia_schema import (
    ExercicioEntrada,
    ExercicioResposta,
    SerieEntrada,
    SerieResposta,
    DivisaoDetalhadaResposta,
    DivisaoEntrada,
    DivisaoResposta,
    ExercicioDivisaoEntrada,
    ExercicioDivisaoResposta,
    TreinoDetalhadoResposta,
    TreinoEntrada,
    TreinoFinalizarEntrada,
    TreinoResposta,
)

from backend.services.academia_service import AcademiaService

router = APIRouter(
    prefix="/academia",
    tags=["Academia"],
)

AcademiaServiceDependencia = Annotated[
    AcademiaService,
    Depends(obter_academia_service),
]


def converter_exercicio(exercicio) -> ExercicioResposta:
    return ExercicioResposta(
        id=exercicio.id,
        nome=exercicio.nome,
        grupo_muscular=exercicio.grupo_muscular,
    )


def converter_serie(serie) -> SerieResposta:
    return SerieResposta(
        id=serie.id,
        treino_id=serie.treino_id,
        exercicio_id=serie.exercicio_id,
        data=serie.data,
        peso=serie.peso,
        repeticoes=serie.repeticoes,
        observacoes=serie.observacoes,
        volume=serie.calcular_volume(),
    )

def converter_treino(treino) -> TreinoResposta:
    return TreinoResposta(
        id=treino.id,
        divisao_id=treino.divisao_id,
        divisao_nome=treino.divisao_nome,
        iniciado_em=treino.iniciado_em,
        finalizado_em=treino.finalizado_em,
        observacoes=treino.observacoes,
        finalizado=treino.finalizado,
    )

def converter_divisao(
    divisao,
) -> DivisaoResposta:
    return DivisaoResposta(
        id=divisao.id,
        nome=divisao.nome,
        descricao=divisao.descricao,
    )


def converter_exercicio_divisao(
    associacao,
) -> ExercicioDivisaoResposta:
    return ExercicioDivisaoResposta(
        id=associacao.id,
        exercicio_id=associacao.exercicio_id,
        nome=associacao.exercicio.nome,
        grupo_muscular=(
            associacao.exercicio.grupo_muscular
        ),
        ordem=associacao.ordem,
    )


@router.post(
    "/divisoes",
    response_model=DivisaoResposta,
    status_code=status.HTTP_201_CREATED,
)
def cadastrar_divisao(
    dados: DivisaoEntrada,
    service: AcademiaServiceDependencia,
):
    try:
        divisao = service.cadastrar_divisao(
            nome=dados.nome,
            descricao=dados.descricao,
        )

        return converter_divisao(divisao)
    except ValueError as erro:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(erro),
        ) from erro


@router.get(
    "/divisoes",
    response_model=list[DivisaoResposta],
)
def listar_divisoes(
    service: AcademiaServiceDependencia,
):
    return [
        converter_divisao(divisao)
        for divisao in service.listar_divisoes()
    ]


@router.get(
    "/divisoes/{divisao_id}",
    response_model=DivisaoDetalhadaResposta,
)
def buscar_divisao(
    divisao_id: int,
    service: AcademiaServiceDependencia,
):
    try:
        divisao, exercicios = (
            service.buscar_divisao_com_exercicios(
                divisao_id
            )
        )

        return DivisaoDetalhadaResposta(
            id=divisao.id,
            nome=divisao.nome,
            descricao=divisao.descricao,
            exercicios=[
                converter_exercicio_divisao(item)
                for item in exercicios
            ],
        )
    except ValueError as erro:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(erro),
        ) from erro


@router.put(
    "/divisoes/{divisao_id}",
    response_model=DivisaoResposta,
)
def atualizar_divisao(
    divisao_id: int,
    dados: DivisaoEntrada,
    service: AcademiaServiceDependencia,
):
    try:
        divisao = service.atualizar_divisao(
            divisao_id=divisao_id,
            nome=dados.nome,
            descricao=dados.descricao,
        )

        return converter_divisao(divisao)
    except ValueError as erro:
        mensagem = str(erro)

        codigo = (
            status.HTTP_404_NOT_FOUND
            if mensagem
            == "Divisão de treino não encontrada."
            else status.HTTP_400_BAD_REQUEST
        )

        raise HTTPException(
            status_code=codigo,
            detail=mensagem,
        ) from erro


@router.delete(
    "/divisoes/{divisao_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def excluir_divisao(
    divisao_id: int,
    service: AcademiaServiceDependencia,
):
    try:
        service.excluir_divisao(divisao_id)
    except ValueError as erro:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(erro),
        ) from erro


@router.post(
    "/divisoes/{divisao_id}/exercicios",
    response_model=ExercicioDivisaoResposta,
    status_code=status.HTTP_201_CREATED,
)
def adicionar_exercicio_divisao(
    divisao_id: int,
    dados: ExercicioDivisaoEntrada,
    service: AcademiaServiceDependencia,
):
    try:
        associacao = (
            service.adicionar_exercicio_divisao(
                divisao_id=divisao_id,
                exercicio_id=dados.exercicio_id,
            )
        )

        return converter_exercicio_divisao(
            associacao
        )
    except ValueError as erro:
        mensagem = str(erro)

        codigo = (
            status.HTTP_404_NOT_FOUND
            if mensagem
            in {
                "Divisão de treino não encontrada.",
                "Exercício não encontrado.",
            }
            else status.HTTP_400_BAD_REQUEST
        )

        raise HTTPException(
            status_code=codigo,
            detail=mensagem,
        ) from erro


@router.delete(
    "/divisoes/{divisao_id}/exercicios/"
    "{exercicio_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def remover_exercicio_divisao(
    divisao_id: int,
    exercicio_id: int,
    service: AcademiaServiceDependencia,
):
    try:
        service.remover_exercicio_divisao(
            divisao_id=divisao_id,
            exercicio_id=exercicio_id,
        )
    except ValueError as erro:
        mensagem = str(erro)

        codigo = (
            status.HTTP_404_NOT_FOUND
            if mensagem
            == "Divisão de treino não encontrada."
            else status.HTTP_400_BAD_REQUEST
        )

        raise HTTPException(
            status_code=codigo,
            detail=mensagem,
        ) from erro

@router.post(
    "/exercicios",
    response_model=ExercicioResposta,
    status_code=status.HTTP_201_CREATED,
)
def cadastrar_exercicio(
    dados: ExercicioEntrada,
    service: AcademiaServiceDependencia,
):
    try:
        exercicio = service.cadastrar_exercicio(
            nome=dados.nome,
            grupo_muscular=dados.grupo_muscular,
        )
        return converter_exercicio(exercicio)
    except ValueError as erro:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(erro),
        ) from erro


@router.get(
    "/exercicios",
    response_model=list[ExercicioResposta],
)
def listar_exercicios(
    service: AcademiaServiceDependencia,
):
    exercicios = service.listar_exercicios()

    return [
        converter_exercicio(exercicio)
        for exercicio in exercicios
    ]


@router.get(
    "/exercicios/{exercicio_id}",
    response_model=ExercicioResposta,
)
def buscar_exercicio(
    exercicio_id: int,
    service: AcademiaServiceDependencia,
):
    try:
        exercicio = service.buscar_exercicio_por_id(exercicio_id)
        return converter_exercicio(exercicio)
    except ValueError as erro:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(erro),
        ) from erro


@router.put(
    "/exercicios/{exercicio_id}",
    response_model=ExercicioResposta,
)
def atualizar_exercicio(
    exercicio_id: int,
    dados: ExercicioEntrada,
    service: AcademiaServiceDependencia,
):
    try:
        exercicio = service.atualizar_exercicio(
            exercicio_id=exercicio_id,
            nome=dados.nome,
            grupo_muscular=dados.grupo_muscular,
        )
        return converter_exercicio(exercicio)
    except ValueError as erro:
        mensagem = str(erro)

        codigo = (
            status.HTTP_404_NOT_FOUND
            if mensagem == "Exercício não encontrado."
            else status.HTTP_400_BAD_REQUEST
        )

        raise HTTPException(
            status_code=codigo,
            detail=mensagem,
        ) from erro


@router.delete(
    "/exercicios/{exercicio_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def excluir_exercicio(
    exercicio_id: int,
    service: AcademiaServiceDependencia,
):
    try:
        service.excluir_exercicio(exercicio_id)
    except ValueError as erro:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(erro),
        ) from erro


@router.post(
    "/series",
    response_model=SerieResposta,
    status_code=status.HTTP_201_CREATED,
)
def registrar_serie(
    dados: SerieEntrada,
    service: AcademiaServiceDependencia,
):
    try:
        serie = service.registrar_serie(
            exercicio_id=dados.exercicio_id,
            data=dados.data,
            peso=dados.peso,
            repeticoes=dados.repeticoes,
            observacoes=dados.observacoes,
            treino_id=dados.treino_id,
        )
        return converter_serie(serie)
    except ValueError as erro:
        mensagem = str(erro)

        codigo = (
            status.HTTP_404_NOT_FOUND
            if mensagem == "Exercício não encontrado."
            else status.HTTP_400_BAD_REQUEST
        )

        raise HTTPException(
            status_code=codigo,
            detail=mensagem,
        ) from erro


@router.get(
    "/series",
    response_model=list[SerieResposta],
)
def listar_series(
    service: AcademiaServiceDependencia,
):
    series = service.listar_series()

    return [
        converter_serie(serie)
        for serie in series
    ]


@router.get(
    "/exercicios/{exercicio_id}/series",
    response_model=list[SerieResposta],
)
def listar_series_por_exercicio(
    exercicio_id: int,
    service: AcademiaServiceDependencia,
):
    try:
        series = service.buscar_series_por_exercicio(exercicio_id)

        return [
            converter_serie(serie)
            for serie in series
        ]
    except ValueError as erro:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(erro),
        ) from erro


@router.delete(
    "/series/{serie_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def excluir_serie(
    serie_id: int,
    service: AcademiaServiceDependencia,
):
    try:
        service.excluir_serie(serie_id)
    except ValueError as erro:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(erro),
        ) from erro

@router.post(
    "/treinos",
    response_model=TreinoResposta,
    status_code=status.HTTP_201_CREATED,
)
def iniciar_treino(
    dados: TreinoEntrada,
    service: AcademiaServiceDependencia,
):
    try:
        treino = service.iniciar_treino(
            divisao_id=dados.divisao_id,
            observacoes=dados.observacoes,
        )

        return converter_treino(treino)

    except ValueError as erro:
        mensagem = str(erro)

        codigo = (
            status.HTTP_404_NOT_FOUND
            if mensagem
            == "Divisão de treino não encontrada."
            else status.HTTP_400_BAD_REQUEST
        )

        raise HTTPException(
            status_code=codigo,
            detail=mensagem,
        ) from erro


@router.get(
    "/treinos",
    response_model=list[TreinoResposta],
)
def listar_treinos(
    service: AcademiaServiceDependencia,
):
    return [
        converter_treino(treino)
        for treino in service.listar_treinos()
    ]


@router.get(
    "/treinos/em-andamento",
    response_model=TreinoResposta,
)
def buscar_treino_em_andamento(
    service: AcademiaServiceDependencia,
):
    try:
        treino = (
            service.buscar_treino_em_andamento()
        )

        return converter_treino(treino)

    except ValueError as erro:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(erro),
        ) from erro


@router.get(
    "/treinos/{treino_id}",
    response_model=TreinoDetalhadoResposta,
)
def buscar_treino(
    treino_id: int,
    service: AcademiaServiceDependencia,
):
    try:
        treino, series = (
            service.buscar_treino_detalhado(
                treino_id
            )
        )

        return TreinoDetalhadoResposta(
            **converter_treino(
                treino
            ).model_dump(),
            series=[
                converter_serie(serie)
                for serie in series
            ],
        )

    except ValueError as erro:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(erro),
        ) from erro


@router.put(
    "/treinos/{treino_id}/finalizar",
    response_model=TreinoResposta,
)
def finalizar_treino(
    treino_id: int,
    dados: TreinoFinalizarEntrada,
    service: AcademiaServiceDependencia,
):
    try:
        treino = service.finalizar_treino(
            treino_id=treino_id,
            observacoes=dados.observacoes,
        )

        return converter_treino(treino)

    except ValueError as erro:
        mensagem = str(erro)

        codigo = (
            status.HTTP_404_NOT_FOUND
            if mensagem == "Treino não encontrado."
            else status.HTTP_400_BAD_REQUEST
        )

        raise HTTPException(
            status_code=codigo,
            detail=mensagem,
        ) from erro


@router.delete(
    "/treinos/{treino_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def excluir_treino(
    treino_id: int,
    service: AcademiaServiceDependencia,
):
    try:
        service.excluir_treino(treino_id)

    except ValueError as erro:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(erro),
        ) from erro