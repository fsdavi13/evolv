import {
  Check,
  Clock3,
  Dumbbell,
} from "lucide-react";
import {
  useEffect,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";

import {
  buscarDivisao,
  buscarTreinoEmAndamento,
  finalizarTreino,
} from "../services/academiaService";

import type {
  DivisaoTreinoDetalhada,
  Treino,
} from "../types/academia";

import "./TreinoPage.css";

function formatarHorario(data: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(data));
}

function TreinoPage() {
  const navigate = useNavigate();

  const [treino, setTreino] =
    useState<Treino | null>(null);

  const [divisao, setDivisao] =
    useState<DivisaoTreinoDetalhada | null>(
      null,
    );

  const [carregando, setCarregando] =
    useState(true);

  const [finalizando, setFinalizando] =
    useState(false);

  const [erro, setErro] = useState<
    string | null
  >(null);

  useEffect(() => {
    async function carregarTreino() {
      try {
        setCarregando(true);
        setErro(null);

        const treinoAtual =
          await buscarTreinoEmAndamento();

        if (!treinoAtual) {
          navigate("/academia", {
            replace: true,
          });

          return;
        }

        const divisaoAtual =
          await buscarDivisao(
            treinoAtual.divisao_id,
          );

        setTreino(treinoAtual);
        setDivisao(divisaoAtual);
      } catch {
        setErro(
          "Não foi possível carregar o treino.",
        );
      } finally {
        setCarregando(false);
      }
    }

    void carregarTreino();
  }, [navigate]);

  async function concluirTreino() {
    if (!treino || finalizando) {
      return;
    }

    const confirmou = window.confirm(
      "Deseja finalizar este treino?",
    );

    if (!confirmou) {
      return;
    }

    try {
      setFinalizando(true);
      setErro(null);

      await finalizarTreino(treino.id, {
        observacoes:
          treino.observacoes ?? null,
      });

      navigate("/academia", {
        replace: true,
      });
    } catch {
      setErro(
        "Não foi possível finalizar o treino.",
      );
    } finally {
      setFinalizando(false);
    }
  }

  if (carregando) {
    return (
      <section className="page">
        <p className="treino-status">
          Carregando treino...
        </p>
      </section>
    );
  }

  if (erro || !treino || !divisao) {
    return (
      <section className="page">
        <div className="treino-error">
          {erro ??
            "Treino em andamento não encontrado."}
        </div>
      </section>
    );
  }

  return (
    <section className="page">
      <header className="page__header treino-header">
        <div>
          <p className="page__eyebrow">
            Treino em andamento
          </p>

          <h1>{treino.divisao_nome}</h1>

          <p>
            Registre suas séries conforme
            concluir os exercícios.
          </p>
        </div>

        <div className="treino-time">
          <Clock3 size={18} />

          <span>
            Iniciado às{" "}
            <strong>
              {formatarHorario(
                treino.iniciado_em,
              )}
            </strong>
          </span>
        </div>
      </header>

      <div className="treino-summary">
        <div className="treino-summary__icon">
          <Dumbbell size={24} />
        </div>

        <div>
          <span>Divisão selecionada</span>

          <strong>{divisao.nome}</strong>

          {divisao.descricao && (
            <p>{divisao.descricao}</p>
          )}
        </div>
      </div>

      <section className="treino-exercises">
        <header className="treino-exercises__header">
          <div>
            <h2>Exercícios</h2>

            <p>
              {divisao.exercicios.length}{" "}
              {divisao.exercicios.length === 1
                ? "exercício"
                : "exercícios"}
            </p>
          </div>
        </header>

        <div className="treino-exercises__list">
          {divisao.exercicios.map(
            (exercicio) => (
              <article
                key={exercicio.id}
                className="treino-exercise"
              >
                <div className="treino-exercise__order">
                  {exercicio.ordem}
                </div>

                <div className="treino-exercise__content">
                  <h3>{exercicio.nome}</h3>

                  <p>
                    {
                      exercicio.grupo_muscular
                    }
                  </p>
                </div>
              </article>
            ),
          )}
        </div>
      </section>

      {erro && (
        <div
          className="treino-error"
          role="alert"
        >
          {erro}
        </div>
      )}

      <footer className="treino-footer">
        <button
          type="button"
          className="treino-finish-button"
          disabled={finalizando}
          onClick={() =>
            void concluirTreino()
          }
        >
          <Check size={18} />

          {finalizando
            ? "Finalizando..."
            : "Finalizar treino"}
        </button>
      </footer>
    </section>
  );
}

export default TreinoPage;