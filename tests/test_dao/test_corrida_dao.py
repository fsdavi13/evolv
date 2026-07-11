from datetime import date

from database.connection import inicializar_banco, DATABASE_PATH
from dao.corrida_dao import CorridaDAO
from models.corrida import Corrida



def limpar_banco():

    if DATABASE_PATH.exists():
        DATABASE_PATH.unlink()



def test_criar_corrida():

    limpar_banco()

    inicializar_banco()


    dao = CorridaDAO()


    corrida = Corrida(
        date.today(),
        5,
        408,
        "Corrida leve"
    )


    resultado = dao.criar(corrida)


    assert resultado.id is not None



def test_buscar_corridas():

    limpar_banco()

    inicializar_banco()


    dao = CorridaDAO()


    corrida = Corrida(
        date.today(),
        5,
        408
    )


    dao.criar(corrida)


    corridas = dao.buscar_todas()


    assert len(corridas) > 0