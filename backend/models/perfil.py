class Perfil:
    def __init__(
        self,
        peso_kg,
        altura_cm,
        idade,
        sexo,
        nivel_atividade,
        id=1,
    ):
        self.id = id
        self.peso_kg = peso_kg
        self.altura_cm = altura_cm
        self.idade = idade
        self.sexo = sexo
        self.nivel_atividade = nivel_atividade