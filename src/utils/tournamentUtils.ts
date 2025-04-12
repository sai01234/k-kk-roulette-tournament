import { Participant } from '../types'; // Assuming types are defined in src/types.ts

export interface Match {
  id: string;
  round: number;
  matchNumber: number; // Within the round
  participants: (Participant | null)[]; // Can have null for byes or TBD
  winner: Participant | null;
  isBye?: boolean;
}

export interface Round {
  roundNumber: number;
  matches: Match[];
}

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function generateTournamentBrackets(participants: Participant[]): Round[] {
  if (participants.length < 2) {
    return [];
  }

  const shuffledParticipants = shuffleArray(participants);
  const numParticipants = shuffledParticipants.length;
  const numRounds = Math.ceil(Math.log2(numParticipants));
  const totalSlots = Math.pow(2, numRounds); // Total slots in the first round for a balanced bracket
  const numByes = totalSlots - numParticipants;

  const rounds: Round[] = [];
  let currentParticipants: (Participant | null)[] = [];
  let matchCounter = 0;

  const round1Matches: Match[] = [];
  let participantIndex = 0;

  const firstRoundSlots: (Participant | null)[] = new Array(totalSlots).fill(null);
  for(let i = 0; i < numByes; i++) {
      firstRoundSlots[i] = null; // Or a specific 'BYE' object if preferred
  }
   for(let i = numByes; i < totalSlots; i++) {
      if(participantIndex < numParticipants) {
          firstRoundSlots[i] = shuffledParticipants[participantIndex++];
      }
  }
  const finalFirstRoundSlots = shuffleArray(firstRoundSlots);


  for (let i = 0; i < totalSlots; i += 2) {
    matchCounter++;
    const p1 = finalFirstRoundSlots[i];
    const p2 = finalFirstRoundSlots[i + 1];
    const isByeMatch = p1 === null || p2 === null;
    let winner: Participant | null = null;

    if (isByeMatch) {
        winner = p1 !== null ? p1 : p2;
    }

    round1Matches.push({
      id: `R1M${matchCounter}`,
      round: 1,
      matchNumber: matchCounter,
      participants: [p1, p2],
      winner: winner, // Winner is known for bye matches
      isBye: isByeMatch,
    });
  }
  rounds.push({ roundNumber: 1, matches: round1Matches });
  currentParticipants = round1Matches.map(match => match.winner); // Winners (including those from byes) advance

  for (let r = 2; r <= numRounds; r++) {
    const previousRoundWinners = currentParticipants.filter(p => p !== null); // Filter out any potential nulls if logic changes
    const roundMatches: Match[] = [];
    const numMatchesThisRound = previousRoundWinners.length / 2;
    matchCounter = 0; // Reset match counter for the new round

    for (let i = 0; i < numMatchesThisRound; i++) {
      matchCounter++;
      const p1 = previousRoundWinners[i * 2];
      const p2 = previousRoundWinners[i * 2 + 1];
      roundMatches.push({
        id: `R${r}M${matchCounter}`,
        round: r,
        matchNumber: matchCounter,
        participants: [p1 ?? null, p2 ?? null], // Ensure participants are Participant or null
        winner: null, // Winner TBD
      });
    }
    rounds.push({ roundNumber: r, matches: roundMatches });
    currentParticipants = new Array(numMatchesThisRound).fill(null);
  }

  return rounds;
}
