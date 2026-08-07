import os
from pathlib import Path

DATABASE_DIR = Path(__file__).resolve().parent

DATABASE_PATH = Path(
    os.getenv(
        "EVOLV_DATABASE_PATH",
        str(DATABASE_DIR / "evolv.db"),
    )
)

TEST_DATABASE_PATH = DATABASE_DIR / "test_evolv.db"
SCHEMA_PATH = DATABASE_DIR / "schema.sql"

# Importadores
SEEDS_DIR = DATABASE_DIR / "seeds"
TACO_PATH = SEEDS_DIR / "taco.xlsx"

# Configurações da aplicação
APPEARANCE_MODE = "dark"
COLOR_THEME = "blue"

TIPOS_REFEICAO = [
    "Cafe da manha",
    "Almoco",
    "Lanche",
    "Jantar",
    "Ceia",
]

GRUPOS_MUSCULARES = [
    "Peito",
    "Costas",
    "Ombro",
    "Biceps",
    "Triceps",
    "Pernas",
    "Abdomen",
]