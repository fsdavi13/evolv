from datetime import datetime


class Treino:
    def __init__(
        self,
        divisao_id,
        iniciado_em,
        finalizado_em=None,
        observacoes=None,
        id=None,
        divisao_nome=None,
    ):
        self.id = id
        self.divisao_id = divisao_id
        self.iniciado_em = iniciado_em
        self.finalizado_em = finalizado_em
        self.observacoes = observacoes
        self.divisao_nome = divisao_nome

    @property
    def finalizado(self):
        return self.finalizado_em is not None

    def finalizar(self, finalizado_em=None):
        self.finalizado_em = (
            finalizado_em or datetime.now()
        )

    def __str__(self):
        nome = self.divisao_nome or self.divisao_id

        return (
            f"{nome} - "
            f"{self.iniciado_em.strftime('%d/%m/%Y %H:%M')}"
        )