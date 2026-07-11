from datetime import date


class Corrida:

    def __init__(self, data, distancia_km, pace_segundos, observacoes=None, id=None):
        self.id = id
        self.data = data
        self.distancia_km = distancia_km
        self.pace_segundos = pace_segundos
        self.observacoes = observacoes

    def calcular_tempo_total(self):
        return self.distancia_km * self.pace_segundos

    def obter_pace_formatado(self):
        minutos = self.pace_segundos // 60
        segundos = self.pace_segundos % 60

        return f"{minutos}:{segundos:02d}/km"

    def obter_tempo_formatado(self):
        tempo_total = self.calcular_tempo_total()
        horas = int(tempo_total // 3600)
        minutos = int(tempo_total // 60)
        segundos = int(tempo_total % 60)

        if horas > 0:
            return f"{horas}:{minutos:02d}:{segundos:02d}"

        return f"{minutos}:{segundos:02d}"

    def __str__(self):
        return (
            f"{self.data.strftime('%d/%m/%Y')} - "
            f"{self.distancia_km}km - "
            f"{self.obter_pace_formatado()}"
        )