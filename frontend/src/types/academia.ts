export interface Exercicio {
  id: number;
  nome: string;
  grupo_muscular: string;
}

export interface ExercicioPayload {
  nome: string;
  grupo_muscular: string;
}

export interface DivisaoTreino {
  id: number;
  nome: string;
  descricao: string | null;
}

export interface ExercicioDivisao {
  id: number;
  exercicio_id: number;
  nome: string;
  grupo_muscular: string;
  ordem: number;
}

export interface DivisaoTreinoDetalhada
  extends DivisaoTreino {
  exercicios: ExercicioDivisao[];
}

export interface DivisaoTreinoPayload {
  nome: string;
  descricao: string | null;
}