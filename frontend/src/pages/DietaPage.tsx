import {
  useEffect,
  useMemo,
  useState,
} from "react";
import { Trash2 } from "lucide-react";

import {
  buscarAlimentos,
  buscarRegistrosPorData,
  calcularMacros,
  excluirRegistro,
  salvarDieta,
} from "../services/dietaService";

import type {
  Alimento,
  MacroAlimento,
  RegistroAlimentar,
} from "../types/dieta";

import {
  deveOcultarAlimento,
  formatarNomeAlimento,
  normalizarTermoBusca,
} from "../utils/alimento";

import "./DietaPage.css";

interface RegistroComMacros
  extends RegistroAlimentar {
  macros: MacroAlimento;
}

function obterDataAtual(): string {
  const hoje = new Date();

  const ano = hoje.getFullYear();
  const mes = String(
    hoje.getMonth() + 1,
  ).padStart(2, "0");
  const dia = String(
    hoje.getDate(),
  ).padStart(2, "0");

  return `${ano}-${mes}-${dia}`;
}

function formatarNumero(
  valor: number,
  casas = 1,
): string {
  return valor.toLocaleString("pt-BR", {
    maximumFractionDigits: casas,
  });
}

function DietaPage() {
  const [data, setData] = useState(
    obterDataAtual(),
  );

  const [tipoRefeicao, setTipoRefeicao] =
    useState("Almoço");

  const [alimentos, setAlimentos] =
    useState<Alimento[]>([]);

  const [pesquisa, setPesquisa] =
    useState("");

  const [
    alimentoSelecionado,
    setAlimentoSelecionado,
  ] = useState<Alimento | null>(null);

  const [quantidade, setQuantidade] =
    useState("100");

  const [macros, setMacros] =
    useState<MacroAlimento | null>(null);

  const [registros, setRegistros] =
    useState<RegistroComMacros[]>([]);

  const [carregando, setCarregando] =
    useState(true);

  const [salvando, setSalvando] =
    useState(false);

  const [erro, setErro] = useState<
    string | null
  >(null);

  async function carregarRegistros(
    dataSelecionada: string,
  ) {
    try {
      setCarregando(true);
      setErro(null);

      const registrosEncontrados =
        await buscarRegistrosPorData(
          dataSelecionada,
        );

      const registrosComMacros =
        await Promise.all(
          registrosEncontrados.map(
            async (registro) => {
              const macrosRegistro =
                await calcularMacros(
                  registro.alimento_id,
                  registro.quantidade_gramas,
                );

              return {
                ...registro,
                macros: macrosRegistro,
              };
            },
          ),
        );

      setRegistros(registrosComMacros);
    } catch {
      setErro(
        "Não foi possível carregar os registros da dieta.",
      );
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
  const termo = normalizarTermoBusca(
  pesquisa,
);

  if (
    termo.length < 2 ||
    alimentoSelecionado
  ) {
    setAlimentos([]);
    return;
  }

  let ativo = true;

  const temporizador = window.setTimeout(
    async () => {
      try {
        const dados =
          await buscarAlimentos(termo);

        if (ativo) {
          setAlimentos(dados);
        }
      } catch {
        if (ativo) {
          setAlimentos([]);
          setErro(
            "Não foi possível buscar os alimentos.",
          );
        }
      }
    },
    300,
  );

  return () => {
    ativo = false;
    window.clearTimeout(temporizador);
  };
}, [pesquisa, alimentoSelecionado]);

  useEffect(() => {
    void carregarRegistros(data);
  }, [data]);

  useEffect(() => {
    if (!alimentoSelecionado) {
      setMacros(null);
      return;
    }

    const quantidadeNumero = Number(
      quantidade.replace(",", "."),
    );

    if (
      !Number.isFinite(quantidadeNumero) ||
      quantidadeNumero <= 0
    ) {
      setMacros(null);
      return;
    }

    let ativo = true;

    const temporizador = window.setTimeout(
      async () => {
        try {
          const resultado =
            await calcularMacros(
              alimentoSelecionado.id,
              quantidadeNumero,
            );

          if (ativo) {
            setMacros(resultado);
          }
        } catch {
          if (ativo) {
            setMacros(null);
          }
        }
      },
      300,
    );

    return () => {
      ativo = false;
      window.clearTimeout(temporizador);
    };
  }, [
    alimentoSelecionado,
    quantidade,
  ]);

  const alimentosFiltrados = useMemo(
  () =>
    alimentos
      .filter(
        (alimento) =>
          !deveOcultarAlimento(
            alimento.nome,
          ),
      )
      .slice(0, 8),
  [alimentos],
);

  const totais = useMemo(
    () =>
      registros.reduce(
        (total, registro) => ({
          calorias:
            total.calorias +
            registro.macros.calorias,

          proteinas:
            total.proteinas +
            registro.macros.proteinas_g,

          carboidratos:
            total.carboidratos +
            registro.macros.carboidratos_g,

          gorduras:
            total.gorduras +
            registro.macros.gorduras_g,
        }),
        {
          calorias: 0,
          proteinas: 0,
          carboidratos: 0,
          gorduras: 0,
        },
      ),
    [registros],
  );

  function selecionarAlimento(
    alimento: Alimento,
  ) {
    setAlimentoSelecionado(alimento);
    setPesquisa(
  formatarNomeAlimento(alimento.nome),
  );
    setErro(null);
  }

  function alterarPesquisa(valor: string) {
    setPesquisa(valor);
    setAlimentoSelecionado(null);
    setMacros(null);
  }

  async function registrarAlimento() {
    if (!alimentoSelecionado) {
      setErro("Selecione um alimento.");
      return;
    }

    const quantidadeNumero = Number(
      quantidade.replace(",", "."),
    );

    if (
      !Number.isFinite(quantidadeNumero) ||
      quantidadeNumero <= 0
    ) {
      setErro(
        "Informe uma quantidade válida.",
      );
      return;
    }

    try {
      setSalvando(true);
      setErro(null);

      await salvarDieta({
        data,
        tipo_refeicao: tipoRefeicao,
        itens: [
          {
            alimento_id:
              alimentoSelecionado.id,
            quantidade_gramas:
              quantidadeNumero,
          },
        ],
      });

      setPesquisa("");
      setAlimentoSelecionado(null);
      setQuantidade("100");
      setMacros(null);

      await carregarRegistros(data);
    } catch {
      setErro(
        "Não foi possível registrar o alimento.",
      );
    } finally {
      setSalvando(false);
    }
  }

  async function removerRegistro(
    registroId: number,
  ) {
    const confirmar = window.confirm(
      "Excluir este alimento da dieta?",
    );

    if (!confirmar) {
      return;
    }

    try {
      await excluirRegistro(registroId);

      await carregarRegistros(data);
    } catch {
      setErro(
        "Não foi possível excluir o registro.",
      );
    }
  }

  return (
    <section className="page dieta-page">
      <header className="page__header">
        <p className="page__eyebrow">
          Alimentação
        </p>

        <h1>Dieta</h1>

        <p>
          Registre alimentos e acompanhe
          seus macros diários.
        </p>
      </header>

      <div className="dieta-summary">
        <div>
          <span>Calorias</span>
          <strong>
            {formatarNumero(
              totais.calorias,
              0,
            )}{" "}
            kcal
          </strong>
        </div>

        <div>
          <span>Proteínas</span>
          <strong>
            {formatarNumero(
              totais.proteinas,
            )}{" "}
            g
          </strong>
        </div>

        <div>
          <span>Carboidratos</span>
          <strong>
            {formatarNumero(
              totais.carboidratos,
            )}{" "}
            g
          </strong>
        </div>

        <div>
          <span>Gorduras</span>
          <strong>
            {formatarNumero(
              totais.gorduras,
            )}{" "}
            g
          </strong>
        </div>
      </div>

      <div className="dieta-card">
        <div className="dieta-card__header">
          <div>
            <h2>Registrar alimento</h2>
            <p>
              Adicione o que você consumiu.
            </p>
          </div>
        </div>

        <div className="dieta-form">
          <div className="dieta-form__row">
            <label className="dieta-field">
              <span>Data</span>

              <input
                type="date"
                value={data}
                onChange={(event) =>
                  setData(
                    event.target.value,
                  )
                }
              />
            </label>

            <label className="dieta-field">
              <span>Refeição</span>

              <select
                value={tipoRefeicao}
                onChange={(event) =>
                  setTipoRefeicao(
                    event.target.value,
                  )
                }
              >
                <option>
                  Café da manhã
                </option>
                <option>Almoço</option>
                <option>Lanche</option>
                <option>Jantar</option>
                <option>Ceia</option>
              </select>
            </label>
          </div>

          <div className="dieta-search">
            <label className="dieta-field">
              <span>Alimento</span>

              <input
                type="text"
                value={pesquisa}
                placeholder="Ex.: arroz, frango, banana..."
                autoComplete="off"
                onChange={(event) =>
                  alterarPesquisa(
                    event.target.value,
                  )
                }
              />
            </label>

            {alimentosFiltrados.length >
              0 && (
              <div className="dieta-search__results">
                {alimentosFiltrados.map(
                  (alimento) => (
                    <button
                      key={alimento.id}
                      type="button"
                      onClick={() =>
                        selecionarAlimento(
                          alimento,
                        )
                      }
                    >
                      {formatarNomeAlimento(alimento.nome)}
                    </button>
                  ),
                )}
              </div>
            )}
          </div>

          <label className="dieta-field">
            <span>Quantidade</span>

            <div className="dieta-field__quantity">
              <input
                type="number"
                min="1"
                step="1"
                value={quantidade}
                onChange={(event) =>
                  setQuantidade(
                    event.target.value,
                  )
                }
              />

              <span>g</span>
            </div>
          </label>

          {macros && (
            <div className="dieta-preview">
              <div>
                <span>Calorias</span>
                <strong>
                  {formatarNumero(
                    macros.calorias,
                    0,
                  )}{" "}
                  kcal
                </strong>
              </div>

              <div>
                <span>Proteínas</span>
                <strong>
                  {formatarNumero(
                    macros.proteinas_g,
                  )}{" "}
                  g
                </strong>
              </div>

              <div>
                <span>Carboidratos</span>
                <strong>
                  {formatarNumero(
                    macros.carboidratos_g,
                  )}{" "}
                  g
                </strong>
              </div>

              <div>
                <span>Gorduras</span>
                <strong>
                  {formatarNumero(
                    macros.gorduras_g,
                  )}{" "}
                  g
                </strong>
              </div>
            </div>
          )}

          {erro && (
            <p className="dieta-error">
              {erro}
            </p>
          )}

          <button
            className="dieta-submit"
            type="button"
            disabled={
              salvando ||
              !alimentoSelecionado
            }
            onClick={() =>
              void registrarAlimento()
            }
          >
            {salvando
              ? "Registrando..."
              : "Registrar alimento"}
          </button>
        </div>
      </div>

      <div className="dieta-card">
        <div className="dieta-card__header">
          <div>
            <h2>Registros do dia</h2>
            <p>
              Alimentos consumidos na data
              selecionada.
            </p>
          </div>
        </div>

        <div className="dieta-registros">
          {carregando ? (
            <p className="dieta-empty">
              Carregando...
            </p>
          ) : registros.length === 0 ? (
            <p className="dieta-empty">
              Nenhum alimento registrado.
            </p>
          ) : (
            registros.map((registro) => (
              <article
                className="dieta-registro"
                key={registro.id}
              >
                <div>
                  <strong>
                    {formatarNomeAlimento(
                      registro.macros.nome,
                    )}
                  </strong>

                  <span>
                    {registro.tipo_refeicao} ·{" "}
                    {formatarNumero(
                      registro.quantidade_gramas,
                      0,
                    )}{" "}
                    g
                  </span>
                </div>

                <div className="dieta-registro__right">
                  <div>
                    <strong>
                      {formatarNumero(
                        registro.macros
                          .calorias,
                        0,
                      )}{" "}
                      kcal
                    </strong>

                    <span>
                      P{" "}
                      {formatarNumero(
                        registro.macros
                          .proteinas_g,
                      )}{" "}
                      · C{" "}
                      {formatarNumero(
                        registro.macros
                          .carboidratos_g,
                      )}{" "}
                      · G{" "}
                      {formatarNumero(
                        registro.macros
                          .gorduras_g,
                      )}
                    </span>
                  </div>

                  <button
                    type="button"
                    className="dieta-delete"
                    aria-label="Excluir alimento"
                    onClick={() =>
                      void removerRegistro(
                        registro.id,
                      )
                    }
                  >
                    <Trash2 size={17} />
                  </button>
                </div>
              </article>
            ))
          )}
        </div>
      </div>
    </section>
  );
}

export default DietaPage;