class Alimento:

    def __init__(self, nome, calorias_por_100g, proteinas_g, carboidratos_g, gorduras_g, categoria=None, id=None):
        self.id = id
        self.nome = nome
        self.calorias_por_100g = calorias_por_100g
        self.proteinas_g = proteinas_g
        self.carboidratos_g = carboidratos_g
        self.gorduras_g = gorduras_g
        self.categoria = categoria

    def __str__(self):
        return self.nome
