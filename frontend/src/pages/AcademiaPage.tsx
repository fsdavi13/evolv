import axios from "axios";
import {
  Dumbbell,
  Pencil,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";
import {
  type ChangeEvent,
  type FormEvent,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  adicionarExercicioDivisao,
  atualizarDivisao,
  buscarDivisao,
  criarDivisao,
  criarExercicio,
  excluirDivisao,
  listarDivisoes,
  listarExercicios,
  removerExercicioDivisao,
} from "../services/academiaService";

import type {
  DivisaoTreino,
  DivisaoTreinoDetalhada,
  Exercicio,
  ExercicioPayload,
} from "../types/academia";

import "./AcademiaPage.css";

const formularioDivisaoInicial = {
  nome: "",
  descricao: "",
};

const formularioExercicioInicial: ExercicioPayload = {
  nome: "",
  grupo_muscular: "",
};

const gruposMuscularesPadrao = [
  "Abdômen",
  "Antebraço",
  "Bíceps",
  "Costas",
  "Glúteos",
  "Ombros",
  "Panturrilhas",
  "Peitoral",
  "Posterior de coxa",
  "Quadríceps",
  "Trapézio",
  "Tríceps",
];

function normalizarTexto(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("pt-BR")
    .trim();
}

function obterMensagemErro(erro: unknown): string {
  if (axios.isAxiosError(erro)) {
    const detalhe = erro.response?.data?.detail;

    if (typeof detalhe === "string") {
      return detalhe;
    }
  }

  return "Não foi possível concluir a operação.";
}

function AcademiaPage() {
  const [divisoes, setDivisoes] = useState<
    DivisaoTreino[]
  >([]);

  const [
    divisaoSelecionadaId,
    setDivisaoSelecionadaId,
  ] = useState<number | null>(null);

  const [
    divisaoSelecionada,
    setDivisaoSelecionada,
  ] = useState<DivisaoTreinoDetalhada | null>(
    null,
  );

  const [divisaoEmEdicaoId, setDivisaoEmEdicaoId] =
    useState<number | null>(null);

  const [exercicios, setExercicios] = useState<
    Exercicio[]
  >([]);

  const [
    grupoMuscularSelecionado,
    setGrupoMuscularSelecionado,
  ] = useState("");

  const [
    pesquisaExercicio,
    setPesquisaExercicio,
  ] = useState("");

  const [
    modalDivisaoAberto,
    setModalDivisaoAberto,
  ] = useState(false);

  const [
    modalExercicioAberto,
    setModalExercicioAberto,
  ] = useState(false);

  const [
    formularioDivisao,
    setFormularioDivisao,
  ] = useState(formularioDivisaoInicial);

  const [
    formularioExercicio,
    setFormularioExercicio,
  ] = useState<ExercicioPayload>(
    formularioExercicioInicial,
  );

  const [carregando, setCarregando] =
    useState(true);

  const [
    carregandoDivisao,
    setCarregandoDivisao,
  ] = useState(false);

  const [salvando, setSalvando] =
    useState(false);

  const [excluindo, setExcluindo] =
    useState(false);

  const [erro, setErro] = useState<
    string | null
  >(null);

  const [
    erroFormulario,
    setErroFormulario,
  ] = useState<string | null>(null);

  useEffect(() => {
    async function carregarDadosIniciais() {
      try {
        setCarregando(true);
        setErro(null);

        const [
          divisoesEncontradas,
          exerciciosEncontrados,
        ] = await Promise.all([
          listarDivisoes(),
          listarExercicios(),
        ]);

        setDivisoes(divisoesEncontradas);
        setExercicios(exerciciosEncontrados);

        if (divisoesEncontradas.length > 0) {
          setDivisaoSelecionadaId(
            divisoesEncontradas[0].id,
          );
        }
      } catch {
        setErro(
          "Não foi possível carregar os dados da academia.",
        );
      } finally {
        setCarregando(false);
      }
    }

    void carregarDadosIniciais();
  }, []);

  useEffect(() => {
    if (divisaoSelecionadaId === null) {
      setDivisaoSelecionada(null);
      return;
    }

    async function carregarDivisaoSelecionada() {
      try {
        setCarregandoDivisao(true);
        setErro(null);

        const divisao = await buscarDivisao(
          divisaoSelecionadaId as number,
        );

        setDivisaoSelecionada(divisao);
      } catch {
        setErro(
          "Não foi possível carregar a divisão selecionada.",
        );
      } finally {
        setCarregandoDivisao(false);
      }
    }

    void carregarDivisaoSelecionada();
  }, [divisaoSelecionadaId]);

  const gruposMusculares = useMemo(() => {
    const gruposExistentes = exercicios
      .map((exercicio) =>
        exercicio.grupo_muscular.trim(),
      )
      .filter(Boolean);

    const grupos = [
      ...gruposMuscularesPadrao,
      ...gruposExistentes,
    ];

    return Array.from(new Set(grupos)).sort(
      (primeiro, segundo) =>
        primeiro.localeCompare(
          segundo,
          "pt-BR",
        ),
    );
  }, [exercicios]);

  const exerciciosDisponiveis = useMemo(() => {
    if (!grupoMuscularSelecionado) {
      return [];
    }

    const idsJaAdicionados = new Set(
      divisaoSelecionada?.exercicios.map(
        (item) => item.exercicio_id,
      ) ?? [],
    );

    const grupoNormalizado = normalizarTexto(
      grupoMuscularSelecionado,
    );

    const termo = normalizarTexto(
      pesquisaExercicio,
    );

    return exercicios.filter((exercicio) => {
      if (idsJaAdicionados.has(exercicio.id)) {
        return false;
      }

      const pertenceAoGrupo =
        normalizarTexto(
          exercicio.grupo_muscular,
        ) === grupoNormalizado;

      if (!pertenceAoGrupo) {
        return false;
      }

      if (!termo) {
        return true;
      }

      return normalizarTexto(
        exercicio.nome,
      ).includes(termo);
    });
  }, [
    divisaoSelecionada,
    exercicios,
    grupoMuscularSelecionado,
    pesquisaExercicio,
  ]);

  const sugestoesExercicio = useMemo(() => {
    const termo = normalizarTexto(
      formularioExercicio.nome,
    );

    if (!termo || !grupoMuscularSelecionado) {
      return [];
    }

    const idsJaAdicionados = new Set(
      divisaoSelecionada?.exercicios.map(
        (item) => item.exercicio_id,
      ) ?? [],
    );

    const grupoNormalizado = normalizarTexto(
      grupoMuscularSelecionado,
    );

    return exercicios
      .filter((exercicio) => {
        if (idsJaAdicionados.has(exercicio.id)) {
          return false;
        }

        const pertenceAoGrupo =
          normalizarTexto(
            exercicio.grupo_muscular,
          ) === grupoNormalizado;

        const nomeParecido =
          normalizarTexto(
            exercicio.nome,
          ).includes(termo);

        return pertenceAoGrupo && nomeParecido;
      })
      .slice(0, 5);
  }, [
    divisaoSelecionada,
    exercicios,
    formularioExercicio.nome,
    grupoMuscularSelecionado,
  ]);

  function abrirModalCriarDivisao() {
    setDivisaoEmEdicaoId(null);
    setFormularioDivisao(
      formularioDivisaoInicial,
    );
    setErroFormulario(null);
    setModalDivisaoAberto(true);
  }

  function abrirModalEditarDivisao() {
    if (!divisaoSelecionada) {
      return;
    }

    setDivisaoEmEdicaoId(
      divisaoSelecionada.id,
    );

    setFormularioDivisao({
      nome: divisaoSelecionada.nome,
      descricao:
        divisaoSelecionada.descricao ?? "",
    });

    setErroFormulario(null);
    setModalDivisaoAberto(true);
  }

  function fecharModalDivisao() {
    if (salvando) {
      return;
    }

    setModalDivisaoAberto(false);
    setDivisaoEmEdicaoId(null);
    setFormularioDivisao(
      formularioDivisaoInicial,
    );
    setErroFormulario(null);
  }

  function abrirModalExercicio() {
    if (!divisaoSelecionada) {
      return;
    }

    setGrupoMuscularSelecionado("");
    setPesquisaExercicio("");
    setFormularioExercicio(
      formularioExercicioInicial,
    );
    setErroFormulario(null);
    setModalExercicioAberto(true);
  }

  function fecharModalExercicio() {
    if (salvando) {
      return;
    }

    setModalExercicioAberto(false);
    setGrupoMuscularSelecionado("");
    setPesquisaExercicio("");
    setFormularioExercicio(
      formularioExercicioInicial,
    );
    setErroFormulario(null);
  }

  function atualizarCampoDivisao(
    evento: ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement
    >,
  ) {
    const { name, value } = evento.target;

    setFormularioDivisao((dadosAtuais) => ({
      ...dadosAtuais,
      [name]: value,
    }));

    setErroFormulario(null);
  }

  function atualizarNomeExercicio(
    evento: ChangeEvent<HTMLInputElement>,
  ) {
    setFormularioExercicio(
      (dadosAtuais) => ({
        ...dadosAtuais,
        nome: evento.target.value,
      }),
    );

    setErroFormulario(null);
  }

  function selecionarGrupoMuscular(
    evento: ChangeEvent<HTMLSelectElement>,
  ) {
    const grupo = evento.target.value;

    setGrupoMuscularSelecionado(grupo);
    setPesquisaExercicio("");

    setFormularioExercicio({
      nome: "",
      grupo_muscular: grupo,
    });

    setErroFormulario(null);
  }

  async function enviarDivisao(
    evento: FormEvent<HTMLFormElement>,
  ) {
    evento.preventDefault();

    const nome = formularioDivisao.nome.trim();
    const descricao =
      formularioDivisao.descricao.trim();

    if (!nome) {
      setErroFormulario(
        "Informe o nome da divisão.",
      );
      return;
    }

    try {
      setSalvando(true);
      setErroFormulario(null);

      const dados = {
        nome,
        descricao: descricao || null,
      };

      if (divisaoEmEdicaoId !== null) {
        const divisaoAtualizada =
          await atualizarDivisao(
            divisaoEmEdicaoId,
            dados,
          );

        setDivisoes((divisoesAtuais) =>
          divisoesAtuais.map((divisao) =>
            divisao.id ===
            divisaoAtualizada.id
              ? divisaoAtualizada
              : divisao,
          ),
        );

        setDivisaoSelecionada(
          (divisaoAtual) => {
            if (
              !divisaoAtual ||
              divisaoAtual.id !==
                divisaoAtualizada.id
            ) {
              return divisaoAtual;
            }

            return {
              ...divisaoAtual,
              nome: divisaoAtualizada.nome,
              descricao:
                divisaoAtualizada.descricao,
            };
          },
        );
      } else {
        const novaDivisao =
          await criarDivisao(dados);

        setDivisoes((divisoesAtuais) => [
          ...divisoesAtuais,
          novaDivisao,
        ]);

        setDivisaoSelecionadaId(
          novaDivisao.id,
        );
      }

      setModalDivisaoAberto(false);
      setDivisaoEmEdicaoId(null);
      setFormularioDivisao(
        formularioDivisaoInicial,
      );
    } catch (erroOperacao) {
      setErroFormulario(
        obterMensagemErro(erroOperacao),
      );
    } finally {
      setSalvando(false);
    }
  }

  async function removerDivisaoSelecionada() {
    if (!divisaoSelecionada || excluindo) {
      return;
    }

    const confirmou = window.confirm(
      `Deseja excluir a divisão "${divisaoSelecionada.nome}"? Os exercícios continuarão disponíveis no catálogo.`,
    );

    if (!confirmou) {
      return;
    }

    try {
      setExcluindo(true);
      setErro(null);

      await excluirDivisao(
        divisaoSelecionada.id,
      );

      const divisoesRestantes =
        divisoes.filter(
          (divisao) =>
            divisao.id !==
            divisaoSelecionada.id,
        );

      setDivisoes(divisoesRestantes);
      setDivisaoSelecionada(null);

      setDivisaoSelecionadaId(
        divisoesRestantes.length > 0
          ? divisoesRestantes[0].id
          : null,
      );
    } catch (erroExclusao) {
      setErro(
        obterMensagemErro(erroExclusao),
      );
    } finally {
      setExcluindo(false);
    }
  }

  async function adicionarExercicioExistente(
    exercicio: Exercicio,
  ) {
    if (!divisaoSelecionada || salvando) {
      return;
    }

    try {
      setSalvando(true);
      setErroFormulario(null);

      const associacao =
        await adicionarExercicioDivisao(
          divisaoSelecionada.id,
          exercicio.id,
        );

      setDivisaoSelecionada(
        (divisaoAtual) => {
          if (!divisaoAtual) {
            return divisaoAtual;
          }

          return {
            ...divisaoAtual,
            exercicios: [
              ...divisaoAtual.exercicios,
              associacao,
            ],
          };
        },
      );

      setPesquisaExercicio("");
      setFormularioExercicio({
        nome: "",
        grupo_muscular:
          grupoMuscularSelecionado,
      });
    } catch (erroAdicao) {
      setErroFormulario(
        obterMensagemErro(erroAdicao),
      );
    } finally {
      setSalvando(false);
    }
  }

  async function criarEAdicionarExercicio(
    evento: FormEvent<HTMLFormElement>,
  ) {
    evento.preventDefault();

    if (!divisaoSelecionada) {
      return;
    }

    const nome =
      formularioExercicio.nome.trim();

    if (!grupoMuscularSelecionado) {
      setErroFormulario(
        "Selecione o grupo muscular.",
      );
      return;
    }

    if (!nome) {
      setErroFormulario(
        "Informe o nome do exercício.",
      );
      return;
    }

    try {
      setSalvando(true);
      setErroFormulario(null);

      const novoExercicio =
        await criarExercicio({
          nome,
          grupo_muscular:
            grupoMuscularSelecionado,
        });

      setExercicios((exerciciosAtuais) => [
        ...exerciciosAtuais,
        novoExercicio,
      ]);

      const associacao =
        await adicionarExercicioDivisao(
          divisaoSelecionada.id,
          novoExercicio.id,
        );

      setDivisaoSelecionada(
        (divisaoAtual) => {
          if (!divisaoAtual) {
            return divisaoAtual;
          }

          return {
            ...divisaoAtual,
            exercicios: [
              ...divisaoAtual.exercicios,
              associacao,
            ],
          };
        },
      );

      setFormularioExercicio({
        nome: "",
        grupo_muscular:
          grupoMuscularSelecionado,
      });

      setPesquisaExercicio("");
    } catch (erroCriacao) {
      setErroFormulario(
        obterMensagemErro(erroCriacao),
      );
    } finally {
      setSalvando(false);
    }
  }

  async function removerExercicio(
    exercicioId: number,
  ) {
    if (!divisaoSelecionada) {
      return;
    }

    try {
      setErro(null);

      await removerExercicioDivisao(
        divisaoSelecionada.id,
        exercicioId,
      );

      setDivisaoSelecionada(
        (divisaoAtual) => {
          if (!divisaoAtual) {
            return divisaoAtual;
          }

          const exerciciosRestantes =
            divisaoAtual.exercicios
              .filter(
                (item) =>
                  item.exercicio_id !==
                  exercicioId,
              )
              .map((item, indice) => ({
                ...item,
                ordem: indice + 1,
              }));

          return {
            ...divisaoAtual,
            exercicios:
              exerciciosRestantes,
          };
        },
      );
    } catch (erroRemocao) {
      setErro(
        obterMensagemErro(erroRemocao),
      );
    }
  }

  return (
    <section className="page">
      <header className="page__header academia-header">
        <div>
          <p className="page__eyebrow">
            Treinamento
          </p>

          <h1>Academia</h1>

          <p>
            Organize sua divisão e seus
            exercícios.
          </p>
        </div>

        <button
          className="academia-primary-button"
          type="button"
          onClick={abrirModalCriarDivisao}
        >
          <Plus size={18} />
          Nova divisão
        </button>
      </header>

      {carregando && (
        <p className="academia-status">
          Carregando academia...
        </p>
      )}

      {!carregando && erro && (
        <div className="academia-message academia-message--error">
          {erro}
        </div>
      )}

      {!carregando &&
        !erro &&
        divisoes.length === 0 && (
          <div className="academia-empty">
            <div className="academia-empty__icon">
              <Dumbbell size={26} />
            </div>

            <h2>
              Nenhuma divisão cadastrada
            </h2>

            <p>
              Crie sua primeira divisão, como
              Segunda, Push ou Treino A.
            </p>

            <button
              type="button"
              onClick={
                abrirModalCriarDivisao
              }
            >
              <Plus size={17} />
              Criar divisão
            </button>
          </div>
        )}

      {!carregando &&
        divisoes.length > 0 && (
          <>
            <nav
              className="workout-tabs"
              aria-label="Divisões de treino"
            >
              {divisoes.map((divisao) => (
                <button
                  key={divisao.id}
                  type="button"
                  className={
                    divisaoSelecionadaId ===
                    divisao.id
                      ? "workout-tab workout-tab--active"
                      : "workout-tab"
                  }
                  onClick={() =>
                    setDivisaoSelecionadaId(
                      divisao.id,
                    )
                  }
                >
                  {divisao.nome}
                </button>
              ))}

              <button
                type="button"
                className="workout-tab workout-tab--add"
                onClick={
                  abrirModalCriarDivisao
                }
                aria-label="Adicionar divisão"
              >
                <Plus size={17} />
              </button>
            </nav>

            {carregandoDivisao && (
              <p className="academia-status">
                Carregando divisão...
              </p>
            )}

            {!carregandoDivisao &&
              divisaoSelecionada && (
                <div className="workout-panel">
                  <header className="workout-panel__header">
                    <div>
                      <h2>
                        {
                          divisaoSelecionada.nome
                        }
                      </h2>

                      <p>
                        {divisaoSelecionada.descricao ||
                          "Sem descrição cadastrada."}
                      </p>
                    </div>

                    <div className="workout-panel__actions">
                      <button
                        className="workout-action workout-action--secondary"
                        type="button"
                        onClick={
                          abrirModalEditarDivisao
                        }
                      >
                        <Pencil size={16} />
                        Editar
                      </button>

                      <button
                        className="workout-action workout-action--danger"
                        type="button"
                        disabled={excluindo}
                        onClick={() =>
                          void removerDivisaoSelecionada()
                        }
                      >
                        <Trash2 size={16} />

                        {excluindo
                          ? "Excluindo..."
                          : "Excluir"}
                      </button>

                      <button
                        className="workout-action workout-action--primary"
                        type="button"
                        onClick={
                          abrirModalExercicio
                        }
                      >
                        <Plus size={17} />
                        Adicionar exercício
                      </button>
                    </div>
                  </header>

                  {divisaoSelecionada
                    .exercicios.length ===
                  0 ? (
                    <div className="workout-empty">
                      <p>
                        Essa divisão ainda não
                        possui exercícios.
                      </p>

                      <button
                        type="button"
                        onClick={
                          abrirModalExercicio
                        }
                      >
                        Adicionar primeiro
                        exercício
                      </button>
                    </div>
                  ) : (
                    <div className="workout-exercises">
                      {divisaoSelecionada.exercicios.map(
                        (item) => (
                          <article
                            key={item.id}
                            className="workout-exercise"
                          >
                            <div className="workout-exercise__order">
                              {item.ordem}
                            </div>

                            <div className="workout-exercise__content">
                              <h3>
                                {item.nome}
                              </h3>

                              <p>
                                {
                                  item.grupo_muscular
                                }
                              </p>
                            </div>

                            <button
                              type="button"
                              className="workout-exercise__remove"
                              onClick={() =>
                                void removerExercicio(
                                  item.exercicio_id,
                                )
                              }
                              aria-label={`Remover ${item.nome}`}
                            >
                              <Trash2
                                size={17}
                              />
                            </button>
                          </article>
                        ),
                      )}
                    </div>
                  )}
                </div>
              )}
          </>
        )}

      {modalDivisaoAberto && (
        <div
          className="exercise-modal-backdrop"
          onMouseDown={(evento) => {
            if (
              evento.target ===
              evento.currentTarget
            ) {
              fecharModalDivisao();
            }
          }}
        >
          <section
            className="exercise-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-divisao-titulo"
          >
            <header className="exercise-modal__header">
              <div>
                <p>Organização</p>

                <h2 id="modal-divisao-titulo">
                  {divisaoEmEdicaoId !==
                  null
                    ? "Editar divisão"
                    : "Nova divisão"}
                </h2>
              </div>

              <button
                type="button"
                onClick={fecharModalDivisao}
                disabled={salvando}
                aria-label="Fechar modal"
              >
                <X size={20} />
              </button>
            </header>

            <form
              className="exercise-form"
              onSubmit={enviarDivisao}
            >
              <label className="exercise-field">
                <span>Nome</span>

                <input
                  autoFocus
                  required
                  name="nome"
                  value={
                    formularioDivisao.nome
                  }
                  onChange={
                    atualizarCampoDivisao
                  }
                  placeholder="Ex.: Segunda"
                  maxLength={50}
                />
              </label>

              <label className="exercise-field">
                <span>Descrição</span>

                <textarea
                  name="descricao"
                  value={
                    formularioDivisao.descricao
                  }
                  onChange={
                    atualizarCampoDivisao
                  }
                  placeholder="Ex.: Peito, ombro e tríceps"
                  maxLength={150}
                />
              </label>

              {erroFormulario && (
                <div
                  className="academia-message academia-message--error"
                  role="alert"
                >
                  {erroFormulario}
                </div>
              )}

              <footer className="exercise-form__actions">
                <button
                  className="exercise-button exercise-button--secondary"
                  type="button"
                  onClick={
                    fecharModalDivisao
                  }
                  disabled={salvando}
                >
                  Cancelar
                </button>

                <button
                  className="exercise-button exercise-button--primary"
                  type="submit"
                  disabled={salvando}
                >
                  {salvando
                    ? "Salvando..."
                    : divisaoEmEdicaoId !==
                        null
                      ? "Salvar alterações"
                      : "Criar divisão"}
                </button>
              </footer>
            </form>
          </section>
        </div>
      )}

      {modalExercicioAberto &&
        divisaoSelecionada && (
          <div
            className="exercise-modal-backdrop"
            onMouseDown={(evento) => {
              if (
                evento.target ===
                evento.currentTarget
              ) {
                fecharModalExercicio();
              }
            }}
          >
            <section
              className="exercise-modal exercise-modal--large"
              role="dialog"
              aria-modal="true"
              aria-labelledby="modal-exercicio-titulo"
            >
              <header className="exercise-modal__header">
                <div>
                  <p>
                    {
                      divisaoSelecionada.nome
                    }
                  </p>

                  <h2 id="modal-exercicio-titulo">
                    Adicionar exercício
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={
                    fecharModalExercicio
                  }
                  disabled={salvando}
                  aria-label="Fechar modal"
                >
                  <X size={20} />
                </button>
              </header>

              <div className="exercise-picker">
                <div className="exercise-picker__catalog">
                  <label className="exercise-field">
                    <span>
                      Grupo muscular
                    </span>

                    <select
                      value={
                        grupoMuscularSelecionado
                      }
                      onChange={
                        selecionarGrupoMuscular
                      }
                    >
                      <option value="">
                        Selecione um grupo
                        muscular
                      </option>

                      {gruposMusculares.map(
                        (grupo) => (
                          <option
                            key={grupo}
                            value={grupo}
                          >
                            {grupo}
                          </option>
                        ),
                      )}
                    </select>
                  </label>

                  {!grupoMuscularSelecionado && (
                    <div className="exercise-group-placeholder">
                      <Dumbbell size={24} />

                      <p>
                        Selecione primeiro o
                        grupo muscular para
                        visualizar os
                        exercícios.
                      </p>
                    </div>
                  )}

                  {grupoMuscularSelecionado && (
                    <>
                      <div className="academia-toolbar">
                        <Search
                          className="academia-search__icon"
                          size={18}
                        />

                        <input
                          type="search"
                          value={
                            pesquisaExercicio
                          }
                          onChange={(evento) =>
                            setPesquisaExercicio(
                              evento.target
                                .value,
                            )
                          }
                          placeholder={`Pesquisar em ${grupoMuscularSelecionado}`}
                        />
                      </div>

                      <div className="exercise-picker__list">
                        {exerciciosDisponiveis.length ===
                        0 ? (
                          <p className="exercise-picker__empty">
                            Nenhum exercício
                            disponível nesse
                            grupo.
                          </p>
                        ) : (
                          exerciciosDisponiveis.map(
                            (exercicio) => (
                              <button
                                key={
                                  exercicio.id
                                }
                                type="button"
                                disabled={
                                  salvando
                                }
                                onClick={() =>
                                  void adicionarExercicioExistente(
                                    exercicio,
                                  )
                                }
                              >
                                <div>
                                  <strong>
                                    {
                                      exercicio.nome
                                    }
                                  </strong>

                                  <small>
                                    {
                                      exercicio.grupo_muscular
                                    }
                                  </small>
                                </div>

                                <Plus
                                  size={17}
                                />
                              </button>
                            ),
                          )
                        )}
                      </div>
                    </>
                  )}
                </div>

                {grupoMuscularSelecionado && (
                  <>
                    <div className="exercise-picker__divider">
                      ou crie um novo em{" "}
                      {
                        grupoMuscularSelecionado
                      }
                    </div>

                    <form
                      className="exercise-form exercise-form--embedded"
                      onSubmit={
                        criarEAdicionarExercicio
                      }
                    >
                      <label className="exercise-field">
                        <span>Nome</span>

                        <input
                          name="nome"
                          value={
                            formularioExercicio.nome
                          }
                          onChange={
                            atualizarNomeExercicio
                          }
                          placeholder="Ex.: Supino Smith"
                          maxLength={100}
                        />
                      </label>

                      {sugestoesExercicio.length >
                        0 && (
                        <div className="exercise-suggestions">
                          <span>
                            Exercícios parecidos
                          </span>

                          <div className="exercise-suggestions__list">
                            {sugestoesExercicio.map(
                              (exercicio) => (
                                <button
                                  key={
                                    exercicio.id
                                  }
                                  type="button"
                                  disabled={
                                    salvando
                                  }
                                  onClick={() =>
                                    void adicionarExercicioExistente(
                                      exercicio,
                                    )
                                  }
                                >
                                  <strong>
                                    {
                                      exercicio.nome
                                    }
                                  </strong>

                                  <small>
                                    {
                                      exercicio.grupo_muscular
                                    }
                                  </small>
                                </button>
                              ),
                            )}
                          </div>
                        </div>
                      )}

                      <div className="exercise-selected-group">
                        <span>
                          Grupo muscular
                        </span>

                        <strong>
                          {
                            grupoMuscularSelecionado
                          }
                        </strong>
                      </div>

                      {erroFormulario && (
                        <div
                          className="academia-message academia-message--error"
                          role="alert"
                        >
                          {erroFormulario}
                        </div>
                      )}

                      <button
                        className="exercise-button exercise-button--primary"
                        type="submit"
                        disabled={salvando}
                      >
                        <Plus size={17} />

                        {salvando
                          ? "Adicionando..."
                          : "Criar e adicionar"}
                      </button>
                    </form>
                  </>
                )}
              </div>
            </section>
          </div>
        )}
    </section>
  );
}

export default AcademiaPage;