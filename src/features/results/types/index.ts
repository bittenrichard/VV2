// Representa um Candidato como vem da API do Baserow
export interface Candidate {
  id: number;
  order: string;
  nome: string;
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
  sexo?: { id: number; value: string };
  escolaridade?: { id: number; value: string };
  // --- TIPO DO STATUS ATUALIZADO PARA O KANBAN ---
  status?: { id: number; value: 'Triagem' | 'Entrevista' | 'Aprovado' | 'Reprovado' };
}