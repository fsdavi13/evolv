export type Sexo = "masculino" | "feminino";

export type NivelAtividade =
  | "sedentario"
  | "levemente_ativo"
  | "moderadamente_ativo"
  | "muito_ativo"
  | "extremamente_ativo";

export interface ProfilePayload {
  peso_kg: number;
  altura_cm: number;
  idade: number;
  sexo: Sexo;
  nivel_atividade: NivelAtividade;
}

export interface Profile extends ProfilePayload {
  id: number;
}