CREATE TABLE IF NOT EXISTS exercicios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL UNIQUE,
    grupo_muscular TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS series (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    exercicio_id INTEGER NOT NULL,
    data TEXT NOT NULL,
    peso REAL NOT NULL,
    repeticoes INTEGER NOT NULL,
    observacoes TEXT,
    FOREIGN KEY (exercicio_id) REFERENCES exercicios (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS corridas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    data TEXT NOT NULL,
    distancia_km REAL NOT NULL,
    pace_segundos INTEGER NOT NULL,
    observacoes TEXT
);

CREATE TABLE IF NOT EXISTS alimentos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL UNIQUE,
    calorias_por_100g REAL NOT NULL,
    proteinas_g REAL,
    carboidratos_g REAL,
    gorduras_g REAL,
    categoria TEXT,
    fonte TEXT
);

CREATE TABLE IF NOT EXISTS registros_alimentares (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    alimento_id INTEGER NOT NULL,
    data TEXT NOT NULL,
    quantidade_gramas REAL NOT NULL,
    refeicao TEXT NOT NULL,
    FOREIGN KEY (alimento_id) REFERENCES alimentos (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS medidas_caseiras (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    alimento_id INTEGER NOT NULL,
    descricao TEXT NOT NULL,
    gramas REAL NOT NULL,

    FOREIGN KEY (alimento_id)
        REFERENCES alimentos(id)
        ON DELETE CASCADE
);