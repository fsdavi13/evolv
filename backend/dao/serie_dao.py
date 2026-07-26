from datetime import date

from backend.database.connection import conexao
from backend.models.serie import Serie


class SerieDAO:
    @staticmethod
    def _converter_linha(linha):
        if linha is None:
            return None

        return Serie(
            id=linha["id"],
            treino_id=linha["treino_id"],
            exercicio_id=linha["exercicio_id"],
            data=date.fromisoformat(linha["data"]),
            peso=linha["peso"],
            repeticoes=linha["repeticoes"],
            observacoes=linha["observacoes"],
        )

    def criar(self, serie):
        comando = """
            INSERT INTO series (
                treino_id,
                exercicio_id,
                data,
                peso,
                repeticoes,
                observacoes
            )
            VALUES (?, ?, ?, ?, ?, ?)
        """

        with conexao() as con:
            cursor = con.execute(
                comando,
                (
                    serie.treino_id,
                    serie.exercicio_id,
                    serie.data.isoformat(),
                    serie.peso,
                    serie.repeticoes,
                    serie.observacoes,
                ),
            )

            serie.id = cursor.lastrowid

        return serie

    def buscar_por_id(self, serie_id):
        comando = """
            SELECT *
            FROM series
            WHERE id = ?
        """

        with conexao() as con:
            resultado = con.execute(
                comando,
                (serie_id,),
            ).fetchone()

        return self._converter_linha(resultado)

    def buscar_todas(self):
        comando = """
            SELECT *
            FROM series
            ORDER BY data DESC, id DESC
        """

        with conexao() as con:
            resultados = con.execute(
                comando
            ).fetchall()

        return [
            self._converter_linha(linha)
            for linha in resultados
        ]

    def buscar_por_exercicio(self, exercicio_id):
        comando = """
            SELECT *
            FROM series
            WHERE exercicio_id = ?
            ORDER BY data DESC, id DESC
        """

        with conexao() as con:
            resultados = con.execute(
                comando,
                (exercicio_id,),
            ).fetchall()

        return [
            self._converter_linha(linha)
            for linha in resultados
        ]

    def buscar_por_treino(self, treino_id):
        comando = """
            SELECT *
            FROM series
            WHERE treino_id = ?
            ORDER BY id
        """

        with conexao() as con:
            resultados = con.execute(
                comando,
                (treino_id,),
            ).fetchall()

        return [
            self._converter_linha(linha)
            for linha in resultados
        ]

    def atualizar(self, serie):
        comando = """
            UPDATE series
            SET treino_id = ?,
                exercicio_id = ?,
                data = ?,
                peso = ?,
                repeticoes = ?,
                observacoes = ?
            WHERE id = ?
        """

        with conexao() as con:
            con.execute(
                comando,
                (
                    serie.treino_id,
                    serie.exercicio_id,
                    serie.data.isoformat(),
                    serie.peso,
                    serie.repeticoes,
                    serie.observacoes,
                    serie.id,
                ),
            )

        return serie

    def deletar(self, serie_id):
        comando = """
            DELETE FROM series
            WHERE id = ?
        """

        with conexao() as con:
            con.execute(
                comando,
                (serie_id,),
            )