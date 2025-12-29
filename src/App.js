import React from "react";
import { useVoting, VOTERS, OPTIONS } from "./votingContext";
import { Chip } from "./components/Chip";
import BallotForm from "./components/BallotForm";
import "./App.scss";

export default function App() {
  const { state, dispatch } = useVoting();
  const {
    stage,
    candidates,
    round,
    currentBallot,
    eliminatedHistory,
    scoreHistory,
    loser,
    winner,
  } = state;

  const historyArr = eliminatedHistory.map((el, idx) => ({
    round: idx + 1,
    eliminated: el,
    score: scoreHistory[idx],
  }));

  const suspenseText =
    candidates.length === 2
      ? "And the winner is..."
      : "And the loser is...";

  const startVoting = () => dispatch({ type: "START_VOTING" });
  const revealLoserOrWinner = () => dispatch({ type: "REVEAL_RESULT" });
  const handleNextRound = () => dispatch({ type: "NEXT_ROUND" });
  const handleReset = () => dispatch({ type: "RESET" });

  return (
    <div className="app__container">
      <header className="app__header">
        <h1 className="app__title">🗳️ 2025 Pitch Voting</h1>
      </header>

      <main id="main-content" role="main">
        <div aria-live="polite" aria-atomic="true" className="sr-only">
          {stage === "setup" && "Voting setup screen"}
          {stage === "voting" && `Voting round ${round}, ${VOTERS[currentBallot]}'s turn`}
          {stage === "announce" && "Preparing to reveal results"}
          {stage === "eliminated" && `${loser} has been eliminated`}
          {stage === "winner" && `${winner} is the winner`}
        </div>

        {/* Setup */}
        {stage === "setup" && (
        <div className="setup-card">
          <div className="setup-card__section">
            <h2 className="setup-card__heading">Voters</h2>
            <div className="setup-card__chips">
              {VOTERS.map(v => (
                <Chip label={v} key={v} color="secondary" />
              ))}
            </div>
          </div>
          <div className="setup-card__section">
            <p><strong>Candidates:</strong></p>
            <div className="setup-card__chips">
              {OPTIONS.map(c => (
                <Chip
                  key={c}
                  label={c}
                  color="primary"
                  variant="outlined"
                  size="small"
                />
              ))}
            </div>
          </div>
          <button
            className="setup-card__button"
            onClick={startVoting}
            aria-label="Start the voting process with all voters and candidates"
          >
            Start Voting
          </button>
        </div>
        )}

        {/* Voting round */}
        {stage === "voting" && (
        <div className="voting">
          <h2 className="voting__voter-title">
            {VOTERS[currentBallot]}'s turn to vote
          </h2>
          
          <div className="stepper">
            {Array.from({ length: OPTIONS.length - 1 }).map((_, idx) => (
              <div 
                key={idx} 
                className={`stepper__step ${idx + 1 === round ? 'stepper__step--active' : ''} ${idx + 1 < round ? 'stepper__step--completed' : ''}`}
              >
                <div className="stepper__step-circle">{idx + 1}</div>
                <div className="stepper__step-label">
                  Round {idx + 1}
                  {idx < eliminatedHistory.length && (
                    <div>
                      <Chip
                        label={`✗ ${eliminatedHistory[idx]}`}
                        size="small"
                        color="error"
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="voting__info-card">
            <div className="voting__info-section">
              <span className="voting__label">Remaining:</span>
              {candidates.map(c => (
                <Chip key={c} label={c} color="primary" />
              ))}
            </div>
            <div className="voting__info-section">
              <span className="voting__label">Eliminated:</span>
              {eliminatedHistory.length === 0
                ? <Chip label="None" size="small" />
                : eliminatedHistory.map(c => (
                    <Chip key={c} label={c} color="error" size="small" />
                  ))}
            </div>
          </div>

          <BallotForm
            candidates={candidates}
            voterName={VOTERS[currentBallot]}
          />
        </div>
        )}

        {/* Suspense announcement */}
        {stage === "announce" && (
        <div className="announce">
          <div className="announce__content">
            <h2 className="announce__title">{suspenseText}</h2>
            <button
              className="announce__button"
              onClick={revealLoserOrWinner}
              aria-label={`Reveal ${candidates.length === 2 ? 'the winner' : 'the eliminated candidate'} for this round`}
            >
              Reveal
            </button>
          </div>
        </div>
        )}

        {/* After Reveal, show loser */}
        {stage === "eliminated" && (
        <div className="result">
          <div className="result__alert result__alert--warning">
            Eliminated this round: <strong>{loser}</strong>
          </div>
          <button
            className="result__button"
            onClick={handleNextRound}
            aria-label={`Proceed to round ${round + 1} of voting`}
          >
            Next Round
          </button>
        </div>
        )}

        {/* Winner screen */}
        {stage === "winner" && (
        <div className="result">
          <div className="result__alert result__alert--success">
            🏆 <strong>Winner: {winner}</strong>
          </div>
          
          <div className="result__summary">
            <h3 className="result__summary-title">
              Voting summary (elimination order and weighted scores)
            </h3>
            <div className="table__container">
              <table className="table">
                <caption className="sr-only">
                  Round-by-round elimination results and weighted scores for each candidate
                </caption>
                <thead className="table__header">
                  <tr className="table__row">
                    <th scope="col" className="table__cell table__cell--header">Round</th>
                    <th scope="col" className="table__cell table__cell--header">Eliminated</th>
                    {OPTIONS.map(c => (
                      <th scope="col" key={c} className="table__cell table__cell--header">
                        Score: {c}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {historyArr.map((h, idx) => (
                    <tr key={idx} className="table__row">
                      <th scope="row" className="table__cell">{h.round}</th>
                      <td className="table__cell">
                        <Chip label={h.eliminated} color="error" size="small" />
                      </td>
                      {OPTIONS.map(b => (
                        <td key={b} className="table__cell">
                          {h.score && h.score[b] !== undefined ? h.score[b] : "-"}
                        </td>
                      ))}
                    </tr>
                  ))}
                  <tr className="table__row">
                    <th scope="row" className="table__cell"><strong>Winner</strong></th>
                    <td className="table__cell">
                      <Chip label={winner} color="success" size="small" />
                    </td>
                    {OPTIONS.map(b => (
                      <td key={b} className="table__cell"></td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <button
            className="result__button result__button--success"
            onClick={handleReset}
            aria-label="Restart the voting process from the beginning"
          >
            🏆 Restart
          </button>
        </div>
        )}
      </main>

      <footer className="app__footer">
        <p>&copy; {new Date().getFullYear()} 2025 Pitch Voting - Built with React & SCSS</p>
      </footer>
    </div>
  );
}
