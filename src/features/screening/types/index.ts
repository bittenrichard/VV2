// Representa uma Vaga como vem da API do Baserow
export interface JobPosting {
  id: number;
  order: string;
  // --- CORREÇÃO: Nomes dos campos em minúsculo para corresponder à API ---
  titulo: string;
  descricao: string;
  requisitos_obrigatorios: string;
  requisitos_desejaveis: string;
  criado_em: string;
  usuario: { id: number; value: string }[]; // Relação com a tabela Usuários
  // Campos que calcularemos depois
  candidateCount?: number;
  averageScore?: number;
}

// Representa os dados do formulário de criação de vaga
export interface JobFormData {
  jobTitle: string;
  jobDescription: string;
  requiredSkills: string;
  desiredSkills: string;
}