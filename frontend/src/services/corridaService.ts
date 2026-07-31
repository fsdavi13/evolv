import api from "./api";

import type {
  Corrida,
  CorridaPayload,
} from "../types/corrida";

export async function listarCorridas(): Promise<
  Corrida[]
> {
  const resposta = await api.get<Corrida[]>(
    "/corridas",
  );

  return resposta.data;
}

export async function registrarCorrida(
  payload: CorridaPayload,
): Promise<Corrida> {
  const resposta = await api.post<Corrida>(
    "/corridas",
    payload,
  );

  return resposta.data;
}

export async function excluirCorrida(
  corridaId: number,
): Promise<void> {
  await api.delete(`/corridas/${corridaId}`);
}

export async function editarCorrida(
  corridaId: number,
  payload: CorridaPayload,
): Promise<Corrida> {
  const resposta = await api.put<Corrida>(
    `/corridas/${corridaId}`,
    payload,
  );

  return resposta.data;
}