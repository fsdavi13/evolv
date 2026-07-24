from backend.dao.perfil_dao import PerfilDAO
from backend.models.perfil import Perfil


class PerfilService:
    FATORES_ATIVIDADE = {
        "sedentario": 1.2,
        "levemente_ativo": 1.375,
        "moderadamente_ativo": 1.55,
        "muito_ativo": 1.725,
        "extremamente_ativo": 1.9,
    }

    SEXOS_VALIDOS = {
        "masculino",
        "feminino",
    }

    def __init__(self, perfil_dao=None):
        self.perfil_dao = perfil_dao or PerfilDAO()

    def salvar_perfil(
        self,
        peso_kg,
        altura_cm,
        idade,
        sexo,
        nivel_atividade,
    ):
        peso_kg = self._validar_peso(peso_kg)
        altura_cm = self._validar_altura(altura_cm)
        idade = self._validar_idade(idade)
        sexo = self._validar_sexo(sexo)
        nivel_atividade = self._validar_nivel_atividade(
            nivel_atividade
        )

        perfil = Perfil(
            peso_kg=peso_kg,
            altura_cm=altura_cm,
            idade=idade,
            sexo=sexo,
            nivel_atividade=nivel_atividade,
        )

        return self.perfil_dao.salvar(perfil)

    def buscar_perfil(self):
        perfil = self.perfil_dao.buscar()

        if perfil is None:
            raise ValueError("Perfil ainda não cadastrado.")

        return perfil

    def calcular_tmb(self, perfil=None):
        perfil = perfil or self.buscar_perfil()

        tmb_base = (
            10 * perfil.peso_kg
            + 6.25 * perfil.altura_cm
            - 5 * perfil.idade
        )

        if perfil.sexo == "masculino":
            tmb = tmb_base + 5
        else:
            tmb = tmb_base - 161

        return round(tmb, 2)

    def calcular_gasto_diario(self, perfil=None):
        perfil = perfil or self.buscar_perfil()

        tmb = self.calcular_tmb(perfil)
        fator_atividade = self.FATORES_ATIVIDADE[
            perfil.nivel_atividade
        ]

        return round(tmb * fator_atividade, 2)

    def obter_resumo(self):
        perfil = self.buscar_perfil()

        return {
            "perfil": perfil,
            "tmb": self.calcular_tmb(perfil),
            "gasto_diario": self.calcular_gasto_diario(perfil),
        }

    def _validar_peso(self, peso_kg):
        if (
            not isinstance(peso_kg, (int, float))
            or isinstance(peso_kg, bool)
        ):
            raise ValueError("O peso deve ser numérico.")

        if peso_kg <= 0:
            raise ValueError("O peso deve ser maior que zero.")

        return peso_kg

    def _validar_altura(self, altura_cm):
        if (
            not isinstance(altura_cm, (int, float))
            or isinstance(altura_cm, bool)
        ):
            raise ValueError("A altura deve ser numérica.")

        if altura_cm <= 0:
            raise ValueError("A altura deve ser maior que zero.")

        return altura_cm

    def _validar_idade(self, idade):
        if (
            not isinstance(idade, int)
            or isinstance(idade, bool)
        ):
            raise ValueError("A idade deve ser um número inteiro.")

        if idade <= 0:
            raise ValueError("A idade deve ser maior que zero.")

        return idade

    def _validar_sexo(self, sexo):
        if not isinstance(sexo, str):
            raise ValueError("O sexo é obrigatório.")

        sexo = sexo.strip().lower()

        if sexo not in self.SEXOS_VALIDOS:
            raise ValueError(
                "O sexo deve ser masculino ou feminino."
            )

        return sexo

    def _validar_nivel_atividade(self, nivel_atividade):
        if not isinstance(nivel_atividade, str):
            raise ValueError(
                "O nível de atividade é obrigatório."
            )

        nivel_atividade = nivel_atividade.strip().lower()

        if nivel_atividade not in self.FATORES_ATIVIDADE:
            raise ValueError(
                "O nível de atividade informado é inválido."
            )

        return nivel_atividade