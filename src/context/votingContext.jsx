import React, { createContext, useContext, useReducer, useEffect } from "react";
import { weightedFindLoser } from "../utils/votingUtils";
import { updateSession } from "../services/sessionService";
import { getRoundBallots } from "../services/ballotService";

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
  stage: "home",
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
  // New Supabase session fields
  sessionId: null,
  hostToken: null,
  voterName: null,
  isHost: false,
  session: null,
};

// Initialize state based on saved state and config
function initializeState() {
  // Check for saved voter session (multi-device voter)
  try {
    const voterSession = localStorage.getItem('voter_session');
    if (voterSession) {
      const { sessionId, voterName } = JSON.parse(voterSession);
      return {
        ...defaultInitialState,
        stage: "lobby",
        sessionId,
        voterName,
        isHost: false,
      };
    }
  } catch (error) {
    console.error("Failed to load voter session:", error);
  }

  // Check for saved host session
  const savedState = loadStateFromStorage();
  if (savedState) {
    // Only restore if it's a Supabase session with hostToken
    if (savedState.sessionId && savedState.hostToken) {
      return savedState;
    }
    // Legacy local-only state - start fresh
    clearStorage();
  }

  // Start at home screen
  return defaultInitialState;
}

function votingReducer(state, action) {
  switch (action.type) {
    case "GOTO_CREATE_SESSION":
      return { ...state, stage: "createSession" };

    case "GOTO_JOIN_SESSION":
      // Clear host state when switching to join mode (important for same-browser host+voter)
      return {
        ...state,
        stage: "joinSession",
        isHost: false,
        hostToken: null,
      };

    case "SESSION_CREATED":
      return {
        ...state,
        stage: "hostDashboard",
        sessionId: action.payload.session.id,
        hostToken: action.payload.hostToken,
        session: action.payload.session,
        isHost: true,
        voters: action.payload.session.voters,
        candidates: action.payload.session.candidates,
      };

    case "SESSION_JOINED":
      return {
        ...state,
        stage: "lobby",
        sessionId: action.payload.session.id,
        session: action.payload.session,
        voterName: action.payload.voterName,
        isHost: false,
        voters: action.payload.session.voters,
        candidates: action.payload.session.candidates,
      };

    case "VOTING_STARTED":
      return {
        ...state,
        stage: "voting",
        session: action.payload,
        round: action.payload.round,
        candidates: action.payload.candidates.filter(c => !(action.payload.eliminated || []).includes(c)),
      };

    case "HOST_START_VOTING":
      // The component will call updateSession, then dispatch UPDATE_SESSION
      return { ...state };

    case "VOTER_SUBMITTED":
      return { ...state, stage: "voterSubmitted" };

    case "VOTER_SESSION_UPDATE": {
      const session = action.payload;
      // Determine what stage the voter should see based on session state
      if (session.stage === "winner") {
        return {
          ...state,
          stage: "winner",
          session,
          winner: session.winner,
          eliminatedHistory: session.eliminated || [],
          scoreHistory: session.score_history || [],
        };
      } else if (session.stage === "eliminated") {
        const lastEliminated = session.eliminated?.[session.eliminated.length - 1];
        return {
          ...state,
          stage: "eliminated",
          session,
          loser: lastEliminated,
          eliminatedHistory: session.eliminated || [],
          scoreHistory: session.score_history || [],
        };
      } else if (session.stage === "voting") {
        // Next round started, voter needs to vote again
        return {
          ...state,
          stage: "voting",
          session,
          round: session.round,
          candidates: session.candidates.filter(c => !(session.eliminated || []).includes(c)),
        };
      }
      return state;
    }

    case "UPDATE_SESSION":
      return {
        ...state,
        session: action.payload,
        round: action.payload.round || state.round,
        candidates: action.payload.candidates
          ? action.payload.candidates.filter(c => !(action.payload.eliminated || []).includes(c))
          : state.candidates,
      };

    case "HOST_REVEAL":
      // This will be handled asynchronously by the component
      return { ...state };

    case "SHOW_ELIMINATED":
      return {
        ...state,
        stage: "eliminated",
        loser: action.payload.loser,
        scoreHistory: [...state.scoreHistory, action.payload.score],
        eliminatedHistory: [...state.eliminatedHistory, action.payload.loser],
        session: action.payload.session,
      };

    case "SHOW_WINNER":
      return {
        ...state,
        stage: "winner",
        winner: action.payload.winner,
        scoreHistory: [...state.scoreHistory, action.payload.score],
        eliminatedHistory: [...state.eliminatedHistory, action.payload.loser],
        session: action.payload.session,
      };

    case "NEXT_ROUND_SUPABASE":
      return {
        ...state,
        stage: "hostDashboard",
        session: action.payload,
        round: action.payload.round,
        candidates: action.payload.candidates.filter(c => !(action.payload.eliminated || []).includes(c)),
        loser: null,
      };

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
      if (state.currentBallot + 1 < state.voters.length) {
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
      // Also clear voter session
      try {
        localStorage.removeItem('voter_session');
      } catch (e) {
        console.error("Failed to clear voter session:", e);
      }
      return {
        ...defaultInitialState,
        stage: "home"
      };

    default:
      return state;
  }
}

const VotingContext = createContext();

export function VotingProvider({ children }) {
  const [state, dispatch] = useReducer(votingReducer, null, initializeState);

  // Save host session state to localStorage (for host persistence)
  useEffect(() => {
    if (state.isHost && state.sessionId && state.hostToken) {
      saveStateToStorage(state);
    }
  }, [state]);

  // Wrap dispatch to handle async actions
  const asyncDispatch = async (action) => {
    if (action.type === "HOST_START_VOTING" && state.hostToken) {
      try {
        const updatedSession = await updateSession(
          state.sessionId,
          { stage: "voting" },
          state.hostToken
        );
        dispatch({ type: "UPDATE_SESSION", payload: updatedSession });
      } catch (error) {
        console.error("Failed to start voting:", error);
      }
    } else if (action.type === "HOST_REVEAL" && state.hostToken) {
      try {
        // Fetch all ballots for this round
        const ballots = await getRoundBallots(state.sessionId, state.round, state.hostToken);

        // Convert ballot format to rankings array
        const rankings = ballots.map(b => b.rankings);

        // Calculate loser using existing voting logic
        const currentCandidates = state.candidates;
        const { loser, score } = weightedFindLoser(rankings, currentCandidates);

        const newEliminated = [...(state.session.eliminated || []), loser];

        if (currentCandidates.length === 2) {
          // Final round - we have a winner
          const winner = currentCandidates.find(c => c !== loser);
          const updatedSession = await updateSession(
            state.sessionId,
            {
              stage: "winner",
              eliminated: newEliminated,
              winner: winner,
              score_history: [...(state.session.score_history || []), score]
            },
            state.hostToken
          );
          dispatch({
            type: "SHOW_WINNER",
            payload: { winner, loser, score, session: updatedSession }
          });
        } else {
          // More rounds to go
          const updatedSession = await updateSession(
            state.sessionId,
            {
              stage: "eliminated",
              eliminated: newEliminated,
              score_history: [...(state.session.score_history || []), score]
            },
            state.hostToken
          );
          dispatch({
            type: "SHOW_ELIMINATED",
            payload: { loser, score, session: updatedSession }
          });
        }
      } catch (error) {
        console.error("Failed to reveal result:", error);
      }
    } else if (action.type === "NEXT_ROUND" && state.isHost && state.hostToken) {
      try {
        const updatedSession = await updateSession(
          state.sessionId,
          {
            stage: "voting",
            round: state.round + 1
          },
          state.hostToken
        );
        dispatch({ type: "NEXT_ROUND_SUPABASE", payload: updatedSession });
      } catch (error) {
        console.error("Failed to start next round:", error);
        // Fallback to local state
        dispatch(action);
      }
    } else {
      dispatch(action);
    }
  };

  return (
    <VotingContext.Provider value={{ state, dispatch: asyncDispatch }}>
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

export { DEFAULT_CONFIG };
