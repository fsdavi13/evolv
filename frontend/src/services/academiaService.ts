import api from "./api";

import type {
  DivisaoTreino,
  DivisaoTreinoDetalhada,
  DivisaoTreinoPayload,
  Exercicio,
  ExercicioDivisao,
  ExercicioPayload,
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