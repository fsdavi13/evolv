export interface ResumoAcademia {
  quantidade_series: number;
  quantidade_exercicios: number;
  volume_total: number;
}

export interface ResumoCorrida {
  quantidade_corridas: number;
  distancia_total_km: number;
  tempo_total_segundos: number;
  melhor_pace: string | null;
}

export interface ResumoDieta {
  quantidade_registros: number;
  calorias: number;
  proteinas_g: number;
  carboidratos_g: number;
  gorduras_g: number;
}

export type SituacaoCalorica =
  | "deficit"
  | "manutencao"
  | "superavit";

export interface ResumoMetabolico {
  perfil_cadastrado: boolean;
  tmb: number | null;
  gasto_diario: number | null;
  saldo_calorico: number | null;
  situacao_calorica: SituacaoCalorica | null;
}

export interface Dashboard {
  data: string;
  academia: ResumoAcademia;
  corrida: ResumoCorrida;
  dieta: ResumoDieta;
  metabolismo: ResumoMetabolico;
}