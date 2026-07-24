import {
  Activity,
  Beef,
  Dumbbell,
  Flame,
  Gauge,
  Salad,
  Scale,
} from "lucide-react";
import { useEffect, useState } from "react";

import DashboardCard from "../components/DashboardCard";
import { buscarDashboard } from "../services/dashboardService";
import type { Dashboard } from "../types/dashboard";

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

function DashboardPage() {
  const [dashboard, setDashboard] =
    useState<Dashboard | null>(null);

  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    async function carregarDashboard() {
      try {
        setCarregando(true);
        setErro(null);

        const dados = await buscarDashboard();
        setDashboard(dados);
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
            titulo="Carga"
            valor={`${dashboard.academia.volume_total.toLocaleString(
              "pt-BR",
            )} kg`}
            descricao="Carga total movimentada"
            icone={Gauge}
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
            valor={`${dashboard.corrida.distancia_total_km.toLocaleString(
              "pt-BR",
            )} km`}
            descricao="Distância total percorrida"
            icone={Activity}
          />

          <DashboardCard
            titulo="Tempo"
            valor={formatarTempo(
              dashboard.corrida.tempo_total_segundos,
            )}
            descricao="Tempo total de corrida"
            icone={Gauge}
          />

          <DashboardCard
            titulo="Melhor pace"
            valor={dashboard.corrida.melhor_pace ?? "--:--"}
            descricao="Melhor ritmo registrado no dia"
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