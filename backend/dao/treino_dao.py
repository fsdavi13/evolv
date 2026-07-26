from datetime import datetime

from backend.database.connection import conexao
from backend.models.treino import Treino


class TreinoDAO:
    @staticmethod
    def _converter_linha(linha):
        if linha is None:
            return None

        finalizado_em = None

        if linha["finalizado_em"]:
            finalizado_em = datetime.fromisoformat(
                linha["finalizado_em"]
            )

        return Treino(
            id=linha["id"],
            divisao_id=linha["divisao_id"],
            iniciado_em=datetime.fromisoformat(
                linha["iniciado_em"]
            ),
            finalizado_em=finalizado_em,
            observacoes=linha["observacoes"],
            divisao_nome=linha["divisao_nome"],
        )

    def criar(self, treino):
        comando = """
            INSERT INTO treinos (
                divisao_id,
                iniciado_em,
                finalizado_em,
                observacoes
            )
            VALUES (?, ?, ?, ?)
        """

        with conexao() as con:
            cursor = con.execute(
                comando,
                (
                    treino.divisao_id,
                    treino.iniciado_em.isoformat(),
                    (
                        treino.finalizado_em.isoformat()
                        if treino.finalizado_em
                        else None
                    ),
                    treino.observacoes,
                ),
            )

            treino.id = cursor.lastrowid

        return treino

    def buscar_por_id(self, treino_id):
        comando = """
            SELECT
                treinos.*,
                divisoes_treino.nome AS divisao_nome
            FROM treinos
            INNER JOIN divisoes_treino
                ON divisoes_treino.id = treinos.divisao_id
            WHERE treinos.id = ?
        """

        with conexao() as con:
            resultado = con.execute(
                comando,
                (treino_id,),
            ).fetchone()

        return self._converter_linha(resultado)

    def buscar_em_andamento(self):
        comando = """
            SELECT
                treinos.*,
                divisoes_treino.nome AS divisao_nome
            FROM treinos
            INNER JOIN divisoes_treino
                ON divisoes_treino.id = treinos.divisao_id
            WHERE treinos.finalizado_em IS NULL
            ORDER BY treinos.iniciado_em DESC
            LIMIT 1
        """

        with conexao() as con:
            resultado = con.execute(
                comando
            ).fetchone()

        return self._converter_linha(resultado)

    def buscar_todos(self):
        comando = """
            SELECT
                treinos.*,
                divisoes_treino.nome AS divisao_nome
            FROM treinos
            INNER JOIN divisoes_treino
                ON divisoes_treino.id = treinos.divisao_id
            ORDER BY treinos.iniciado_em DESC
        """

        with conexao() as con:
            resultados = con.execute(
                comando
            ).fetchall()

        return [
            self._converter_linha(resultado)
            for resultado in resultados
        ]

    def atualizar(self, treino):
        comando = """
            UPDATE treinos
            SET divisao_id = ?,
                iniciado_em = ?,
                finalizado_em = ?,
                observacoes = ?
            WHERE id = ?
        """

        with conexao() as con:
            con.execute(
                comando,
                (
                    treino.divisao_id,
                    treino.iniciado_em.isoformat(),
                    (
                        treino.finalizado_em.isoformat()
                        if treino.finalizado_em
                        else None
                    ),
                    treino.observacoes,
                    treino.id,
                ),
            )

        return treino

    def deletar(self, treino_id):
        comando = """
            DELETE FROM treinos
            WHERE id = ?
        """

        with conexao() as con:
            con.execute(
                comando,
                (treino_id,),
            )