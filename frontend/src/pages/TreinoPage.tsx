import {
  Check,
  ChevronDown,
  Clock3,
  Dumbbell,
  Plus,
  Save,
  X,
} from "lucide-react";
import {
  type FormEvent,
  useEffect,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";

import {
  buscarDivisao,
  buscarTreino,
  buscarTreinoEmAndamento,
  finalizarTreino,
  listarTreinos,
  registrarSerie,
} from "../services/academiaService";

import type {
  DivisaoTreinoDetalhada,
  Serie,
  Treino,
} from "../types/academia";

import "./TreinoPage.css";

interface SerieRascunho {
  id: string;
  peso: string;
  repeticoes: string;
  observacoes: string;
  referencia: Serie | null;
}

type RascunhosPorExercicio = Record<
  number,
  SerieRascunho[]
>;

function formatarDuracao(
  totalSegundos: number,
): string {
  const horas = Math.floor(
    totalSegundos / 3600,
  );

  const minutos = Math.floor(
    (totalSegundos % 3600) / 60,
  );

  const segundos = totalSegundos % 60;

  return [horas, minutos, segundos]
    .map((valor) =>
      String(valor).padStart(2, "0"),
    )
    .join(":");
}

function obterDataAtual(): string {
  const data = new Date();

  const ano = data.getFullYear();

  const mes = String(
    data.getMonth() + 1,
  ).padStart(2, "0");

  const dia = String(
    data.getDate(),
  ).padStart(2, "0");

  return `${ano}-${mes}-${dia}`;
}

function obterMomentoTreino(
  treino: Treino,
): number {
  const data =
    treino.finalizado_em ??
    treino.iniciado_em;

  return new Date(data).getTime();
}

function criarRascunhosIniciais(
  divisao: DivisaoTreinoDetalhada,
  seriesAtuais: Serie[],
  seriesAnteriores: Serie[],
): RascunhosPorExercicio {
  const rascunhos: RascunhosPorExercicio =
    {};

  divisao.exercicios.forEach((exercicio) => {
    const quantidadeAtual =
      seriesAtuais.filter(
        (serie) =>
          serie.exercicio_id ===
          exercicio.exercicio_id,
      ).length;

    const referencias =
      seriesAnteriores
        .filter(
          (serie) =>
            serie.exercicio_id ===
            exercicio.exercicio_id,
        )
        .sort((a, b) => a.id - b.id)
        .slice(quantidadeAtual);

    rascunhos[exercicio.exercicio_id] =
      referencias.map((serie) => ({
        id: `referencia-${serie.id}`,
        peso: "",
        repeticoes: "",
        observacoes: "",
        referencia: serie,
      }));
  });

  return rascunhos;
}

async function buscarSeriesUltimoTreinoPreenchido(
  treinos: Treino[],
  treinoAtual: Treino,
): Promise<Serie[]> {
  const treinosAnteriores = treinos
    .filter(
      (item) =>
        item.id !== treinoAtual.id &&
        item.divisao_id ===
          treinoAtual.divisao_id &&
        item.finalizado,
    )
    .sort(
      (a, b) =>
        obterMomentoTreino(b) -
        obterMomentoTreino(a),
    );

  for (const treinoAnterior of treinosAnteriores) {
    const treinoDetalhado =
      await buscarTreino(treinoAnterior.id);

    if (treinoDetalhado.series.length > 0) {
      return treinoDetalhado.series;
    }
  }

  return [];
}

function TreinoPage() {
  const navigate = useNavigate();

  const [treino, setTreino] =
    useState<Treino | null>(null);

  const [divisao, setDivisao] =
    useState<DivisaoTreinoDetalhada | null>(
      null,
    );

  const [series, setSeries] = useState<
    Serie[]
  >([]);

  const [
    rascunhosPorExercicio,
    setRascunhosPorExercicio,
  ] = useState<RascunhosPorExercicio>({});

  const [
    salvandoRascunhoId,
    setSalvandoRascunhoId,
  ] = useState<string | null>(null);

  const [carregando, setCarregando] =
    useState(true);

  const [finalizando, setFinalizando] =
    useState(false);

  const [erro, setErro] = useState<
    string | null
  >(null);

  const [
    tempoDecorridoSegundos,
    setTempoDecorridoSegundos,
  ] = useState(0);

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

      const [
        divisaoAtual,
        treinoDetalhado,
        todosTreinos,
      ] = await Promise.all([
        buscarDivisao(
          treinoAtual.divisao_id,
        ),
        buscarTreino(treinoAtual.id),
        listarTreinos(),
      ]);

      const seriesAnteriores =
        await buscarSeriesUltimoTreinoPreenchido(
          todosTreinos,
          treinoAtual,
        );

      setTreino(treinoAtual);
      setDivisao(divisaoAtual);
      setSeries(treinoDetalhado.series);

      setRascunhosPorExercicio(
        criarRascunhosIniciais(
          divisaoAtual,
          treinoDetalhado.series,
          seriesAnteriores,
        ),
      );
    } catch (erroCarregamento) {
      console.error(
        "Erro ao carregar treino:",
        erroCarregamento,
      );

      setErro(
        "Não foi possível carregar o treino.",
      );
    } finally {
      setCarregando(false);
    }
  }

  void carregarTreino();
}, [navigate]);

