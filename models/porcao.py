class Porcao:

    def __init__(
        self,
        alimento_id,
        descricao,
        gramas,
        id=None
    ):

        self.id = id
        self.alimento_id = alimento_id
        self.descricao = descricao
        self.gramas = gramas