class Exercicio:

    def __init__(self, nome, grupo_muscular, id=None):
        self.id = id
        self.nome = nome
        self.grupo_muscular = grupo_muscular

    def __str__(self):
        return f"{self.nome} - {self.grupo_muscular}"