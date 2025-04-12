
import React, { useState } from 'react';
import SetupScreen from './components/SetupScreen';
import TournamentBracket from './components/TournamentBracket'; // Create this component next
import RouletteAnimation from './components/RouletteAnimation'; // Import the roulette component

import { Participant, RoundData } from './types'; // Import shared types
import { generateTournamentBrackets } from './utils/tournamentUtils'; // Import the generation function

function App() {

  const [tournamentRounds, setTournamentRounds] = useState<RoundData[]>([]);
  const [view, setView] = useState<'setup' | 'tournament' | 'results'>('setup');
  const [tournamentName, setTournamentName] = useState<string>(''); // Add state for tournament name
  const [activeMatch, setActiveMatch] = useState<{ roundIndex: number; matchIndex: number } | null>(null); // Track the match for the roulette

  const handleSetupComplete = (name: string, importedParticipants: Participant[]) => {
    console.log('Setup complete. Name:', name, 'Participants:', importedParticipants);
    setTournamentName(name); // Store the name
    const rounds = generateTournamentBrackets(importedParticipants);
    console.log('Generated Rounds:', rounds);
    setTournamentRounds(rounds);
    setView('tournament'); // Switch view after import and generation
  };

  const handleMatchComplete = (roundIndex: number, matchIndex: number, winner: Participant) => {
    console.log(`Match complete: Round ${roundIndex + 1}, Match ${matchIndex + 1}, Winner: ${winner.name}`);

    setTournamentRounds(prevRounds => {
        const newRounds = JSON.parse(JSON.stringify(prevRounds)); // Deep copy to avoid state mutation issues
        const match = newRounds[roundIndex].matches[matchIndex];
        const participants = match.participants as [Participant, Participant]; // Assume valid match participants here
        const loser = participants.find(p => p?.name !== winner.name);

        if (loser) {
            winner.slots += loser.slots;
        }
        match.winner = winner;

        const nextRoundIndex = roundIndex + 1;
        if (nextRoundIndex < newRounds.length) {
            const nextMatchIndex = Math.floor(matchIndex / 2);
            const nextMatch = newRounds[nextRoundIndex].matches[nextMatchIndex];
            const participantIndex = matchIndex % 2; // 0 for the first slot, 1 for the second
            nextMatch.participants[participantIndex] = winner;
        } else {
            console.log("Tournament Winner:", winner.name);
            setView('results'); // Switch to results view
        }

        return newRounds;
    });

    setActiveMatch(null); // Hide roulette after completion
  };

  return (
    <div className="container mx-auto p-4 min-h-screen bg-gray-100">
      <h1 className="text-4xl font-bold text-center text-indigo-800 my-6 shadow-sm">

      {/* Roulette Animation Modal */}
      {activeMatch && tournamentRounds[activeMatch.roundIndex]?.matches[activeMatch.matchIndex]?.participants.length === 2 && (
        <RouletteAnimation
          participants={tournamentRounds[activeMatch.roundIndex].matches[activeMatch.matchIndex].participants as [Participant, Participant]}
          isVisible={!!activeMatch}
          onAnimationComplete={(winner) => {
            handleMatchComplete(activeMatch.roundIndex, activeMatch.matchIndex, winner);
          }}
        />
      )}

        {tournamentName || 'Roulette Battle Tournament'} {/* Display name */}
      </h1>

      {view === 'setup' && (
        <SetupScreen onSetupComplete={handleSetupComplete} />
      )}

      {view === 'tournament' && tournamentRounds.length > 0 && (
         <TournamentBracket
            rounds={tournamentRounds}
            onMatchClick={(roundIndex: number, matchIndex: number) => { // Added types
                console.log(`Match clicked: Round ${roundIndex + 1}, Match ${matchIndex + 1}`);
                const match = tournamentRounds[roundIndex]?.matches[matchIndex];
                if (match && match.participants.length === 2 && match.participants[0] && match.participants[1] && !match.winner) {
                     setActiveMatch({ roundIndex, matchIndex });
                } else {
                    console.log("Cannot start match: Invalid participants or match already decided.");
                }
            }}
         />
      )}

      {/* TODO: Add Results View */}
      {view === 'results' && (
        <div>
            <h2 className="text-3xl font-bold mb-6 text-center text-green-700">Tournament Over!</h2>
            {/* Find the winner of the final match */}
            {tournamentRounds.length > 0 && (() => {
                const finalRound = tournamentRounds[tournamentRounds.length - 1];
                const finalMatch = finalRound.matches[0];
                const winner = finalMatch.winner;
                return winner ? (
                    <div className="text-center bg-white p-6 rounded-lg shadow-lg">
                        <p className="text-xl mb-2">🏆 Winner: 🏆</p>
                        <p className="text-4xl font-extrabold text-yellow-500">{winner.name}</p>
                        <p className="text-lg text-gray-600 mt-2">Final Slots: {winner.slots}</p>
                        <button
                            onClick={() => {
                                setTournamentRounds([]);
                                setTournamentName('');
                                setActiveMatch(null);
                                setView('setup');
                            }}
                            className="mt-6 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                        >
                            New Tournament
                        </button>
                    </div>
                ) : (
                    <p className="text-center text-red-500">Could not determine winner.</p>
                );
            })()}
        </div>
      )}
    </div>
  );
}

export default App;
