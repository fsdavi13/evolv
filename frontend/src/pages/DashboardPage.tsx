import {
  Activity,
  Beef,
  Dumbbell,
  Flame,
  Gauge,
  Salad,
  Scale,
  TrendingUp,
} from "lucide-react";
import { useEffect, useState } from "react";

import DashboardCard from "../components/DashboardCard";
import { buscarDashboard } from "../services/dashboardService";
import type { Dashboard } from "../types/dashboard";

import type { DashboardCardDestaque } from "../components/DashboardCard";

import {
  buscarTreino,
  listarTreinos,
} from "../services/academiaService";
import { listarCorridas } from "../services/corridaService";

import type { Serie } from "../types/academia";
import type { Corrida } from "../types/corrida";

import "./DashboardPage.css";

function formatarTempo(segundos: number): string {
  const horas = Math.floor(segundos / 3600);
  const minutos = Math.floor((segundos % 3600) / 60);

  if (horas > 0) {
    return `${horas}h ${minutos}min`;
  }

  return `${minutos} min`;
}

function formatarData(data: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "long",
    timeZone: "UTC",
  }).format(new Date(`${data}T00:00:00Z`));
}

interface ProgressaoSemanal {
  valor: string;
  descricao: string;
  destaque?: DashboardCardDestaque;
}

const progressaoSemDados: ProgressaoSemanal = {
  valor: "—",
  descricao: "Sem dados suficientes para comparar",
};

function obterInicioSemana(data: Date): Date {
  const inicio = new Date(data);
  const diaDaSemana = inicio.getDay();
  const diasDesdeSegunda =
    diaDaSemana === 0 ? 6 : diaDaSemana - 1;

  inicio.setDate(
    inicio.getDate() - diasDesdeSegunda,
  );

  inicio.setHours(0, 0, 0, 0);

  return inicio;
}

function converterDataSerie(data: string): Date {
  const [ano, mes, dia] = data
    .split("-")
    .map(Number);

  return new Date(ano, mes - 1, dia);
}

function calcularDesempenhoSerie(
  serie: Serie,
): number {
  return (
    serie.peso *
    (1 + serie.repeticoes / 30)
  );
}

function obterMelhoresDesempenhos(
  series: Serie[],
  inicio: Date,
  fim: Date,
): Map<number, number> {
  const melhores = new Map<number, number>();

  series.forEach((serie) => {
    const data = converterDataSerie(
      serie.data,
    );

    if (
      Number.isNaN(data.getTime()) ||
      data < inicio ||
      data >= fim ||
      serie.peso <= 0 ||
      serie.repeticoes <= 0
    ) {
      return;
    }

    const desempenho =
      calcularDesempenhoSerie(serie);

    const desempenhoAtual =
      melhores.get(serie.exercicio_id) ?? 0;

    if (desempenho > desempenhoAtual) {
      melhores.set(
        serie.exercicio_id,
        desempenho,
      );
    }
  });

  return melhores;
}

function calcularProgressaoSemanal(
  series: Serie[],
): ProgressaoSemanal {
  const inicioSemanaAtual =
    obterInicioSemana(new Date());

  const inicioProximaSemana = new Date(
    inicioSemanaAtual,
  );

  inicioProximaSemana.setDate(
    inicioProximaSemana.getDate() + 7,
  );

  const inicioSemanaAnterior = new Date(
    inicioSemanaAtual,
  );

  inicioSemanaAnterior.setDate(
    inicioSemanaAnterior.getDate() - 7,
  );

  const semanaAtual =
    obterMelhoresDesempenhos(
      series,
      inicioSemanaAtual,
      inicioProximaSemana,
    );

  const semanaAnterior =
    obterMelhoresDesempenhos(
      series,
      inicioSemanaAnterior,
      inicioSemanaAtual,
    );

  const variacoes: number[] = [];

  semanaAtual.forEach(
    (desempenhoAtual, exercicioId) => {
      const desempenhoAnterior =
        semanaAnterior.get(exercicioId);

      if (
        desempenhoAnterior === undefined ||
        desempenhoAnterior <= 0
      ) {
        return;
      }

      variacoes.push(
        ((desempenhoAtual -
          desempenhoAnterior) /
          desempenhoAnterior) *
          100,
      );
    },
  );

  if (variacoes.length === 0) {
    return progressaoSemDados;
  }

  const media =
    variacoes.reduce(
      (total, variacao) =>
        total + variacao,
      0,
    ) / variacoes.length;

  const valorFormatado =
    media.toLocaleString("pt-BR", {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    });

  if (media > 2) {
    return {
      valor: `+${valorFormatado}%`,
      descricao:
        "Progressão em relação à semana passada",
      destaque: "verde",
    };
  }

  if (media < -2) {
    return {
      valor: `${valorFormatado}%`,
      descricao:
        "Regressão em relação à semana passada",
      destaque: "vermelho",
    };
  }

  return {
    valor:
      media > 0
        ? `+${valorFormatado}%`
        : `${valorFormatado}%`,
    descricao:
      "Desempenho estável em relação à semana passada",
    destaque: "amarelo",
  };
}

