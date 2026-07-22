from datetime import date

from dao.corrida_dao import CorridaDAO
from models.corrida import Corrida


def test_criar_corrida():
    corrida_dao = CorridaDAO()

    corrida = Corrida(
        data=date.today(),
        distancia_km=5,
        pace="06:00",
        observacoes="Treino leve"
    )

    corrida_criada = corrida_dao.criar(corrida)

    assert corrida_criada.id is not None
    assert corrida_criada.distancia_km == 5
    assert corrida_criada.pace == "06:00"
    assert corrida_criada.observacoes == "Treino leve"


def test_buscar_corridas():
    corrida_dao = CorridaDAO()

    corrida = Corrida(
        data=date.today(),
        distancia_km=3,
        pace="07:00",
        observacoes="Corrida de recuperação"
    )

    corrida_criada = corrida_dao.criar(corrida)

    corridas = corrida_dao.buscar_todas()

    assert len(corridas) == 1

    corrida_encontrada = corridas[0]

    assert corrida_encontrada.id == corrida_criada.id
    assert corrida_encontrada.data == date.today()
    assert corrida_encontrada.distancia_km == 3
    assert corrida_encontrada.pace == "07:00"
    assert corrida_encontrada.pace_segundos == 420
    assert corrida_encontrada.observacoes == "Corrida de recuperação"


def test_buscar_corrida_por_id():
    corrida_dao = CorridaDAO()

    corrida = Corrida(
        data=date.today(),
        distancia_km=10,
        pace="05:30",
        observacoes="Treino longo"
    )

    corrida_criada = corrida_dao.criar(corrida)

    corrida_encontrada = corrida_dao.buscar_por_id(
        corrida_criada.id
    )

    assert corrida_encontrada is not None
    assert corrida_encontrada.id == corrida_criada.id
    assert corrida_encontrada.data == date.today()
    assert corrida_encontrada.distancia_km == 10
    assert corrida_encontrada.pace == "05:30"
    assert corrida_encontrada.pace_segundos == 330
    assert corrida_encontrada.observacoes == "Treino longo"