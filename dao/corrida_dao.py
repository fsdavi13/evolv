from datetime import date

from database.connection import conexao
from models.corrida import Corrida


class CorridaDAO:

    def criar(self, corrida):
        comando = """
            INSERT INTO corridas (
                data,
                distancia_km,
                pace_segundos,
                observacoes
            )
            VALUES (?, ?, ?, ?)
        """

        with conexao() as con:
            cursor = con.execute(
                comando,
                (
                    corrida.data.isoformat(),
                    corrida.distancia_km,
                    corrida.pace_segundos,
                    corrida.observacoes
                )
            )

            corrida.id = cursor.lastrowid

        return corrida

    def buscar_por_id(self, id):
        comando = """
            SELECT *
            FROM corridas
            WHERE id = ?
        """

        with conexao() as con:
            resultado = con.execute(
                comando,
                (id,)
            ).fetchone()

        if resultado is None:
            return None

        return self._converter_linha_para_corrida(resultado)

    def buscar_todas(self):
        comando = """
            SELECT *
            FROM corridas
            ORDER BY data DESC
        """

        with conexao() as con:
            resultados = con.execute(comando).fetchall()

        return [
            self._converter_linha_para_corrida(linha)
            for linha in resultados
        ]

    def atualizar(self, corrida):
        comando = """
            UPDATE corridas
            SET
                data = ?,
                distancia_km = ?,
                pace_segundos = ?,
                observacoes = ?
            WHERE id = ?
        """

        with conexao() as con:
            con.execute(
                comando,
                (
                    corrida.data.isoformat(),
                    corrida.distancia_km,
                    corrida.pace_segundos,
                    corrida.observacoes,
                    corrida.id
                )
            )

    def deletar(self, id):
        comando = """
            DELETE FROM corridas
            WHERE id = ?
        """

        with conexao() as con:
            con.execute(comando, (id,))

    def _converter_linha_para_corrida(self, linha):
        return Corrida(
            data=date.fromisoformat(linha["data"]),
            distancia_km=linha["distancia_km"],
            pace_segundos=linha["pace_segundos"],
            observacoes=linha["observacoes"],
            id=linha["id"]
        )