function obterDadosSituacao(
  situacao: Dashboard["metabolismo"]["situacao_calorica"],
) {
  switch (situacao) {
    case "deficit":
      return {
        titulo: "Déficit",
        descricao: "Déficit calórico registrado",
        destaque: "verde" as const,
      };

    case "manutencao":
      return {
        titulo: "Manutenção",
        descricao: "Manutenção calórica registrada",
        destaque: "azul" as const,
      };

    case "superavit":
      return {
        titulo: "Superávit",
        descricao: "Superávit calórico registrado",
        destaque: "laranja" as const,
      };

    default:
      return null;
  }
}

interface ResumoCorridasSemana {
  distanciaKm: number;
  tempoSegundos: number;
  melhorPace: string | null;
}

function formatarDataISO(data: Date): string {
  const ano = data.getFullYear();
  const mes = String(
    data.getMonth() + 1,
  ).padStart(2, "0");
  const dia = String(
    data.getDate(),
  ).padStart(2, "0");

  return `${ano}-${mes}-${dia}`;
}

function calcularResumoCorridasSemana(
  corridas: Corrida[],
): ResumoCorridasSemana {
  const hoje = new Date();

  const inicioSemana = new Date(hoje);
  const diaSemana = hoje.getDay();

  const deslocamento =
    diaSemana === 0
      ? -6
      : 1 - diaSemana;

  inicioSemana.setDate(
    hoje.getDate() + deslocamento,
  );

  const fimSemana = new Date(inicioSemana);
  fimSemana.setDate(
    inicioSemana.getDate() + 6,
  );

  const inicio = formatarDataISO(
    inicioSemana,
  );
  const fim = formatarDataISO(fimSemana);

  const corridasSemana = corridas.filter(
    (corrida) =>
      corrida.data >= inicio &&
      corrida.data <= fim,
  );

  const distanciaKm = corridasSemana.reduce(
    (total, corrida) =>
      total + corrida.distancia_km,
    0,
  );

  const tempoSegundos =
    corridasSemana.reduce(
      (total, corrida) =>
        total +
        corrida.tempo_total_segundos,
      0,
    );

  const melhorCorrida =
    corridasSemana.reduce<Corrida | null>(
      (melhor, corrida) => {
        if (!melhor) {
          return corrida;
        }

        return corrida.pace_segundos <
          melhor.pace_segundos
          ? corrida
          : melhor;
      },
      null,
    );

  return {
    distanciaKm,
    tempoSegundos,
    melhorPace:
      melhorCorrida?.pace ?? null,
  };
}


