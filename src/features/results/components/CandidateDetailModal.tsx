import React from 'react';
import { X, User, Star, Briefcase, FileText, MessageCircle, Download } from 'lucide-react';
import { Candidate } from '../types';
import { formatPhoneNumberForWhatsApp } from '../../../shared/utils/formatters';

interface CandidateDetailModalProps {
  candidate: Candidate | null;
  onClose: () => void;
}

const CandidateDetailModal: React.FC<CandidateDetailModalProps> = ({ candidate, onClose }) => {
  if (!candidate) return null;

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-500';
    if (score >= 70) return 'text-yellow-500';
    return 'text-red-500';
  };

  const whatsappNumber = formatPhoneNumberForWhatsApp(candidate.telefone);
  const curriculumAvailable = candidate.curriculo && candidate.curriculo[0];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4 transition-opacity duration-300">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col transform transition-all duration-300 scale-95 opacity-0 animate-scale-in">
        <div className="flex justify-between items-center p-4 border-b bg-gray-50 rounded-t-lg">
          <h2 className="text-xl font-bold text-gray-800">Detalhes do Candidato</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800 transition-colors">
            <X size={24} />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto space-y-6">
          <div className="flex items-center space-x-4">
            <div className="bg-indigo-100 text-indigo-600 p-3 rounded-full">
              <User size={32} />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900">{candidate.nome}</h3>
              <p className="text-md text-gray-500">{candidate.telefone || 'Telefone não informado'}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center text-gray-500 mb-1">
                <Star size={16} className="mr-2" />
                <span className="text-sm font-semibold">Score de Aderência</span>
              </div>
              <p className={`text-3xl font-bold ${getScoreColor(candidate.score || 0)}`}>
                {candidate.score || 0}%
              </p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center text-gray-500 mb-1">
                <Briefcase size={16} className="mr-2" />
                <span className="text-sm font-semibold">Vaga Aplicada</span>
              </div>
              <p className="text-lg font-semibold text-gray-800">{candidate.vaga && candidate.vaga[0] ? candidate.vaga[0].value : 'Não informada'}</p>
            </div>
          </div>

          <div>
            <div className="flex items-center text-gray-600 mb-2">
              <FileText size={18} className="mr-2" />
              <h4 className="text-lg font-bold">Resumo da Inteligência Artificial</h4>
            </div>
            <p className="text-gray-700 bg-gray-50 p-4 rounded-lg border leading-relaxed">
              {candidate.resumo_ia || "Nenhum resumo disponível."}
            </p>
          </div>
        </div>

        <div className="p-4 border-t bg-gray-50 rounded-b-lg flex justify-end items-center gap-3">
           <a
            href={curriculumAvailable ? curriculumAvailable.url : undefined}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => !curriculumAvailable && e.preventDefault()}
            className={`flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold rounded-md transition-colors ${
                curriculumAvailable 
                ? 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50' 
                : 'bg-gray-100 border border-gray-200 text-gray-400 cursor-not-allowed'
            }`}
            title={curriculumAvailable ? 'Baixar currículo' : 'Currículo não disponível'}
          >
            <Download size={16} />
            Currículo
          </a>
          <a
            href={whatsappNumber ? `https://wa.me/${whatsappNumber}` : undefined}
            target="_blank"
            rel="noopener noreferrer"
            className={`
              flex items-center justify-center gap-2 px-6 py-2 
              bg-indigo-600 text-white font-semibold rounded-md 
              transition-colors
              ${!whatsappNumber 
                ? 'opacity-50 cursor-not-allowed' 
                : 'hover:bg-indigo-700'
              }
            `}
            onClick={(e) => !whatsappNumber && e.preventDefault()}
            title={whatsappNumber ? 'Chamar candidato no WhatsApp' : 'Telefone não disponível para contato'}
          >
            <MessageCircle size={18} />
            Chamar Candidato
          </a>
        </div>
      </div>
      <style>{`
        @keyframes scale-in {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .animate-scale-in {
          animation: scale-in 0.2s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default CandidateDetailModal;