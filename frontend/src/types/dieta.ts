export interface Alimento {
  id: number;
  nome: string;
}

export interface MacroAlimento {
  alimento_id: number;
  nome: string;
  quantidade_gramas: number;
  calorias: number;
  proteinas_g: number;
  carboidratos_g: number;
  gorduras_g: number;
}

export interface RegistroAlimentar {
  id: number;
  alimento_id: number;
  data: string;
  quantidade_gramas: number;
  tipo_refeicao: string;
}

export interface ItemDietaPayload {
  alimento_id: number;
  quantidade_gramas: number;
}

export interface DietaPayload {
  itens: ItemDietaPayload[];
  data: string;
  tipo_refeicao: string;
}