from dao.corrida_dao import CorridaDAO
from models.corrida import Corrida


class CorridaService:

    def __init__(self):
        self.corrida_dao = CorridaDAO()

    def registrar_corrida(
        self,
        data,
        distancia_km,
        pace,
        observacoes=None
    ):
        self._validar_dados_corrida(
            data=data,
            distancia_km=distancia_km,
            pace=pace
        )

        observacoes = self._normalizar_observacoes(observacoes)

        corrida = Corrida(
            data=data,
            distancia_km=distancia_km,
            pace=pace,
            observacoes=observacoes
        )

        return self.corrida_dao.criar(corrida)

    def listar_corridas(self):
        return self.corrida_dao.buscar_todas()

    def buscar_corrida_por_id(self, corrida_id):
        corrida = self.corrida_dao.buscar_por_id(corrida_id)

        if corrida is None:
            raise ValueError("Corrida não encontrada.")

        return corrida

    def atualizar_corrida(
        self,
        corrida_id,
        data,
        distancia_km,
        pace,
        observacoes=None
    ):
        self.buscar_corrida_por_id(corrida_id)

        self._validar_dados_corrida(
            data=data,
            distancia_km=distancia_km,
            pace=pace
        )

        observacoes = self._normalizar_observacoes(observacoes)

        corrida = Corrida(
            id=corrida_id,
            data=data,
            distancia_km=distancia_km,
            pace=pace,
            observacoes=observacoes
        )

        self.corrida_dao.atualizar(corrida)

        return corrida

    def excluir_corrida(self, corrida_id):
        self.buscar_corrida_por_id(corrida_id)
        self.corrida_dao.deletar(corrida_id)

    def _validar_dados_corrida(
        self,
        data,
        distancia_km,
        pace
    ):
        if data is None:
            raise ValueError("A data da corrida é obrigatória.")

        if not isinstance(distancia_km, (int, float)):
            raise ValueError("A distância deve ser um número.")

        if distancia_km <= 0:
            raise ValueError(
                "A distância deve ser maior que zero."
            )

        self._validar_pace(pace)

    def _validar_pace(self, pace):
        if not isinstance(pace, str) or not pace.strip():
            raise ValueError("O pace é obrigatório.")

        partes = pace.split(":")

        if len(partes) != 2:
            raise ValueError(
                "O pace deve estar no formato MM:SS."
            )

        minutos, segundos = partes

        if not minutos.isdigit() or not segundos.isdigit():
            raise ValueError(
                "O pace deve estar no formato MM:SS."
            )

        minutos = int(minutos)
        segundos = int(segundos)

        if segundos < 0 or segundos > 59:
            raise ValueError(
                "Os segundos do pace devem estar entre 00 e 59."
            )

        if minutos == 0 and segundos == 0:
            raise ValueError(
                "O pace deve ser maior que zero."
            )

    def _normalizar_observacoes(self, observacoes):
        if observacoes is None:
            return None

        observacoes = observacoes.strip()

        if not observacoes:
            return None

        return observacoes