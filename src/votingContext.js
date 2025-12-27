import React, { createContext, useContext, useReducer } from "react";

const VOTERS = ["Bert", "Birger", "Dave", "Ewoud", "Tom"];
const OPTIONS = ["Taghazout", "Albanie", "Malta", "FuerteVentura", "Chartreuse (drank)", "Tunesie"];

// Weighted sum elimination ("Borda count"): loser = highest sum.
function weightedFindLoser(ballots, candidates) {
  const score = {};
  candidates.forEach(c => (score[c] = 0));
  ballots.forEach(ranking => {
    ranking.forEach((cand, idx) => {
      if (candidates.includes(cand)) {
        score[cand] += idx + 1;
      }
    });
  });
  const maxSum = Math.max(...Object.values(score));
  const losers = Object.entries(score).filter(([_, v]) => v === maxSum).map(([k]) => k);
  return {
    loser: losers.length === 1 ? losers[0] : losers[Math.floor(Math.random() * losers.length)],
    score,
  };
}

const initialState = {
  stage: "setup",
  candidates: [...OPTIONS],
  round: 1,
  ballots: [],
  currentBallot: 0,
  eliminatedHistory: [],
  scoreHistory: [],
  loser: null,
  winner: null,
  pendingAnnouncement: false,
};

function votingReducer(state, action) {
  switch (action.type) {
    case "START_VOTING":
      return {
        ...initialState,
        stage: "voting",
      };

    case "SUBMIT_BALLOT": {
      const updated = [...state.ballots, action.payload];
      if (state.currentBallot + 1 < VOTERS.length) {
        return {
          ...state,
          ballots: updated,
          currentBallot: state.currentBallot + 1,
        };
      } else {
        return {
          ...state,
          ballots: updated,
          stage: "announce",
          pendingAnnouncement: true,
        };
      }
    }

    case "REVEAL_RESULT": {
      const { loser, score } = weightedFindLoser(state.ballots, state.candidates);
      
      // Final round (two candidates): loser is not the winner
      if (state.candidates.length === 2) {
        return {
          ...state,
          winner: state.candidates.find(c => c !== loser),
          scoreHistory: [...state.scoreHistory, score],
          eliminatedHistory: [...state.eliminatedHistory, loser],
          stage: "winner",
          pendingAnnouncement: false,
        };
      } else {
        return {
          ...state,
          loser,
          scoreHistory: [...state.scoreHistory, score],
          eliminatedHistory: [...state.eliminatedHistory, loser],
          stage: "eliminated",
          pendingAnnouncement: false,
        };
      }
    }

    case "NEXT_ROUND": {
      const remain = state.candidates.filter(c => c !== state.loser);
      return {
        ...state,
        candidates: remain,
        ballots: [],
        currentBallot: 0,
        round: state.round + 1,
        loser: null,
        stage: "voting",
      };
    }

    case "RESET":
      return initialState;

    default:
      return state;
  }
}

const VotingContext = createContext();

export function VotingProvider({ children }) {
  const [state, dispatch] = useReducer(votingReducer, initialState);

  return (
    <VotingContext.Provider value={{ state, dispatch }}>
      {children}
    </VotingContext.Provider>
  );
}

export function useVoting() {
  const context = useContext(VotingContext);
  if (!context) {
    throw new Error("useVoting must be used within VotingProvider");
  }
  return context;
}

export { VOTERS, OPTIONS };
