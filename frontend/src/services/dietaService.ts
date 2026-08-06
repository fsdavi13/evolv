import api from "./api";

import type {
  Alimento,
  DietaPayload,
  MacroAlimento,
  RegistroAlimentar,
} from "../types/dieta";

export async function buscarAlimentos(
  termo: string,
): Promise<Alimento[]> {
  const resposta = await api.get<Alimento[]>(
    "/dieta/alimentos",
    {
      params: {
        termo,
      },
    },
  );

  return resposta.data;
}

export async function calcularMacros(
  alimentoId: number,
  quantidadeGramas: number,
): Promise<MacroAlimento> {
  const resposta = await api.get<MacroAlimento>(
    `/dieta/alimentos/${alimentoId}/macros`,
    {
      params: {
        quantidade_gramas: quantidadeGramas,
      },
    },
  );

  return resposta.data;
}

export async function salvarDieta(
  payload: DietaPayload,
): Promise<void> {
  await api.post("/dieta", payload);
}

export async function listarRegistros(): Promise<
  RegistroAlimentar[]
> {
  const resposta = await api.get<
    RegistroAlimentar[]
  >("/dieta/registros");

  return resposta.data;
}

export async function buscarRegistrosPorData(
  data: string,
): Promise<RegistroAlimentar[]> {
  const resposta = await api.get<
    RegistroAlimentar[]
  >("/dieta/registros/por-data", {
    params: {
      data,
    },
  });

  return resposta.data;
}

export async function excluirRegistro(
  registroId: number,
): Promise<void> {
  await api.delete(
    `/dieta/registros/${registroId}`,
  );
}