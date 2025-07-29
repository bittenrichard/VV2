import { useState } from 'react';
import { JobFormData, JobPosting } from '../types';
import { baserow } from '../../../shared/services/baserowClient';
import { useAuth } from '../../auth/hooks/useAuth';

// --- ID ATUALIZADO AQUI ---
const VAGAS_TABLE_ID = '709';

export const useJobForm = () => {
  const { profile } = useAuth();
  const [formData, setFormData] = useState<JobFormData>({
    jobTitle: '',
    jobDescription: '',
    requiredSkills: '',
    desiredSkills: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateField = (field: keyof JobFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const submitJob = async (): Promise<JobPosting | null> => {
    if (!profile) {
      setError("Você precisa estar logado para criar uma vaga.");
      return null;
    }

    setIsSubmitting(true);
    setError(null);
    
    try {
      const newJobData = {
        "titulo": formData.jobTitle,
        "descricao": formData.jobDescription,
        "requisitos_obrigatorios": formData.requiredSkills,
        "requisitos_desejaveis": formData.desiredSkills,
        "usuario": [profile.id]
      };

      const createdJob = await baserow.post(VAGAS_TABLE_ID, newJobData);
      
      setIsSubmitting(false);
      return createdJob as JobPosting;

    } catch (err) {
      console.error("Erro ao criar vaga no Baserow:", err);
      setError("Não foi possível criar a vaga. Tente novamente.");
      setIsSubmitting(false);
      return null;
    }
  };

  const resetForm = () => {
    setFormData({
      jobTitle: '',
      jobDescription: '',
      requiredSkills: '',
      desiredSkills: ''
    });
  };

  return {
    formData,
    isSubmitting,
    error,
    updateField,
    submitJob,
    resetForm
  };
};