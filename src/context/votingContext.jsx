import React, { createContext, useContext, useReducer, useEffect } from "react";
import { weightedFindLoser } from "../utils/votingUtils";

const DEFAULT_CONFIG = {
  voters: ["Bert", "Birger", "Dave", "Ewoud", "Tom"],
  candidates: ["Taghazout", "Albanie", "Malta", "FuerteVentura", "Chartreuse (drank)", "Tunesie"]
};

const VOTERS = DEFAULT_CONFIG.voters;
const OPTIONS = DEFAULT_CONFIG.candidates;

const STORAGE_KEY = "voting-app-state";
const CONFIG_STORAGE_KEY = "voting-app-config";

export function loadConfig() {
  try {
    const saved = localStorage.getItem(CONFIG_STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (error) {
    console.error("Failed to load config from localStorage", error);
  }
  return DEFAULT_CONFIG;
}

export function saveConfig(config) {
  try {
    localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(config));
  } catch (error) {
    console.error("Failed to save config to localStorage:", error);
  }
}

export function clearConfig() {
  try {
    localStorage.removeItem(CONFIG_STORAGE_KEY);
  } catch (error) {
    console.error("Failed to clear config from localStorage:", error);
  }
}

// Helper function to load state from localStorage
function loadStateFromStorage() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (error) {
    console.error("Failed to load state from localStorage:", error);
  }
  return null;
}

// Helper function to save state to localStorage
function saveStateToStorage(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error("Failed to save state to localStorage:", error);
  }
}

// Helper function to clear localStorage
function clearStorage() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error("Failed to clear localStorage:", error);
  }
}

const defaultInitialState = {
  stage: "setup",
  voters: [],
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

// Initialize state based on saved state and config
function initializeState() {
  const savedState = loadStateFromStorage();
  if (savedState) {
    return savedState;
  }

  const hasSavedConfig = localStorage.getItem(CONFIG_STORAGE_KEY) !== null;
  const config = loadConfig();

  return {
    ...defaultInitialState,
    stage: hasSavedConfig ? "setup" : "configure",
    voters: config.voters,
    candidates: config.candidates
  };
}

function votingReducer(state, action) {
  switch (action.type) {
    case "START_VOTING": {
      const config = loadConfig();
      return {
        ...defaultInitialState,
        voters: config.voters,
        candidates: config.candidates,
        stage: "voting",
      };
    }

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

    case "UPDATE_CONFIG":
      saveConfig(action.payload);
      return state;

    case "GOTO_SETUP":
      return {
        ...state,
        stage: "setup"
      };

    case "GOTO_CONFIGURE":
      return {
        ...state,
        stage: "configure"
      };

    case "RESET":
      clearStorage();
      return defaultInitialState;

    default:
      return state;
  }
}

const VotingContext = createContext();

export function VotingProvider({ children }) {
  const [state, dispatch] = useReducer(votingReducer, null, initializeState);

  // Auto-save state to localStorage whenever it changes
  useEffect(() => {
    saveStateToStorage(state);
  }, [state]);

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

export { VOTERS, OPTIONS, DEFAULT_CONFIG };
