from database.connection import inicializar_banco
from dao.alimento_dao import AlimentoDAO
from dao.porcao_dao import PorcaoDAO
from models.alimento import Alimento
from models.porcao import Porcao


def test_criar_porcao():

    inicializar_banco()

    alimento_dao = AlimentoDAO()
    porcao_dao = PorcaoDAO()

    alimento = Alimento(
        nome="Banana",
        calorias_por_100g=89,
        proteinas_g=1.1,
        carboidratos_g=22.8,
        gorduras_g=0.3,
        categoria="Frutas",
        fonte="Teste"
    )

    alimento = alimento_dao.criar(alimento)

    porcao = Porcao(
        alimento_id=alimento.id,
        descricao="1 unidade média",
        gramas=86
    )

    porcao = porcao_dao.criar(porcao)

    assert porcao.id is not None


def test_buscar_por_alimento():

    inicializar_banco()

    alimento_dao = AlimentoDAO()
    porcao_dao = PorcaoDAO()

    alimento = Alimento(
        nome="Maçã",
        calorias_por_100g=52,
        proteinas_g=0.3,
        carboidratos_g=14,
        gorduras_g=0.2,
        categoria="Frutas",
        fonte="Teste"
    )

    alimento = alimento_dao.criar(alimento)

    porcao = Porcao(
        alimento_id=alimento.id,
        descricao="1 unidade",
        gramas=130
    )

    porcao_dao.criar(porcao)

    resultado = porcao_dao.buscar_por_alimento(alimento.id)

    assert len(resultado) == 1