import React from 'react';
import { Droppable } from 'react-beautiful-dnd';
import { Candidate } from '../types';
import CandidateCard from './CandidateCard';

interface KanbanColumnProps {
  columnId: string;
  title: string;
  candidates: Candidate[];
  onViewDetails: (candidate: Candidate) => void;
  onScheduleInterview: (candidate: Candidate) => void;
}

const KanbanColumn: React.FC<KanbanColumnProps> = ({ columnId, title, candidates, onViewDetails, onScheduleInterview }) => {
  return (
    <div className="bg-gray-100 rounded-lg p-4 w-full md:w-80 lg:w-96 flex-shrink-0 h-full flex flex-col">
      <h3 className="font-bold text-gray-800 mb-4 px-2">{title} ({candidates.length})</h3>
      <Droppable droppableId={columnId}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`flex-grow p-2 rounded-md transition-all duration-300 ease-in-out border-2 border-dashed
              ${snapshot.isDraggingOver ? 'border-indigo-400 bg-indigo-50' : 'border-transparent'}`}
          >
            {candidates.map((candidate, index) => (
              <CandidateCard
                key={candidate.id}
                candidate={candidate}
                index={index}
                onViewDetails={onViewDetails}
                onScheduleInterview={onScheduleInterview}
              />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
};

export default KanbanColumn;