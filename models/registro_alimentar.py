from datetime import date

class RegistroAlimentar:

    def __init__(self, alimento_id, data, quantidade_gramas, refeicao, id=None):
        self.id = id
        self.alimento_id = alimento_id
        self.data = data
        self.quantidade_gramas = quantidade_gramas
        self.refeicao = refeicao

    def calcular_calorias(self, alimento):
        return (alimento.calorias_por_100g * self.quantidade_gramas) / 100

    def calcular_proteinas(self, alimento):
        return (alimento.proteinas_g * self.quantidade_gramas) / 100

    def calcular_carboidratos(self, alimento):
        return (alimento.carboidratos_g * self.quantidade_gramas) / 100

    def calcular_gorduras(self, alimento):
        return (alimento.gorduras_g * self.quantidade_gramas) / 100

    def __str__(self):
        return (
            f"Alimento ID: {self.alimento_id} | "
            f"{self.quantidade_gramas}g | "
            f"{self.refeicao}"
        )
