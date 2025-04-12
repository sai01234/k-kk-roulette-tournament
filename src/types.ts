export interface Participant {
  name: string;
  slots: number;
}

export interface Match {
  id: string;
  round: number;
  matchNumber: number;
  participants: (Participant | null)[];
  winner: Participant | null;
  isBye?: boolean;
}

export interface RoundData {
  roundNumber: number;
  matches: Match[];
}
