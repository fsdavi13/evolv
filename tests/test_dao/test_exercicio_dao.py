from database.connection import inicializar_banco
from dao.exercicio_dao import ExercicioDAO
from models.exercicio import Exercicio
from database.connection import DATABASE_PATH


def limpar_banco():

    if DATABASE_PATH.exists():
        DATABASE_PATH.unlink()



def test_criar_exercicio():

    limpar_banco()

    inicializar_banco()

    dao = ExercicioDAO()

    exercicio = Exercicio(
        "Supino Reto",
        "Peito"
    )

    resultado = dao.criar(exercicio)

    assert resultado.id is not None



def test_buscar_exercicios():

    limpar_banco()

    inicializar_banco()

    dao = ExercicioDAO()

    exercicio = Exercicio(
        "Supino Reto",
        "Peito"
    )

    dao.criar(exercicio)


    exercicios = dao.buscar_todos()

    assert len(exercicios) > 0