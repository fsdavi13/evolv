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

export interface Treino {
  id: number;
  divisao_id: number;
  divisao_nome: string;
  iniciado_em: string;
  finalizado_em: string | null;
  observacoes: string | null;
  finalizado: boolean;
}

export interface Serie {
  id: number;
  treino_id: number;
  exercicio_id: number;
  peso: number;
  repeticoes: number;
  observacoes: string | null;
  data: string;
}

export interface IniciarTreinoPayload {
  divisao_id: number;
  observacoes?: string | null;
}

export interface FinalizarTreinoPayload {
  observacoes?: string | null;
}

export interface SeriePayload {
  treino_id: number;
  exercicio_id: number;
  peso: number;
  repeticoes: number;
  observacoes?: string | null;
}

export interface Treino {
  id: number;
  divisao_id: number;
  divisao_nome: string;
  iniciado_em: string;
  finalizado_em: string | null;
  observacoes: string | null;
  finalizado: boolean;
}

export interface TreinoDetalhado extends Treino {
  series: Serie[];
}

export interface Serie {
  id: number;
  treino_id: number;
  exercicio_id: number;
  peso: number;
  repeticoes: number;
  observacoes: string | null;
  data: string;
}

export interface IniciarTreinoPayload {
  divisao_id: number;
  observacoes?: string | null;
}

export interface FinalizarTreinoPayload {
  observacoes?: string | null;
}

export interface SeriePayload {
  treino_id: number;
  exercicio_id: number;
  data: string;
  peso: number;
  repeticoes: number;
  observacoes?: string | null;
}