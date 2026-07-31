import {
  CalendarDays,
  Gauge,
  Pencil,
  Plus,
  Route,
  Timer,
  Trash2,
  X,
} from "lucide-react";
import {
  type FormEvent,
  useEffect,
  useState,
} from "react";

import {
  editarCorrida,
  excluirCorrida,
  listarCorridas,
  registrarCorrida,
} from "../services/corridaService";

import type {
  Corrida,
  CorridaPayload,
} from "../types/corrida";

import "./CorridasPage.css";

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

function formatarData(data: string): string {
  const [ano, mes, dia] = data
    .split("-")
    .map(Number);

  return new Intl.DateTimeFormat(
    "pt-BR",
  ).format(new Date(ano, mes - 1, dia));
}

function formatarTempo(
  totalSegundos: number,
): string {
  const horas = Math.floor(
    totalSegundos / 3600,
  );

  const minutos = Math.floor(
    (totalSegundos % 3600) / 60,
  );

  const segundos = totalSegundos % 60;

  if (horas > 0) {
    return `${horas}h ${String(
      minutos,
    ).padStart(2, "0")}min`;
  }

  return `${minutos}:${String(
    segundos,
  ).padStart(2, "0")}`;
}

function paceValido(pace: string): boolean {
  return /^\d{1,2}:[0-5]\d$/.test(pace);
}

