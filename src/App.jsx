import React from "react";
import { useVoting, VOTERS, OPTIONS } from "./votingContext.jsx";
import { Chip } from "./components/Chip.jsx";
import BallotForm from "./components/BallotForm.jsx";
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
        <section className="setup-card" aria-labelledby="setup-heading">
          <h2 id="setup-heading" className="sr-only">Voting Setup</h2>
          <section className="setup-card__section" aria-labelledby="voters-heading">
            <h3 id="voters-heading" className="setup-card__heading">Voters</h3>
            <div className="setup-card__chips">
              {VOTERS.map(v => (
                <Chip label={v} key={v} color="secondary" />
              ))}
            </div>
          </section>
          <section className="setup-card__section" aria-labelledby="candidates-heading">
            <h3 id="candidates-heading" className="sr-only">Candidates</h3>
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
          </section>
          <button
            className="setup-card__button"
            onClick={startVoting}
            aria-label="Start the voting process with all voters and candidates"
          >
            Start Voting
          </button>
        </section>
        )}

        {/* Voting round */}
        {stage === "voting" && (
        <section className="voting" aria-labelledby="voting-title">
          <h2 id="voting-title" className="voting__voter-title">
            {VOTERS[currentBallot]}'s turn to vote
          </h2>
          
          <nav className="stepper" aria-label="Voting rounds progress">
            <ol className="stepper__list">
            {Array.from({ length: OPTIONS.length - 1 }).map((_, idx) => (
              <li 
                key={idx} 
                className={`stepper__step ${idx + 1 === round ? 'stepper__step--active' : ''} ${idx + 1 < round ? 'stepper__step--completed' : ''}`}
                aria-current={idx + 1 === round ? 'step' : undefined}
              >
                <span className="stepper__step-circle">{idx + 1}</span>
                <span className="stepper__step-label">
                  Round {idx + 1}
                  {idx < eliminatedHistory.length && (
                    <span>
                      <Chip
                        label={`✗ ${eliminatedHistory[idx]}`}
                        size="small"
                        color="error"
                      />
                    </span>
                  )}
                </span>
              </li>
            ))}
            </ol>
          </nav>

          <aside className="voting__info-card" aria-labelledby="voting-status">
            <h3 id="voting-status" className="sr-only">Voting Status</h3>
            <section className="voting__info-section" aria-labelledby="remaining-label">
              <h4 id="remaining-label" className="voting__label">Remaining:</h4>
              {candidates.map(c => (
                <Chip key={c} label={c} color="primary" />
              ))}
            </section>
            <section className="voting__info-section" aria-labelledby="eliminated-label">
              <h4 id="eliminated-label" className="voting__label">Eliminated:</h4>
              {eliminatedHistory.length === 0
                ? <Chip label="None" size="small" />
                : eliminatedHistory.map(c => (
                    <Chip key={c} label={c} color="error" size="small" />
                  ))}
            </section>
          </aside>

          <BallotForm
            candidates={candidates}
            voterName={VOTERS[currentBallot]}
          />
        </section>
        )}

        {/* Suspense announcement */}
        {stage === "announce" && (
        <section className="announce" aria-labelledby="announce-title">
          <div className="announce__content">
            <h2 id="announce-title" className="announce__title">{suspenseText}</h2>
            <button
              className="announce__button"
              onClick={revealLoserOrWinner}
              aria-label={`Reveal ${candidates.length === 2 ? 'the winner' : 'the eliminated candidate'} for this round`}
            >
              Reveal
            </button>
          </div>
        </section>
        )}

        {/* After Reveal, show loser */}
        {stage === "eliminated" && (
        <article className="result" aria-labelledby="eliminated-heading">
          <h2 id="eliminated-heading" className="sr-only">Round Result</h2>
          <output className="result__alert result__alert--warning" aria-live="polite">
            Eliminated this round: <strong>{loser}</strong>
          </output>
          <button
            className="result__button"
            onClick={handleNextRound}
            aria-label={`Proceed to round ${round + 1} of voting`}
          >
            Next Round
          </button>
        </article>
        )}

        {/* Winner screen */}
        {stage === "winner" && (
        <article className="result" aria-labelledby="winner-heading">
          <h2 id="winner-heading" className="sr-only">Final Results</h2>
          <output className="result__alert result__alert--success" aria-live="polite">
            🏆 <strong>Winner: {winner}</strong>
          </output>
          
          <section className="result__summary" aria-labelledby="summary-title">
            <h3 id="summary-title" className="result__summary-title">
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
          </section>

          <button
            className="result__button result__button--success"
            onClick={handleReset}
            aria-label="Restart the voting process from the beginning"
          >
            🏆 Restart
          </button>
        </article>
        )}
      </main>

      <footer className="app__footer">
        <p>&copy; {new Date().getFullYear()} 2025 Pitch Voting - Built with React & SCSS</p>
      </footer>
    </div>
  );
}
