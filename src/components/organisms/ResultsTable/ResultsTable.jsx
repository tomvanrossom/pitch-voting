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
            {historyData.map((h, idx) => (
              <tr key={idx} className="results-table__row">
                <th scope="row" className="results-table__cell">{h.round}</th>
                {orderedCandidates.map(candidate => (
                  <td key={candidate} className="results-table__cell">
                    {h.score && h.score[candidate] !== undefined ? (
                      candidate === h.eliminated ? (
                        <Chip label={h.score[candidate]} color="error" size="small" />
                      ) : (
                        h.score[candidate]
                      )
                    ) : "-"}
                  </td>
                ))}
              </tr>
            ))}
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
