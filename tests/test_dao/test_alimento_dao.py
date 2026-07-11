from database.connection import inicializar_banco, DATABASE_PATH
from dao.alimento_dao import AlimentoDAO
from models.alimento import Alimento



def limpar_banco():

    if DATABASE_PATH.exists():
        DATABASE_PATH.unlink()



def test_criar_alimento():

    limpar_banco()

    inicializar_banco()


    dao = AlimentoDAO()


    alimento = Alimento(
        "Frango grelhado",
        165,
        31,
        0,
        3.6,
        "Carnes"
    )


    resultado = dao.criar(alimento)


    assert resultado.id is not None



def test_buscar_alimentos():

    limpar_banco()

    inicializar_banco()


    dao = AlimentoDAO()


    alimento = Alimento(
        "Arroz branco",
        128,
        2.5,
        28,
        0.2,
        "Carboidratos"
    )


    dao.criar(alimento)


    alimentos = dao.buscar_por_nome("Arroz")


    assert len(alimentos) > 0