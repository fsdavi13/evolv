from datetime import date

from database.connection import inicializar_banco, DATABASE_PATH
from dao.exercicio_dao import ExercicioDAO
from dao.serie_dao import SerieDAO
from models.exercicio import Exercicio
from models.serie import Serie



def limpar_banco():

    if DATABASE_PATH.exists():
        DATABASE_PATH.unlink()



def test_criar_serie():

    limpar_banco()

    inicializar_banco()


    exercicio_dao = ExercicioDAO()
    serie_dao = SerieDAO()


    exercicio = Exercicio(
        "Supino Reto",
        "Peito"
    )


    exercicio_dao.criar(exercicio)


    serie = Serie(
        exercicio.id,
        date.today(),
        20,
        10,
        "Boa execução"
    )


    resultado = serie_dao.criar(serie)


    assert resultado.id is not None



def test_buscar_series():

    limpar_banco()

    inicializar_banco()


    exercicio_dao = ExercicioDAO()
    serie_dao = SerieDAO()


    exercicio = Exercicio(
        "Supino Reto",
        "Peito"
    )


    exercicio_dao.criar(exercicio)


    serie = Serie(
        exercicio.id,
        date.today(),
        20,
        10
    )


    serie_dao.criar(serie)


    series = serie_dao.buscar_todas()


    assert len(series) > 0