useEffect(() => {
  if (!treino) {
    setTempoDecorridoSegundos(0);
    return;
  }

  const iniciadoEm = treino.iniciado_em;

  function atualizarCronometro() {
    const inicio = new Date(
      iniciadoEm,
    ).getTime();

    if (Number.isNaN(inicio)) {
      setTempoDecorridoSegundos(0);
      return;
    }

    const totalSegundos = Math.floor(
      (Date.now() - inicio) / 1000,
    );

    setTempoDecorridoSegundos(
      Math.max(0, totalSegundos),
    );
  }

  atualizarCronometro();

  const intervalo = window.setInterval(
    atualizarCronometro,
    1000,
  );

  return () => {
    window.clearInterval(intervalo);
  };
}, [treino]);

  function adicionarRascunho(
    exercicioId: number,
  ) {
    const novoRascunho: SerieRascunho = {
      id: `novo-${exercicioId}-${Date.now()}`,
      peso: "",
      repeticoes: "",
      observacoes: "",
      referencia: null,
    };

    setRascunhosPorExercicio(
      (rascunhosAtuais) => ({
        ...rascunhosAtuais,
        [exercicioId]: [
          ...(rascunhosAtuais[
            exercicioId
          ] ?? []),
          novoRascunho,
        ],
      }),
    );
  }

  function atualizarRascunho(
    exercicioId: number,
    rascunhoId: string,
    campo:
      | "peso"
      | "repeticoes"
      | "observacoes",
    valor: string,
  ) {
    setRascunhosPorExercicio(
      (rascunhosAtuais) => ({
        ...rascunhosAtuais,
        [exercicioId]: (
          rascunhosAtuais[exercicioId] ?? []
        ).map((rascunho) =>
          rascunho.id === rascunhoId
            ? {
                ...rascunho,
                [campo]: valor,
              }
            : rascunho,
        ),
      }),
    );
  }

  function removerRascunho(
    exercicioId: number,
    rascunhoId: string,
  ) {
    if (
      salvandoRascunhoId === rascunhoId
    ) {
      return;
    }

    setRascunhosPorExercicio(
      (rascunhosAtuais) => ({
        ...rascunhosAtuais,
        [exercicioId]: (
          rascunhosAtuais[exercicioId] ?? []
        ).filter(
          (rascunho) =>
            rascunho.id !== rascunhoId,
        ),
      }),
    );
  }

  async function salvarRascunho(
    evento: FormEvent<HTMLFormElement>,
    exercicioId: number,
    rascunhoId: string,
  ) {
    evento.preventDefault();

    if (
      !treino ||
      salvandoRascunhoId !== null
    ) {
      return;
    }

    const rascunho = (
      rascunhosPorExercicio[
        exercicioId
      ] ?? []
    ).find(
      (item) => item.id === rascunhoId,
    );

    if (!rascunho) {
      return;
    }

    const pesoTexto =
      rascunho.peso.trim() ||
      (rascunho.referencia
        ? String(
            rascunho.referencia.peso,
          )
        : "");

    const repeticoesTexto =
      rascunho.repeticoes.trim() ||
      (rascunho.referencia
        ? String(
            rascunho.referencia
              .repeticoes,
          )
        : "");

    const pesoNumero = Number(pesoTexto);
    const repeticoesNumero = Number(
      repeticoesTexto,
    );

    if (
      !Number.isFinite(pesoNumero) ||
      pesoNumero < 0
    ) {
      setErro("Informe um peso válido.");
      return;
    }

    if (
      !Number.isInteger(
        repeticoesNumero,
      ) ||
      repeticoesNumero <= 0
    ) {
      setErro(
        "Informe uma quantidade válida de repetições.",
      );
      return;
    }

    try {
      setSalvandoRascunhoId(
        rascunhoId,
      );
      setErro(null);

      const novaSerie =
        await registrarSerie({
          treino_id: treino.id,
          exercicio_id: exercicioId,
          data: obterDataAtual(),
          peso: pesoNumero,
          repeticoes:
            repeticoesNumero,
          observacoes:
            rascunho.observacoes.trim() ||
            null,
        });

      setSeries((seriesAtuais) => [
        ...seriesAtuais,
        novaSerie,
      ]);

      removerRascunho(
        exercicioId,
        rascunhoId,
      );
    } catch {
      setErro(
        "Não foi possível registrar a série.",
      );
    } finally {
      setSalvandoRascunhoId(null);
    }
  }

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

  if (!treino || !divisao) {
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
            Duração{" "}
            <strong>
              {formatarDuracao(
                tempoDecorridoSegundos,
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
          {divisao.exercicios.map((exercicio) => {
            const seriesDoExercicio = series
              .filter(
                (serie) =>
                  serie.exercicio_id ===
                  exercicio.exercicio_id,
              )
              .sort((a, b) => a.id - b.id);

            const rascunhos =
              rascunhosPorExercicio[
                exercicio.exercicio_id
              ] ?? [];

            return (
              <details
                key={exercicio.id}
                className="treino-exercise"
              >
                <summary className="treino-exercise__summary">
                  <div className="treino-exercise__order">
                    {exercicio.ordem}
                  </div>

                  <div className="treino-exercise__content">
                    <h3>{exercicio.nome}</h3>

                    <p>{exercicio.grupo_muscular}</p>
                  </div>

                  <span className="treino-exercise__count">
                    {seriesDoExercicio.length}{" "}
                    {seriesDoExercicio.length === 1
                      ? "registrada"
                      : "registradas"}
                  </span>

                  <ChevronDown
                    className="treino-exercise__chevron"
                    size={20}
                    aria-hidden="true"
                  />
                </summary>

                <div className="treino-exercise__body">
                  {seriesDoExercicio.length > 0 && (
                    <div className="treino-series-list">
                      {seriesDoExercicio.map(
                        (serie, indice) => (
                          <div
                            key={serie.id}
                            className="treino-series-item"
                          >
                            <span>
                              Série {indice + 1}
                            </span>

                            <strong>
                              {serie.peso.toLocaleString(
                                "pt-BR",
                              )}{" "}
                              kg
                            </strong>

                            <strong>
                              {serie.repeticoes} reps
                            </strong>
                          </div>
                        ),
                      )}
                    </div>
                  )}

                  {rascunhos.map(
                    (rascunho, indice) => {
                      const numeroSerie =
                        seriesDoExercicio.length +
                        indice +
                        1;

                      const salvando =
                        salvandoRascunhoId ===
                        rascunho.id;

                      return (
                        <details
                          key={rascunho.id}
                          className="treino-serie-card"
                        >
                          <summary className="treino-serie-card__summary">
                            <div>
                              <strong>
                                Série {numeroSerie}
                              </strong>

                              {rascunho.referencia ? (
                                <span>
                                  Último treino:{" "}
                                  {rascunho.referencia.peso.toLocaleString(
                                    "pt-BR",
                                  )}{" "}
                                  kg ×{" "}
                                  {
                                    rascunho.referencia
                                      .repeticoes
                                  }{" "}
                                  reps
                                </span>
                              ) : (
                                <span>Nova série</span>
                              )}
                            </div>

                            <ChevronDown
                              className="treino-serie-card__chevron"
                              size={19}
                              aria-hidden="true"
                            />
                          </summary>

                          <form
                            className="treino-serie-form"
                            onSubmit={(evento) =>
                              void salvarRascunho(
                                evento,
                                exercicio.exercicio_id,
                                rascunho.id,
                              )
                            }
                          >
                            <div className="treino-serie-form__grid">
                              <label>
                                <span>Peso</span>

                                <div className="treino-serie-form__input">
                                  <input
                                    min="0"
                                    step="0.5"
                                    type="number"
                                    inputMode="decimal"
                                    placeholder={
                                      rascunho.referencia
                                        ? String(
                                            rascunho
                                              .referencia
                                              .peso,
                                          )
                                        : "0"
                                    }
                                    value={rascunho.peso}
                                    onChange={(evento) =>
                                      atualizarRascunho(
                                        exercicio.exercicio_id,
                                        rascunho.id,
                                        "peso",
                                        evento.target
                                          .value,
                                      )
                                    }
                                  />

                                  <span>kg</span>
                                </div>
                              </label>

                              <label>
                                <span>Repetições</span>

                                <div className="treino-serie-form__input">
                                  <input
                                    min="1"
                                    step="1"
                                    type="number"
                                    inputMode="numeric"
                                    placeholder={
                                      rascunho.referencia
                                        ? String(
                                            rascunho
                                              .referencia
                                              .repeticoes,
                                          )
                                        : "0"
                                    }
                                    value={
                                      rascunho.repeticoes
                                    }
                                    onChange={(evento) =>
                                      atualizarRascunho(
                                        exercicio.exercicio_id,
                                        rascunho.id,
                                        "repeticoes",
                                        evento.target
                                          .value,
                                      )
                                    }
                                  />

                                  <span>reps</span>
                                </div>
                              </label>

                              <label className="treino-serie-form__observacoes">
                                <span>Observações</span>

                                <input
                                  type="text"
                                  maxLength={200}
                                  placeholder={
                                    rascunho.referencia
                                      ?.observacoes ??
                                    "Opcional"
                                  }
                                  value={
                                    rascunho.observacoes
                                  }
                                  onChange={(evento) =>
                                    atualizarRascunho(
                                      exercicio.exercicio_id,
                                      rascunho.id,
                                      "observacoes",
                                      evento.target
                                        .value,
                                    )
                                  }
                                />
                              </label>
                            </div>

                            <div className="treino-serie-form__actions">
                              <button
                                type="button"
                                className="treino-serie-button treino-serie-button--secondary"
                                disabled={salvando}
                                onClick={() =>
                                  removerRascunho(
                                    exercicio.exercicio_id,
                                    rascunho.id,
                                  )
                                }
                              >
                                <X size={17} />
                                Remover
                              </button>

                              <button
                                type="submit"
                                className="treino-serie-button treino-serie-button--primary"
                                disabled={
                                  salvandoRascunhoId !==
                                  null
                                }
                              >
                                <Save size={17} />

                                {salvando
                                  ? "Salvando..."
                                  : "Registrar série"}
                              </button>
                            </div>
                          </form>
                        </details>
                      );
                    },
                  )}

                  <button
                    type="button"
                    className="treino-add-serie"
                    onClick={() =>
                      adicionarRascunho(
                        exercicio.exercicio_id,
                      )
                    }
                  >
                    <Plus size={17} />
                    Adicionar série
                  </button>
                </div>
              </details>
            );
          })}
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