function CorridasPage() {
  const [corridas, setCorridas] = useState<
    Corrida[]
  >([]);

  const [data, setData] = useState(
    obterDataAtual(),
  );

  const [distancia, setDistancia] =
    useState("");

  const [pace, setPace] = useState("");

  const [observacoes, setObservacoes] =
    useState("");

  const [
    corridaEditandoId,
    setCorridaEditandoId,
  ] = useState<number | null>(null);

  const [carregando, setCarregando] =
    useState(true);

  const [salvando, setSalvando] =
    useState(false);

  const [excluindoId, setExcluindoId] =
    useState<number | null>(null);

  const [erro, setErro] = useState<
    string | null
  >(null);

  useEffect(() => {
    async function carregarCorridas() {
      try {
        setCarregando(true);
        setErro(null);

        const lista =
          await listarCorridas();

        setCorridas(lista);
      } catch {
        setErro(
          "Não foi possível carregar as corridas.",
        );
      } finally {
        setCarregando(false);
      }
    }

    void carregarCorridas();
  }, []);

  function limparFormulario() {
    setCorridaEditandoId(null);
    setData(obterDataAtual());
    setDistancia("");
    setPace("");
    setObservacoes("");
  }

  function iniciarEdicao(corrida: Corrida) {
    setCorridaEditandoId(corrida.id);
    setData(corrida.data);
    setDistancia(
      String(corrida.distancia_km),
    );
    setPace(corrida.pace);
    setObservacoes(
      corrida.observacoes ?? "",
    );
    setErro(null);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function cancelarEdicao() {
    if (salvando) {
      return;
    }

    limparFormulario();
    setErro(null);
  }

  async function salvarCorrida(
    evento: FormEvent<HTMLFormElement>,
  ) {
    evento.preventDefault();

    if (salvando) {
      return;
    }

    const distanciaNumero = Number(
      distancia,
    );

    if (
      !Number.isFinite(distanciaNumero) ||
      distanciaNumero <= 0
    ) {
      setErro(
        "Informe uma distância válida.",
      );
      return;
    }

    if (!paceValido(pace)) {
      setErro(
        "Informe o pace no formato 06:30.",
      );
      return;
    }

    const payload: CorridaPayload = {
      data,
      distancia_km: distanciaNumero,
      pace,
      observacoes:
        observacoes.trim() || null,
    };

    try {
      setSalvando(true);
      setErro(null);

      if (corridaEditandoId !== null) {
        const corridaAtualizada =
          await editarCorrida(
            corridaEditandoId,
            payload,
          );

        setCorridas((corridasAtuais) =>
          corridasAtuais.map((corrida) =>
            corrida.id ===
            corridaEditandoId
              ? corridaAtualizada
              : corrida,
          ),
        );
      } else {
        const novaCorrida =
          await registrarCorrida(payload);

        setCorridas((corridasAtuais) => [
          novaCorrida,
          ...corridasAtuais,
        ]);
      }

      limparFormulario();
    } catch {
      setErro(
        corridaEditandoId !== null
          ? "Não foi possível editar a corrida."
          : "Não foi possível registrar a corrida.",
      );
    } finally {
      setSalvando(false);
    }
  }

  async function removerCorrida(
    corrida: Corrida,
  ) {
    if (excluindoId !== null) {
      return;
    }

    const confirmou = window.confirm(
      `Deseja excluir a corrida de ${formatarData(
        corrida.data,
      )}?`,
    );

    if (!confirmou) {
      return;
    }

    try {
      setExcluindoId(corrida.id);
      setErro(null);

      await excluirCorrida(corrida.id);

      setCorridas((corridasAtuais) =>
        corridasAtuais.filter(
          (item) =>
            item.id !== corrida.id,
        ),
      );

      if (
        corridaEditandoId === corrida.id
      ) {
        limparFormulario();
      }
    } catch {
      setErro(
        "Não foi possível excluir a corrida.",
      );
    } finally {
      setExcluindoId(null);
    }
  }

  const corridasOrdenadas = [
    ...corridas,
  ].sort((a, b) => {
    const comparacaoData =
      b.data.localeCompare(a.data);

    if (comparacaoData !== 0) {
      return comparacaoData;
    }

    return b.id - a.id;
  });

  return (
    <section className="page">
      <header className="page__header">
        <p className="page__eyebrow">
          Cardio
        </p>

        <h1>Corridas</h1>

        <p>
          Registre e acompanhe seus treinos
          individualmente.
        </p>
      </header>

      <div className="corridas-layout">
        <section className="corridas-form-card">
          <header className="corridas-section-header">
            <div>
              <h2>
                {corridaEditandoId !== null
                  ? "Editar corrida"
                  : "Registrar corrida"}
              </h2>

              <p>
                {corridaEditandoId !== null
                  ? "Altere os dados do treino selecionado."
                  : "Informe a distância e o ritmo médio do treino."}
              </p>
            </div>
          </header>

          <form
            className="corridas-form"
            onSubmit={(evento) =>
              void salvarCorrida(evento)
            }
          >
            <div className="corridas-form__grid">
              <label>
                <span>Data</span>

                <div className="corridas-input">
                  <CalendarDays
                    size={18}
                    aria-hidden="true"
                  />

                  <input
                    required
                    type="date"
                    value={data}
                    onChange={(evento) =>
                      setData(
                        evento.target.value,
                      )
                    }
                  />
                </div>
              </label>

              <label>
                <span>Distância</span>

                <div className="corridas-input">
                  <Route
                    size={18}
                    aria-hidden="true"
                  />

                  <input
                    required
                    min="0.01"
                    step="0.01"
                    type="number"
                    inputMode="decimal"
                    placeholder="5,00"
                    value={distancia}
                    onChange={(evento) =>
                      setDistancia(
                        evento.target.value,
                      )
                    }
                  />

                  <small>km</small>
                </div>
              </label>

              <label>
                <span>Pace médio</span>

                <div className="corridas-input">
                  <Gauge
                    size={18}
                    aria-hidden="true"
                  />

                  <input
                    required
                    type="text"
                    inputMode="numeric"
                    maxLength={5}
                    placeholder="06:30"
                    value={pace}
                    onChange={(evento) =>
                      setPace(
                        evento.target.value,
                      )
                    }
                  />

                  <small>min/km</small>
                </div>
              </label>

              <label className="corridas-form__observacoes">
                <span>Observações</span>

                <textarea
                  maxLength={300}
                  rows={3}
                  placeholder="Opcional"
                  value={observacoes}
                  onChange={(evento) =>
                    setObservacoes(
                      evento.target.value,
                    )
                  }
                />
              </label>
            </div>

            <button
              className="corridas-submit"
              type="submit"
              disabled={salvando}
            >
              {corridaEditandoId !== null ? (
                <Pencil size={18} />
              ) : (
                <Plus size={18} />
              )}

              {salvando
                ? "Salvando..."
                : corridaEditandoId !== null
                  ? "Salvar alterações"
                  : "Registrar corrida"}
            </button>

            {corridaEditandoId !== null && (
              <button
                className="corridas-cancel-edit"
                type="button"
                disabled={salvando}
                onClick={cancelarEdicao}
              >
                <X size={18} />
                Cancelar edição
              </button>
            )}
          </form>
        </section>

        <section className="corridas-history">
          <header className="corridas-section-header">
            <div>
              <h2>Histórico</h2>

              <p>
                {corridasOrdenadas.length}{" "}
                {corridasOrdenadas.length === 1
                  ? "treino registrado"
                  : "treinos registrados"}
              </p>
            </div>
          </header>

          {erro && (
            <div
              className="corridas-error"
              role="alert"
            >
              {erro}
            </div>
          )}

          {carregando ? (
            <p className="corridas-status">
              Carregando corridas...
            </p>
          ) : corridasOrdenadas.length ===
            0 ? (
            <div className="corridas-empty">
              <Route size={28} />

              <strong>
                Nenhuma corrida registrada
              </strong>

              <p>
                Seu primeiro treino aparecerá
                aqui.
              </p>
            </div>
          ) : (
            <div className="corridas-list">
              {corridasOrdenadas.map(
                (corrida) => (
                  <article
                    key={corrida.id}
                    className="corrida-card"
                  >
                    <div className="corrida-card__header">
                      <div>
                        <span>
                          {formatarData(
                            corrida.data,
                          )}
                        </span>

                        <strong>
                          {corrida.distancia_km.toLocaleString(
                            "pt-BR",
                            {
                              maximumFractionDigits: 2,
                            },
                          )}{" "}
                          km
                        </strong>
                      </div>

                      <div className="corrida-card__actions">
                        <button
                          type="button"
                          className="corrida-card__edit"
                          aria-label="Editar corrida"
                          title="Editar corrida"
                          disabled={
                            excluindoId !== null ||
                            salvando
                          }
                          onClick={() =>
                            iniciarEdicao(
                              corrida,
                            )
                          }
                        >
                          <Pencil size={17} />
                        </button>

                        <button
                          type="button"
                          className="corrida-card__delete"
                          aria-label="Excluir corrida"
                          title="Excluir corrida"
                          disabled={
                            excluindoId !== null ||
                            salvando
                          }
                          onClick={() =>
                            void removerCorrida(
                              corrida,
                            )
                          }
                        >
                          <Trash2 size={17} />
                        </button>
                      </div>
                    </div>

                    <div className="corrida-card__metrics">
                      <div>
                        <Gauge size={17} />

                        <span>Pace</span>

                        <strong>
                          {corrida.pace}
                        </strong>
                      </div>

                      <div>
                        <Timer size={17} />

                        <span>Tempo</span>

                        <strong>
                          {formatarTempo(
                            corrida.tempo_total_segundos,
                          )}
                        </strong>
                      </div>
                    </div>

                    {corrida.observacoes && (
                      <p className="corrida-card__notes">
                        {corrida.observacoes}
                      </p>
                    )}
                  </article>
                ),
              )}
            </div>
          )}
        </section>
      </div>
    </section>
  );
}

export default CorridasPage;