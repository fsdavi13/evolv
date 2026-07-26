import unicodedata

from backend.dao.exercicio_dao import ExercicioDAO
from backend.dao.serie_dao import SerieDAO
from backend.models.exercicio import Exercicio
from backend.models.serie import Serie
from backend.dao.divisao_exercicio_dao import (
    DivisaoExercicioDAO,
)
from backend.dao.divisao_treino_dao import (
    DivisaoTreinoDAO,
)
from backend.models.divisao_exercicio import (
    DivisaoExercicio,
)
from backend.models.divisao_treino import DivisaoTreino

from datetime import datetime

from backend.dao.treino_dao import TreinoDAO
from backend.models.treino import Treino


class AcademiaService:
    def __init__(self):
        self.exercicio_dao = ExercicioDAO()
        self.serie_dao = SerieDAO()
        self.divisao_treino_dao = DivisaoTreinoDAO()
        self.divisao_exercicio_dao = DivisaoExercicioDAO()
        self.treino_dao = TreinoDAO()

    def cadastrar_divisao(
        self,
        nome,
        descricao=None,
    ):
        nome = " ".join(nome.strip().split())

        if not nome:
            raise ValueError(
                "O nome da divisão é obrigatório."
            )

        if descricao is not None:
            descricao = " ".join(
                descricao.strip().split()
            )

            if not descricao:
                descricao = None

        nome_normalizado = (
            self._normalizar_nome_exercicio(nome)
        )

        for divisao in (
            self.divisao_treino_dao.buscar_todas()
        ):
            if (
                self._normalizar_nome_exercicio(
                    divisao.nome
                )
                == nome_normalizado
            ):
                raise ValueError(
                    "Já existe uma divisão com esse nome."
                )

        divisao = DivisaoTreino(
            nome=nome,
            descricao=descricao,
        )

        return self.divisao_treino_dao.criar(
            divisao
        )

    def listar_divisoes(self):
        return self.divisao_treino_dao.buscar_todas()

    def buscar_divisao_por_id(self, divisao_id):
        divisao = (
            self.divisao_treino_dao.buscar_por_id(
                divisao_id
            )
        )

        if divisao is None:
            raise ValueError(
                "Divisão de treino não encontrada."
            )

        return divisao

    def buscar_divisao_com_exercicios(
        self,
        divisao_id,
    ):
        divisao = self.buscar_divisao_por_id(
            divisao_id
        )

        exercicios = (
            self.divisao_exercicio_dao
            .buscar_por_divisao(divisao_id)
        )

        return divisao, exercicios

    def atualizar_divisao(
        self,
        divisao_id,
        nome,
        descricao=None,
    ):
        divisao = self.buscar_divisao_por_id(
            divisao_id
        )

        nome = " ".join(nome.strip().split())

        if not nome:
            raise ValueError(
                "O nome da divisão é obrigatório."
            )

        if descricao is not None:
            descricao = " ".join(
                descricao.strip().split()
            )

            if not descricao:
                descricao = None

        nome_normalizado = (
            self._normalizar_nome_exercicio(nome)
        )

        for divisao_existente in (
            self.divisao_treino_dao.buscar_todas()
        ):
            if divisao_existente.id == divisao_id:
                continue

            if (
                self._normalizar_nome_exercicio(
                    divisao_existente.nome
                )
                == nome_normalizado
            ):
                raise ValueError(
                    "Já existe uma divisão com esse nome."
                )

        divisao.nome = nome
        divisao.descricao = descricao

        return self.divisao_treino_dao.atualizar(
            divisao
        )

    def excluir_divisao(self, divisao_id):
        self.buscar_divisao_por_id(divisao_id)
        self.divisao_treino_dao.deletar(divisao_id)

    def adicionar_exercicio_divisao(
        self,
        divisao_id,
        exercicio_id,
    ):
        self.buscar_divisao_por_id(divisao_id)
        exercicio = self.buscar_exercicio_por_id(
            exercicio_id
        )

        associacao_existente = (
            self.divisao_exercicio_dao
            .buscar_por_divisao_e_exercicio(
                divisao_id,
                exercicio_id,
            )
        )

        if associacao_existente is not None:
            raise ValueError(
                "O exercício já pertence a essa divisão."
            )

        ordem = (
            self.divisao_exercicio_dao
            .buscar_proxima_ordem(divisao_id)
        )

        associacao = DivisaoExercicio(
            divisao_id=divisao_id,
            exercicio_id=exercicio_id,
            ordem=ordem,
            exercicio=exercicio,
        )

        return self.divisao_exercicio_dao.criar(
            associacao
        )

    def remover_exercicio_divisao(
        self,
        divisao_id,
        exercicio_id,
    ):
        self.buscar_divisao_por_id(divisao_id)

        associacao = (
            self.divisao_exercicio_dao
            .buscar_por_divisao_e_exercicio(
                divisao_id,
                exercicio_id,
            )
        )

        if associacao is None:
            raise ValueError(
                "O exercício não pertence a essa divisão."
            )

        self.divisao_exercicio_dao\
            .deletar_por_divisao_e_exercicio(
                divisao_id,
                exercicio_id,
            )

        associacoes_restantes = (
            self.divisao_exercicio_dao
            .buscar_por_divisao(divisao_id)
        )

        for indice, item in enumerate(
            associacoes_restantes,
            start=1,
        ):
            self.divisao_exercicio_dao\
                .atualizar_ordem(
                    item.id,
                    indice,
                )

    @staticmethod
    def _normalizar_nome_exercicio(nome):
        nome_sem_acentos = "".join(
            caractere
            for caractere in unicodedata.normalize("NFD", nome)
            if unicodedata.category(caractere) != "Mn"
        )

        return " ".join(nome_sem_acentos.casefold().split())

    def _validar_nome_exercicio_unico(
        self,
        nome,
        exercicio_id_ignorado=None,
    ):
        nome_normalizado = self._normalizar_nome_exercicio(nome)

        for exercicio in self.exercicio_dao.buscar_todos():
            if exercicio.id == exercicio_id_ignorado:
                continue

            nome_existente = self._normalizar_nome_exercicio(
                exercicio.nome
            )

            if nome_existente == nome_normalizado:
                raise ValueError(
                    "Já existe um exercício com esse nome."
                )

    def cadastrar_exercicio(
        self,
        nome,
        grupo_muscular,
    ):
        nome = " ".join(nome.strip().split())
        grupo_muscular = " ".join(
            grupo_muscular.strip().split()
        )

        if not nome:
            raise ValueError(
                "O nome do exercício é obrigatório."
            )

        if not grupo_muscular:
            raise ValueError(
                "O grupo muscular é obrigatório."
            )

        self._validar_nome_exercicio_unico(nome)

        exercicio = Exercicio(
            nome=nome,
            grupo_muscular=grupo_muscular,
        )

        return self.exercicio_dao.criar(exercicio)

    def listar_exercicios(self):
        return self.exercicio_dao.buscar_todos()

    def buscar_exercicio_por_id(self, exercicio_id):
        exercicio = self.exercicio_dao.buscar_por_id(exercicio_id)

        if exercicio is None:
            raise ValueError("Exercício não encontrado.")

        return exercicio

    def atualizar_exercicio(
        self,
        exercicio_id,
        nome,
        grupo_muscular,
    ):
        exercicio = self.buscar_exercicio_por_id(
            exercicio_id
        )

        nome = " ".join(nome.strip().split())
        grupo_muscular = " ".join(
            grupo_muscular.strip().split()
        )

        if not nome:
            raise ValueError(
                "O nome do exercício é obrigatório."
            )

        if not grupo_muscular:
            raise ValueError(
                "O grupo muscular é obrigatório."
            )

        self._validar_nome_exercicio_unico(
            nome,
            exercicio_id_ignorado=exercicio_id,
        )

        exercicio.nome = nome
        exercicio.grupo_muscular = grupo_muscular

        self.exercicio_dao.atualizar(exercicio)

        return exercicio

    def excluir_exercicio(self, exercicio_id):
        self.buscar_exercicio_por_id(exercicio_id)

        self.exercicio_dao.deletar(exercicio_id)

    def registrar_serie(
        self,
        exercicio_id,
        data,
        peso,
        repeticoes,
        observacoes=None,
        treino_id=None,
    ):
        self.buscar_exercicio_por_id(exercicio_id)

        if treino_id is not None:
            treino = self.buscar_treino_por_id(treino_id)

            if treino.finalizado:
                raise ValueError(
                    "Não é possível registrar séries "
                    "em um treino finalizado."
                )

            exercicios = (
                self.divisao_exercicio_dao
                .buscar_por_divisao(treino.divisao_id)
            )

            exercicios_ids = {
                item.exercicio_id
                for item in exercicios
            }

            if exercicio_id not in exercicios_ids:
                raise ValueError(
                    "O exercício não pertence à divisão "
                    "deste treino."
                )

        if peso < 0:
            raise ValueError(
                "O peso não pode ser negativo."
            )

        if repeticoes <= 0:
            raise ValueError(
                "A quantidade de repetições deve ser "
                "maior que zero."
            )

        if observacoes is not None:
            observacoes = observacoes.strip()

            if not observacoes:
                observacoes = None

        serie = Serie(
            treino_id=treino_id,
            exercicio_id=exercicio_id,
            data=data,
            peso=peso,
            repeticoes=repeticoes,
            observacoes=observacoes,
        )

        return self.serie_dao.criar(serie)

    def listar_series(self):
        return self.serie_dao.buscar_todas()

    def buscar_series_por_exercicio(self, exercicio_id):
        self.buscar_exercicio_por_id(exercicio_id)

        return self.serie_dao.buscar_por_exercicio(exercicio_id)

    def calcular_volume_total_exercicio(self, exercicio_id):
        series = self.buscar_series_por_exercicio(exercicio_id)

        volume_total = 0

        for serie in series:
            volume_total += serie.calcular_volume()

        return volume_total

    def buscar_maior_carga(self, exercicio_id):
        series = self.buscar_series_por_exercicio(exercicio_id)

        if not series:
            return None

        maior_carga = series[0].peso

        for serie in series:
            if serie.peso > maior_carga:
                maior_carga = serie.peso

        return maior_carga

    def buscar_maior_volume_serie(self, exercicio_id):
        series = self.buscar_series_por_exercicio(exercicio_id)

        if not series:
            return None

        melhor_serie = series[0]

        for serie in series:
            if (
                serie.calcular_volume()
                > melhor_serie.calcular_volume()
            ):
                melhor_serie = serie

        return melhor_serie

    def calcular_volume_por_data(self, data):
        series = self.serie_dao.buscar_todas()

        volume_total = 0

        for serie in series:
            if serie.data == data:
                volume_total += serie.calcular_volume()

        return volume_total

    def contar_series_por_data(self, data):
        series = self.serie_dao.buscar_todas()

        quantidade = 0

        for serie in series:
            if serie.data == data:
                quantidade += 1

        return quantidade

    def excluir_serie(self, serie_id):
        serie = self.serie_dao.buscar_por_id(serie_id)

        if serie is None:
            raise ValueError("Série não encontrada.")

        self.serie_dao.deletar(serie_id)

    def iniciar_treino(
        self,
        divisao_id,
        observacoes=None,
    ):
        self.buscar_divisao_por_id(divisao_id)

        treino_em_andamento = (
            self.treino_dao.buscar_em_andamento()
        )

        if treino_em_andamento is not None:
            raise ValueError(
                "Já existe um treino em andamento."
            )

        if observacoes is not None:
            observacoes = observacoes.strip()

            if not observacoes:
                observacoes = None

        treino = Treino(
            divisao_id=divisao_id,
            iniciado_em=datetime.now(),
            observacoes=observacoes,
        )

        treino = self.treino_dao.criar(treino)

        return self.buscar_treino_por_id(treino.id)


    def listar_treinos(self):
        return self.treino_dao.buscar_todos()


    def buscar_treino_por_id(self, treino_id):
        treino = self.treino_dao.buscar_por_id(
            treino_id
        )

        if treino is None:
            raise ValueError(
                "Treino não encontrado."
            )

        return treino


    def buscar_treino_em_andamento(self):
        treino = self.treino_dao.buscar_em_andamento()

        if treino is None:
            raise ValueError(
                "Não existe treino em andamento."
            )

        return treino


    def buscar_treino_detalhado(self, treino_id):
        treino = self.buscar_treino_por_id(
            treino_id
        )

        series = self.serie_dao.buscar_por_treino(
            treino_id
        )

        return treino, series


    def finalizar_treino(
        self,
        treino_id,
        observacoes=None,
    ):
        treino = self.buscar_treino_por_id(
            treino_id
        )

        if treino.finalizado:
            raise ValueError(
                "O treino já foi finalizado."
            )

        if observacoes is not None:
            observacoes = observacoes.strip()
            treino.observacoes = (
                observacoes or None
            )

        treino.finalizar()

        self.treino_dao.atualizar(treino)

        return self.buscar_treino_por_id(
            treino.id
        )


    def excluir_treino(self, treino_id):
        self.buscar_treino_por_id(treino_id)

        self.treino_dao.deletar(treino_id)