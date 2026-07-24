from backend.database.connection import conexao
from backend.models.perfil import Perfil


class PerfilDAO:
    def salvar(self, perfil):
        comando = """
            INSERT INTO perfil (
                id,
                peso_kg,
                altura_cm,
                idade,
                sexo,
                nivel_atividade
            )
            VALUES (1, ?, ?, ?, ?, ?)
            ON CONFLICT(id) DO UPDATE SET
                peso_kg = excluded.peso_kg,
                altura_cm = excluded.altura_cm,
                idade = excluded.idade,
                sexo = excluded.sexo,
                nivel_atividade = excluded.nivel_atividade
        """

        with conexao() as con:
            con.execute(
                comando,
                (
                    perfil.peso_kg,
                    perfil.altura_cm,
                    perfil.idade,
                    perfil.sexo,
                    perfil.nivel_atividade,
                ),
            )

        perfil.id = 1
        return perfil

    def buscar(self):
        comando = """
            SELECT *
            FROM perfil
            WHERE id = 1
        """

        with conexao() as con:
            resultado = con.execute(comando).fetchone()

        if resultado is None:
            return None

        return Perfil(
            id=resultado["id"],
            peso_kg=resultado["peso_kg"],
            altura_cm=resultado["altura_cm"],
            idade=resultado["idade"],
            sexo=resultado["sexo"],
            nivel_atividade=resultado["nivel_atividade"],
        )