from datetime import date

from database.connection import inicializar_banco, DATABASE_PATH

from dao.alimento_dao import AlimentoDAO
from dao.registro_alimentar_dao import RegistroAlimentarDAO

from models.alimento import Alimento
from models.registro_alimentar import RegistroAlimentar



def limpar_banco():

    if DATABASE_PATH.exists():
        DATABASE_PATH.unlink()



def test_criar_registro_alimentar():

    limpar_banco()

    inicializar_banco()


    alimento_dao = AlimentoDAO()
    registro_dao = RegistroAlimentarDAO()


    alimento = Alimento(
        "Frango grelhado",
        165,
        31,
        0,
        3.6,
        "Carnes"
    )


    alimento_dao.criar(alimento)


    registro = RegistroAlimentar(
        alimento.id,
        date.today(),
        200,
        "Almoço"
    )


    resultado = registro_dao.criar(registro)


    assert resultado.id is not None



def test_buscar_por_data():

    limpar_banco()

    inicializar_banco()


    alimento_dao = AlimentoDAO()
    registro_dao = RegistroAlimentarDAO()


    alimento = Alimento(
        "Banana",
        89,
        1.1,
        23,
        0.3,
        "Frutas"
    )


    alimento_dao.criar(alimento)


    registro = RegistroAlimentar(
        alimento.id,
        date.today(),
        100,
        "Lanche"
    )


    registro_dao.criar(registro)


    registros = registro_dao.buscar_por_data(date.today())


    assert len(registros) > 0