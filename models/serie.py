from datetime import date


class Serie:


    def __init__(self, exercicio_id, data, peso, repeticoes, observacoes=None, id=None):
        self.id = id
        self.exercicio_id = exercicio_id
        self.data = data
        self.peso = peso
        self.repeticoes = repeticoes
        self.observacoes = observacoes

    def calcular_volume(self):
        return self.peso * self.repeticoes

    def __str__(self):
        return (
            f"{self.exercicio_id} - "
            f"{self.peso}kg x "
            f"{self.repeticoes} reps"
        )
