import api from "./api";

import type {
  DivisaoTreino,
  DivisaoTreinoDetalhada,
  DivisaoTreinoPayload,
  Exercicio,
  ExercicioDivisao,
  ExercicioPayload,
} from "../types/academia";

import axios from "axios";

import type {
  FinalizarTreinoPayload,
  IniciarTreinoPayload,
  Serie,
  SeriePayload,
  Treino,
} from "../types/academia";

export async function listarExercicios(): Promise<
  Exercicio[]
> {
  const resposta = await api.get<Exercicio[]>(
    "/academia/exercicios",
  );

  return resposta.data;
}

export async function criarExercicio(
  dados: ExercicioPayload,
): Promise<Exercicio> {
  const resposta = await api.post<Exercicio>(
    "/academia/exercicios",
    dados,
  );

  return resposta.data;
}

export async function listarDivisoes(): Promise<
  DivisaoTreino[]
> {
  const resposta = await api.get<DivisaoTreino[]>(
    "/academia/divisoes",
  );

  return resposta.data;
}

export async function buscarDivisao(
  divisaoId: number,
): Promise<DivisaoTreinoDetalhada> {
  const resposta =
    await api.get<DivisaoTreinoDetalhada>(
      `/academia/divisoes/${divisaoId}`,
    );

  return resposta.data;
}

export async function criarDivisao(
  dados: DivisaoTreinoPayload,
): Promise<DivisaoTreino> {
  const resposta = await api.post<DivisaoTreino>(
    "/academia/divisoes",
    dados,
  );

  return resposta.data;
}

export async function atualizarDivisao(
  divisaoId: number,
  dados: DivisaoTreinoPayload,
): Promise<DivisaoTreino> {
  const resposta = await api.put<DivisaoTreino>(
    `/academia/divisoes/${divisaoId}`,
    dados,
  );

  return resposta.data;
}

export async function excluirDivisao(
  divisaoId: number,
): Promise<void> {
  await api.delete(
    `/academia/divisoes/${divisaoId}`,
  );
}

export async function adicionarExercicioDivisao(
  divisaoId: number,
  exercicioId: number,
): Promise<ExercicioDivisao> {
  const resposta = await api.post<ExercicioDivisao>(
    `/academia/divisoes/${divisaoId}/exercicios`,
    {
      exercicio_id: exercicioId,
    },
  );

  return resposta.data;
}

export async function removerExercicioDivisao(
  divisaoId: number,
  exercicioId: number,
): Promise<void> {
  await api.delete(
    `/academia/divisoes/${divisaoId}/exercicios/${exercicioId}`,
  );
}

export async function buscarTreinoEmAndamento(): Promise<Treino | null> {
  try {
    const resposta = await api.get<Treino>(
      "/academia/treinos/em-andamento",
    );

    return resposta.data;
  } catch (erro) {
    if (
      axios.isAxiosError(erro) &&
      erro.response?.status === 404
    ) {
      return null;
    }

    throw erro;
  }
}

export async function iniciarTreino(
  dados: IniciarTreinoPayload,
): Promise<Treino> {
  const resposta = await api.post<Treino>(
    "/academia/treinos",
    dados,
  );

  return resposta.data;
}

export async function finalizarTreino(
  treinoId: number,
  dados?: FinalizarTreinoPayload,
): Promise<Treino> {
  const resposta = await api.put<Treino>(
    `/academia/treinos/${treinoId}/finalizar`,
    dados ?? {},
  );

  return resposta.data;
}

export async function registrarSerie(
  dados: SeriePayload,
): Promise<Serie> {
  const resposta = await api.post<Serie>(
    "/academia/series",
    dados,
  );

  return resposta.data;
}

export async function listarTreinos(): Promise<Treino[]> {
  const resposta = await api.get<Treino[]>(
    "/academia/treinos",
  );

  return resposta.data;
}

export async function buscarTreino(
  treinoId: number,
): Promise<Treino> {
  const resposta = await api.get<Treino>(
    `/academia/treinos/${treinoId}`,
  );

  return resposta.data;
}