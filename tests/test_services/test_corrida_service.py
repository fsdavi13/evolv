from datetime import date

import pytest

from services.corrida_service import CorridaService


def test_registrar_corrida():
    service = CorridaService()

    corrida = service.registrar_corrida(
        data=date.today(),
        distancia_km=5,
        pace="06:00",
        observacoes="Treino leve"
    )

    assert corrida.id is not None
    assert corrida.data == date.today()
    assert corrida.distancia_km == 5
    assert corrida.pace == "06:00"
    assert corrida.pace_segundos == 360
    assert corrida.observacoes == "Treino leve"


def test_normalizar_observacoes_da_corrida():
    service = CorridaService()

    corrida = service.registrar_corrida(
        data=date.today(),
        distancia_km=5,
        pace="06:00",
        observacoes="   "
    )

    assert corrida.observacoes is None


def test_nao_registrar_corrida_sem_data():
    service = CorridaService()

    with pytest.raises(
        ValueError,
        match="A data da corrida é obrigatória."
    ):
        service.registrar_corrida(
            data=None,
            distancia_km=5,
            pace="06:00"
        )


def test_nao_registrar_corrida_com_distancia_invalida():
    service = CorridaService()

    with pytest.raises(
        ValueError,
        match="A distância deve ser maior que zero."
    ):
        service.registrar_corrida(
            data=date.today(),
            distancia_km=0,
            pace="06:00"
        )


@pytest.mark.parametrize(
    "pace",
    [
        "",
        "06",
        "06:60",
        "seis:00",
        "00:00"
    ]
)
def test_nao_registrar_corrida_com_pace_invalido(pace):
    service = CorridaService()

    with pytest.raises(ValueError):
        service.registrar_corrida(
            data=date.today(),
            distancia_km=5,
            pace=pace
        )


def test_listar_corridas():
    service = CorridaService()

    service.registrar_corrida(
        data=date.today(),
        distancia_km=5,
        pace="06:00"
    )

    service.registrar_corrida(
        data=date.today(),
        distancia_km=3,
        pace="07:00"
    )

    corridas = service.listar_corridas()

    assert len(corridas) == 2


def test_buscar_corrida_por_id():
    service = CorridaService()

    corrida_criada = service.registrar_corrida(
        data=date.today(),
        distancia_km=10,
        pace="05:30",
        observacoes="Treino longo"
    )

    corrida_encontrada = service.buscar_corrida_por_id(
        corrida_criada.id
    )

    assert corrida_encontrada.id == corrida_criada.id
    assert corrida_encontrada.distancia_km == 10
    assert corrida_encontrada.pace == "05:30"
    assert corrida_encontrada.observacoes == "Treino longo"


def test_nao_buscar_corrida_inexistente():
    service = CorridaService()

    with pytest.raises(
        ValueError,
        match="Corrida não encontrada."
    ):
        service.buscar_corrida_por_id(999)


def test_atualizar_corrida():
    service = CorridaService()

    corrida = service.registrar_corrida(
        data=date.today(),
        distancia_km=5,
        pace="06:00",
        observacoes="Treino inicial"
    )

    corrida_atualizada = service.atualizar_corrida(
        corrida_id=corrida.id,
        data=date.today(),
        distancia_km=8,
        pace="05:45",
        observacoes="  Treino forte  "
    )

    corrida_encontrada = service.buscar_corrida_por_id(
        corrida.id
    )

    assert corrida_atualizada.id == corrida.id
    assert corrida_encontrada.distancia_km == 8
    assert corrida_encontrada.pace == "05:45"
    assert corrida_encontrada.pace_segundos == 345
    assert corrida_encontrada.observacoes == "Treino forte"


def test_nao_atualizar_corrida_inexistente():
    service = CorridaService()

    with pytest.raises(
        ValueError,
        match="Corrida não encontrada."
    ):
        service.atualizar_corrida(
            corrida_id=999,
            data=date.today(),
            distancia_km=5,
            pace="06:00"
        )


def test_excluir_corrida():
    service = CorridaService()

    corrida = service.registrar_corrida(
        data=date.today(),
        distancia_km=5,
        pace="06:00"
    )

    service.excluir_corrida(corrida.id)

    with pytest.raises(
        ValueError,
        match="Corrida não encontrada."
    ):
        service.buscar_corrida_por_id(corrida.id)


def test_nao_excluir_corrida_inexistente():
    service = CorridaService()

    with pytest.raises(
        ValueError,
        match="Corrida não encontrada."
    ):
        service.excluir_corrida(999)