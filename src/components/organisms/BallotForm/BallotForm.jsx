import React, { useState, useEffect } from "react";
import { useVoting } from "../../../context/votingContext.jsx";
import { Card } from "../../molecules/Card/Card";
import { FormField } from "../../molecules/FormField/FormField";
import { Button } from "../../atoms/Button/Button";
import { Heading } from "../../atoms/Heading/Heading";
import "./BallotForm.scss";

function BallotForm({ candidates, voterName }) {
  const { dispatch } = useVoting();
  const [rankings, setRankings] = useState(Array(candidates.length).fill(""));
  const [error, setError] = useState("");

  useEffect(() => {
    setRankings(Array(candidates.length).fill(""));
    setError("");
  }, [candidates, voterName]);

  function onChange(e, idx) {
    const value = e.target.value;
    setRankings(rs => {
      const next = rs.slice();
      next[idx] = value;
      return next;
    });
    setError("");
  }

  function handleSubmit(e) {
    e.preventDefault();
    const chosen = rankings.filter(r => r);
    const duplicates = chosen.filter((r, i) => chosen.indexOf(r) !== i);
    if (duplicates.length > 0) {
      setError("Each candidate must be ranked exactly once (no duplicates).");
      return;
    }
    if (
      rankings.length !== candidates.length ||
      new Set(rankings).size !== candidates.length ||
      rankings.includes("")
    ) {
      setError("Please rank all candidates, with no blanks or duplicates.");
      return;
    }
    setError("");
    dispatch({ type: "SUBMIT_BALLOT", payload: rankings });
  }

  return (
    <Card className="ballot-form" padding="large">
      <Heading level={2} className="ballot-form__title">
        {voterName}'s Ballot
      </Heading>
      <form onSubmit={handleSubmit}>
        <div className="ballot-form__fields">
          {Array.from({ length: candidates.length }).map((_, rankIdx) => {
            const available = candidates.filter(
              c =>
                !rankings.slice(0, rankIdx).includes(c) ||
                rankings[rankIdx] === c
            );
            return (
              <div key={rankIdx} className="ballot-form__field">
                <label className="ballot-form__label" htmlFor={`rank-${rankIdx}`}>
                  Rank {rankIdx + 1}
                </label>
                <select
                  id={`rank-${rankIdx}`}
                  className={`ballot-form__select ${error ? 'ballot-form__select--error' : ''}`}
                  value={rankings[rankIdx]}
                  onChange={e => onChange(e, rankIdx)}
                  required
                  aria-describedby={error ? `ballot-error-${voterName}` : undefined}
                  aria-invalid={error ? "true" : "false"}
                >
                  <option value="">Select candidate...</option>
                  {available.map(c => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            );
          })}
          {error && (
            <div 
              className="ballot-form__error"
              role="alert"
              id={`ballot-error-${voterName}`}
              aria-live="assertive"
            >
              {error}
            </div>
          )}
          <Button 
            type="submit"
            size="large"
            fullWidth
            aria-label={`Submit ballot for ${voterName}`}
          >
            Submit Ballot
          </Button>
        </div>
      </form>
    </Card>
  );
}

export default BallotForm;
