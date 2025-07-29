// Local: src/features/results/types/index.ts

export interface Candidate {
  id: number;
  order: string;
  nome: string;
  email?: string;
  telefone: string | null;
  score: number | null;
  resumo_ia: string | null;
  data_triagem: string;
  vaga: { id: number; value: string }[];
  usuario: { id: number; value: string }[];
  curriculo?: { url: string; name: string }[];
  
  cidade?: string;
  bairro?: string;
  idade?: number;
  // --- CORREÇÃO APLICADA AQUI: Trocado de objeto para string ---
  sexo?: string;
  escolaridade?: string;
  // --- FIM DA CORREÇÃO ---
  status?: { id: number; value: 'Triagem' | 'Entrevista' | 'Aprovado' | 'Reprovado' };
}