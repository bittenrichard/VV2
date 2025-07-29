import React from 'react';
import { Draggable } from 'react-beautiful-dnd';
import { Candidate } from '../types';
import { GripVertical, CalendarPlus } from 'lucide-react';

interface CandidateCardProps {
  candidate: Candidate;
  index: number;
  onViewDetails: (candidate: Candidate) => void;
  onScheduleInterview: (candidate: Candidate) => void;
}

const CandidateCard: React.FC<CandidateCardProps> = ({ candidate, index, onViewDetails, onScheduleInterview }) => {
  const getScoreColor = (score: number) => {
    if (score >= 85) return 'bg-green-100 text-green-800';
    if (score >= 70) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  return (
    <Draggable draggableId={String(candidate.id)} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          style={provided.draggableProps.style}
          className={`bg-white rounded-lg border shadow-sm mb-4 group relative ${snapshot.isDragging ? 'shadow-xl ring-2 ring-indigo-500 rotate-3' : ''}`}
        >
          {/* A alça de arrastar agora é um ícone separado */}
          <div {...provided.dragHandleProps} className="absolute top-2 right-2 p-1 text-gray-300 group-hover:text-gray-500 cursor-grab">
            <GripVertical size={16} />
          </div>

          {/* Área de clique para detalhes */}
          <div className="p-4 cursor-pointer" onClick={() => onViewDetails(candidate)}>
            <div className="flex justify-between items-start">
              <h4 className="font-bold text-gray-900 pr-8">{candidate.nome}</h4>
              <div className={`px-2 py-1 rounded-full text-xs font-bold ${getScoreColor(candidate.score || 0)}`}>
                {candidate.score || 0}%
              </div>
            </div>
            <p className="text-sm text-gray-600 mt-2 line-clamp-3 h-[60px]">
              {candidate.resumo_ia || 'Sem resumo disponível.'}
            </p>
          </div>

          {candidate.status?.value === 'Entrevista' && (
            <div className="border-t p-2 flex justify-end">
              <button 
                onClick={(e) => { e.stopPropagation(); onScheduleInterview(candidate); }}
                className="flex items-center text-sm font-semibold text-indigo-600 hover:text-indigo-800 p-2 rounded-md hover:bg-indigo-50 transition-colors"
              >
                <CalendarPlus size={16} className="mr-2" />
                Agendar Entrevista
              </button>
            </div>
          )}
        </div>
      )}
    </Draggable>
  );
};

export default CandidateCard;