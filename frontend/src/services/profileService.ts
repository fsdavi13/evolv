import axios from "axios";

import type {
  Profile,
  ProfilePayload,
} from "../types/profile";
import api from "./api";

export async function buscarPerfil(): Promise<Profile | null> {
  try {
    const resposta = await api.get<Profile>("/perfil");
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

export async function salvarPerfil(
  dados: ProfilePayload,
): Promise<Profile> {
  const resposta = await api.put<Profile>(
    "/perfil",
    dados,
  );

  return resposta.data;
}