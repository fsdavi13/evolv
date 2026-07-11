import pandas as pd

from database.connection import conexao, inicializar_banco


CAMINHO_TACO = "database/seeds/taco.xlsx"


def converter_numero(valor):

    if pd.isna(valor):
        return 0

    if isinstance(valor, str):

        valor = valor.strip()

        if valor in ["Tr", "*", "-", ""]:
            return 0

        valor = valor.replace(",", ".")

    try:
        return float(valor)

    except ValueError:
        return 0



def importar_taco():

    tabela = pd.read_excel(
        CAMINHO_TACO,
        header=None
    )


    tabela.columns = [
        "numero",
        "nome",
        "umidade",
        "calorias",
        "kj",
        "proteina",
        "gordura",
        "colesterol",
        "carboidrato",
        "fibra",
        "cinzas",
        "calcio",
        "magnesio",
        "grupo",
        "manganes",
        "fosforo",
        "ferro",
        "sodio",
        "potassio",
        "cobre",
        "zinco",
        "retinol",
        "re",
        "rae",
        "tiamina",
        "riboflavina",
        "piridoxina",
        "niacina",
        "vitamina_c"
    ]


    with conexao() as con:

        categoria_atual = None


        for _, alimento in tabela.iterrows():

            numero = alimento["numero"]


            numero_convertido = pd.to_numeric(
                numero,
                errors="coerce"
            )


            # Linha de categoria
            if pd.isna(numero_convertido):

                if (
                    isinstance(alimento["numero"], str)
                    and pd.notna(alimento["numero"])
                ):

                    categoria_atual = alimento["numero"].strip()


                continue



            comando = """
                INSERT OR IGNORE INTO alimentos
                (
                    nome,
                    calorias_por_100g,
                    proteinas_g,
                    carboidratos_g,
                    gorduras_g,
                    categoria,
                    fonte
                )

                VALUES (?, ?, ?, ?, ?, ?, ?)
            """


            con.execute(
                comando,
                (
                    alimento["nome"],

                    converter_numero(
                        alimento["calorias"]
                    ),

                    converter_numero(
                        alimento["proteina"]
                    ),

                    converter_numero(
                        alimento["carboidrato"]
                    ),

                    converter_numero(
                        alimento["gordura"]
                    ),

                    categoria_atual,

                    "TACO"
                )
            )



if __name__ == "__main__":

    inicializar_banco()

    importar_taco()

    print(
        "Importação da TACO concluída!"
    )