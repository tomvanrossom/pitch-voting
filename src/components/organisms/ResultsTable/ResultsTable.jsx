import React from 'react';
import { useTranslation } from 'react-i18next';
import { Chip } from '../../atoms/Chip/Chip';
import './ResultsTable.scss';

export function ResultsTable({ historyData, allOptions, winner }) {
  const { t } = useTranslation();

  // Order columns by elimination: first eliminated -> last eliminated -> winner
  const orderedCandidates = [
    ...historyData.map(h => h.eliminated),
    winner
  ].filter(Boolean);

  return (
    <div className="results-table">
      <div className="results-table__container">
        <table className="results-table__table">
          <caption className="sr-only">
            {t('results.caption')}
          </caption>
          <thead className="results-table__header">
            <tr className="results-table__row">
              <th scope="col" className="results-table__cell results-table__cell--header">
                {t('results.round')}
              </th>
              {orderedCandidates.map(candidate => (
                <th scope="col" key={candidate} className="results-table__cell results-table__cell--header">
                  {candidate}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {historyData.map((h, idx) => {
              // Find max score for this round (among candidates still in play)
              const scores = Object.values(h.score || {}).filter(s => s !== null && s !== undefined);
              const maxScore = scores.length > 0 ? Math.max(...scores) : null;

              return (
                <tr key={idx} className="results-table__row">
                  <th scope="row" className="results-table__cell">{h.round}</th>
                  {orderedCandidates.map(candidate => {
                    const score = h.score?.[candidate];
                    const isEliminated = candidate === h.eliminated;
                    const isLeader = score !== null && score !== undefined && score === maxScore;

                    return (
                      <td key={candidate} className="results-table__cell">
                        {score !== null && score !== undefined ? (
                          isEliminated ? (
                            <Chip label={score} color="error" size="small" />
                          ) : isLeader ? (
                            <Chip label={score} color="success" size="small" />
                          ) : (
                            score
                          )
                        ) : "-"}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
            <tr className="results-table__row">
              <th scope="row" className="results-table__cell"><strong>{t('results.winner')}</strong></th>
              {orderedCandidates.map(candidate => (
                <td key={candidate} className="results-table__cell">
                  {candidate === winner && <Chip label="🏆" color="success" size="small" />}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
