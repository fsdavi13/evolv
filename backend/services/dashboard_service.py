from datetime import date

from backend.services.academia_service import AcademiaService
from backend.services.corrida_service import CorridaService
from backend.services.dieta_service import DietaService


class DashboardService:
    def __init__(
        self,
        academia_service=None,
        corrida_service=None,
        dieta_service=None,
    ):
        self.academia_service = academia_service or AcademiaService()
        self.corrida_service = corrida_service or CorridaService()
        self.dieta_service = dieta_service or DietaService()

    def obter_resumo(self, data_referencia=None):
        data_referencia = self._normalizar_data(data_referencia)

        return {
            "data": data_referencia,
            "academia": self._obter_resumo_academia(
                data_referencia
            ),
            "corrida": self._obter_resumo_corrida(
                data_referencia
            ),
            "dieta": self._obter_resumo_dieta(
                data_referencia
            ),
        }

    def _obter_resumo_academia(self, data_referencia):
        series = self.academia_service.listar_series()

        series_do_dia = [
            serie
            for serie in series
            if serie.data == data_referencia
        ]

        volume_total = sum(
            serie.calcular_volume()
            for serie in series_do_dia
        )

        exercicios_realizados = {
            serie.exercicio_id
            for serie in series_do_dia
        }

        return {
            "quantidade_series": len(series_do_dia),
            "quantidade_exercicios": len(
                exercicios_realizados
            ),
            "volume_total": round(volume_total, 2),
        }

    def _obter_resumo_corrida(self, data_referencia):
        corridas = self.corrida_service.listar_corridas()

        corridas_do_dia = [
            corrida
            for corrida in corridas
            if corrida.data == data_referencia
        ]

        distancia_total = sum(
            corrida.distancia_km
            for corrida in corridas_do_dia
        )

        tempo_total_segundos = sum(
            corrida.calcular_tempo_segundos() or 0
            for corrida in corridas_do_dia
        )

        melhor_pace = self._obter_melhor_pace(
            corridas_do_dia
        )

        return {
            "quantidade_corridas": len(corridas_do_dia),
            "distancia_total_km": round(
                distancia_total,
                2,
            ),
            "tempo_total_segundos": tempo_total_segundos,
            "melhor_pace": melhor_pace,
        }

    def _obter_resumo_dieta(self, data_referencia):
        registros = (
            self.dieta_service.buscar_registros_por_data(
                data_referencia
            )
        )

        totais = {
            "calorias": 0,
            "proteinas_g": 0,
            "carboidratos_g": 0,
            "gorduras_g": 0,
        }

        for registro in registros:
            macros = (
                self.dieta_service.calcular_macros_alimento(
                    alimento_id=registro.alimento_id,
                    quantidade_gramas=(
                        registro.quantidade_gramas
                    ),
                )
            )

            totais["calorias"] += macros["calorias"]
            totais["proteinas_g"] += macros["proteinas_g"]
            totais["carboidratos_g"] += (
                macros["carboidratos_g"]
            )
            totais["gorduras_g"] += macros["gorduras_g"]

        for nutriente in totais:
            totais[nutriente] = round(
                totais[nutriente],
                2,
            )

        return {
            "quantidade_registros": len(registros),
            **totais,
        }

    def _obter_melhor_pace(self, corridas):
        corridas_com_pace = [
            corrida
            for corrida in corridas
            if corrida.pace_segundos is not None
        ]

        if not corridas_com_pace:
            return None

        melhor_corrida = min(
            corridas_com_pace,
            key=lambda corrida: corrida.pace_segundos,
        )

        return melhor_corrida.pace

    def _normalizar_data(self, data_referencia):
        if data_referencia is None:
            return date.today()

        if not isinstance(data_referencia, date):
            raise ValueError(
                "A data de referência é inválida."
            )

        return data_referencia