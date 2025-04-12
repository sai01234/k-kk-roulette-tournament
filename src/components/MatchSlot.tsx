import React from 'react';
import { Match, Participant } from '../types';

interface MatchSlotProps {
  match: Match;
  onClick: () => void;
  isClickable: boolean;
}

const ParticipantDisplay: React.FC<{ participant: Participant | null, isWinner?: boolean }> = ({ participant, isWinner = false }) => {
  const baseClasses = "px-3 py-1 text-sm rounded";
  const winnerClasses = isWinner ? "font-bold bg-green-200 text-green-800" : "bg-gray-100 text-gray-800";
  const byeClasses = "italic text-gray-500 bg-gray-50";

  if (!participant) {
    return <div className={`${baseClasses} ${byeClasses}`}>BYE / TBD</div>;
  }

  return (
    <div className={`${baseClasses} ${winnerClasses}`}>
      {participant.name} ({participant.slots})
    </div>
  );
};


const MatchSlot: React.FC<MatchSlotProps> = ({ match, onClick, isClickable }) => {
  const [p1, p2] = match.participants;
  const winner = match.winner;

  const cursorClass = isClickable ? 'cursor-pointer hover:bg-blue-100' : 'cursor-default';
  const borderClass = winner ? 'border-green-500' : (isClickable ? 'border-blue-300 hover:border-blue-500' : 'border-gray-300');

  return (
    <div
      className={`match-slot bg-white p-2 rounded shadow border-l-4 ${borderClass} ${cursorClass} transition-colors duration-150 ease-in-out`}
      onClick={isClickable ? onClick : undefined}
      title={isClickable ? "Click to start match" : (winner ? `Winner: ${winner.name}` : "Match decided or pending")}
    >
      <div className="flex flex-col space-y-1">
         <ParticipantDisplay participant={p1} isWinner={winner === p1 && p1 !== null} />
         <div className="text-center text-xs font-semibold text-gray-500">vs</div>
         <ParticipantDisplay participant={p2} isWinner={winner === p2 && p2 !== null} />
      </div>
       {match.isBye && !winner && <p className="text-xs text-center text-gray-500 mt-1">(BYE)</p>}
       {winner && <p className="text-xs text-center text-green-600 font-semibold mt-1">Winner: {winner.name}</p>}
    </div>
  );
};

export default MatchSlot;
