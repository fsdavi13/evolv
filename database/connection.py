import sqlite3
from contextlib import contextmanager

from config import DATABASE_PATH, SCHEMA_PATH


@contextmanager
def conexao():
    DATABASE_PATH.parent.mkdir(parents=True, exist_ok=True)

    con = sqlite3.connect(DATABASE_PATH)
    con.row_factory = sqlite3.Row
    con.execute("PRAGMA foreign_keys = ON")

    try:
        yield con
        con.commit()
    except Exception:
        con.rollback()
        raise
    finally:
        con.close()


def inicializar_banco() -> None:
    schema_sql = SCHEMA_PATH.read_text(encoding="utf-8")
    with conexao() as con:
        con.executescript(schema_sql)