function DashboardPage() {
  const [dashboard, setDashboard] =
    useState<Dashboard | null>(null);

  const [progressao, setProgressao] =
    useState<ProgressaoSemanal>(
      progressaoSemDados,
    );

  const [carregando, setCarregando] =
    useState(true);

  const [erro, setErro] =
    useState<string | null>(null);

  const [
    resumoCorridasSemana,
    setResumoCorridasSemana,
  ] = useState<ResumoCorridasSemana | null>(
    null,
  );


  useEffect(() => {
    async function carregarCorridasSemana() {
      try {
        const corridas =
          await listarCorridas();

        setResumoCorridasSemana(
          calcularResumoCorridasSemana(
            corridas,
          ),
        );
      } catch {
        setResumoCorridasSemana(null);
      }
    }

    void carregarCorridasSemana();
  }, []);

  useEffect(() => {
    async function carregarDashboard() {
      try {
        setCarregando(true);
        setErro(null);

        const dados = await buscarDashboard();
        setDashboard(dados);

        try {
          const treinos = await listarTreinos();

          const treinosFinalizados = treinos.filter(
            (treino) => treino.finalizado,
          );

          const treinosDetalhados = await Promise.all(
            treinosFinalizados.map((treino) =>
              buscarTreino(treino.id),
            ),
          );

  

          const series = treinosDetalhados.flatMap(
            (treino) => treino.series,
          );

          setProgressao(
            calcularProgressaoSemanal(series),
          );
        } catch (erroProgressao) {
          console.error(
            "Erro ao calcular progressão:",
            erroProgressao,
          );

          setProgressao(progressaoSemDados);
        }

      } catch {
        setErro(
          "Não foi possível carregar os dados do dashboard.",
        );
      } finally {
        setCarregando(false);
      }
    }

    void carregarDashboard();
  }, []);

  if (carregando) {
    return (
      <section className="page">
        <p className="dashboard-status">
          Carregando dashboard...
        </p>
      </section>
    );
  }

  if (erro || !dashboard) {
    return (
      <section className="page">
        <div className="dashboard-error">
          <strong>Erro ao carregar</strong>
          <p>
            {erro ??
              "Não foi possível carregar os dados do dashboard."}
          </p>
        </div>
      </section>
    );
  }

  const dadosSituacao = obterDadosSituacao(
    dashboard.metabolismo.situacao_calorica,
  );


  return (
    <section className="page">
      <header className="page__header">
        <p className="page__eyebrow">Visão geral</p>
        <h1>Dashboard</h1>
        <p>
          Resumo de {formatarData(dashboard.data)}.
        </p>
      </header>

      <div className="dashboard-section">
        <div className="dashboard-section__header">
          <h2>Academia</h2>
        </div>

        <div className="dashboard-grid">
          <DashboardCard
            titulo="Séries"
            valor={dashboard.academia.quantidade_series}
            descricao="Séries registradas no dia"
            icone={Dumbbell}
          />

          <DashboardCard
            titulo="Exercícios"
            valor={
              dashboard.academia.quantidade_exercicios
            }
            descricao="Exercícios diferentes realizados"
            icone={Activity}
          />

          <DashboardCard
            titulo="Progressão"
            valor={progressao.valor}
            descricao={progressao.descricao}
            icone={TrendingUp}
            destaque={progressao.destaque}
          />
        </div>
      </div>

      <div className="dashboard-section">
        <div className="dashboard-section__header">
          <h2>Corrida</h2>
        </div>

        <div className="dashboard-grid">
          <DashboardCard
            titulo="Distância"
            valor={
              resumoCorridasSemana
                ? `${resumoCorridasSemana.distanciaKm.toLocaleString(
                    "pt-BR",
                    {
                      maximumFractionDigits: 2,
                    },
                  )} km`
                : "—"
            }
            descricao="Distância total nesta semana"
            icone={Activity}
          />

          <DashboardCard
            titulo="Tempo"
            valor={
              resumoCorridasSemana
                ? formatarTempo(
                    resumoCorridasSemana.tempoSegundos,
                  )
                : "—"
            }
            descricao="Tempo total nesta semana"
            icone={Gauge}
          />

          <DashboardCard
            titulo="Melhor pace"
            valor={
              resumoCorridasSemana?.melhorPace ??
              "--:--"
            }
            descricao="Melhor pace nesta semana"
            icone={Flame}
          />
        </div>
      </div>

      <div className="dashboard-section">
        <div className="dashboard-section__header">
          <h2>Dieta</h2>
        </div>

        <div className="dashboard-grid">
          <DashboardCard
            titulo="Calorias"
            valor={`${dashboard.dieta.calorias.toLocaleString(
              "pt-BR",
            )} kcal`}
            descricao="Consumo calórico registrado"
            icone={Flame}
          />

          <DashboardCard
            titulo="Gasto diário"
            valor={
              dashboard.metabolismo.gasto_diario !== null
                ? `${dashboard.metabolismo.gasto_diario.toLocaleString(
                    "pt-BR",
                    {
                      maximumFractionDigits: 0,
                    },
                  )} kcal`
                : "Não calculado"
            }
            descricao={
              dashboard.metabolismo.perfil_cadastrado
                ? "Gasto energético diário estimado"
                : "Cadastre seu perfil para calcular"
            }
            icone={Gauge}
          />

          {dadosSituacao &&
          dashboard.metabolismo.saldo_calorico !== null ? (
            <DashboardCard
              titulo={dadosSituacao.titulo}
              valor={`${Math.abs(
                dashboard.metabolismo.saldo_calorico,
              ).toLocaleString("pt-BR", {
                maximumFractionDigits: 0,
              })} kcal`}
              descricao={dadosSituacao.descricao}
              icone={Scale}
              destaque={dadosSituacao.destaque}
            />
          ) : (
            <DashboardCard
              titulo="Situação"
              valor="Não calculada"
              descricao="Cadastre seu perfil para calcular"
              icone={Scale}
            />
          )}

          <DashboardCard
            titulo="Proteínas"
            valor={`${dashboard.dieta.proteinas_g.toLocaleString(
              "pt-BR",
            )} g`}
            descricao="Proteínas consumidas"
            icone={Beef}
          />

          <DashboardCard
            titulo="Carboidratos"
            valor={`${dashboard.dieta.carboidratos_g.toLocaleString(
              "pt-BR",
            )} g`}
            descricao="Carboidratos consumidos"
            icone={Salad}
          />

          <DashboardCard
            titulo="Gorduras"
            valor={`${dashboard.dieta.gorduras_g.toLocaleString(
              "pt-BR",
            )} g`}
            descricao="Gorduras consumidas"
            icone={Salad}
          />
        </div>
      </div>
    </section>
  );
}

export default DashboardPage;