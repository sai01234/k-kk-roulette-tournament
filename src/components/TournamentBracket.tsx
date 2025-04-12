import React from 'react';
import { RoundData } from '../types'; // Match type removed as it's unused

import MatchSlot from './MatchSlot'; // Create this component next

interface TournamentBracketProps {
  rounds: RoundData[];
  onMatchClick: (roundIndex: number, matchIndex: number) => void;
}

const TournamentBracket: React.FC<TournamentBracketProps> = ({ rounds, onMatchClick }) => {
  if (!rounds || rounds.length === 0) {
    return <p className="text-center text-gray-500">Generating bracket...</p>;
  }

  return (
    <div className="flex space-x-8 overflow-x-auto p-4 bg-gray-200 rounded-lg shadow-inner">
      {rounds.map((round, roundIndex) => (
        <div key={`round-${round.roundNumber}`} className="flex flex-col space-y-10 justify-center min-w-[200px]">
          <h3 className="text-lg font-semibold text-center text-gray-700 mb-4">
            Round {round.roundNumber}
          </h3>
          {round.matches.map((match, matchIndex) => (
            <MatchSlot
              key={match.id}
              match={match}
              onClick={() => onMatchClick(roundIndex, matchIndex)}
              isClickable={!match.winner && !match.isBye} // Only allow clicking non-bye, undecided matches
            />
          ))}
        </div>
      ))}
    </div>
  );
};

export default TournamentBracket;
