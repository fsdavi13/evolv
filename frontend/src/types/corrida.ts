export interface Corrida {
  id: number;
  data: string;
  distancia_km: number;
  pace: string;
  pace_segundos: number;
  tempo_total_segundos: number;
  observacoes: string | null;
}

export interface CorridaPayload {
  data: string;
  distancia_km: number;
  pace: string;
  observacoes?: string | null;
}