import React from 'react';
import { Chip } from '../../atoms/Chip/Chip';
import './ResultsTable.scss';

export function ResultsTable({ historyData, allOptions, winner }) {
  return (
    <div className="results-table">
      <div className="results-table__container">
        <table className="results-table__table">
          <caption className="sr-only">
            Round-by-round elimination results and weighted scores for each candidate
          </caption>
          <thead className="results-table__header">
            <tr className="results-table__row">
              <th scope="col" className="results-table__cell results-table__cell--header">
                Round
              </th>
              {allOptions.map(c => (
                <th scope="col" key={c} className="results-table__cell results-table__cell--header">
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {historyData.map((h, idx) => (
              <tr key={idx} className="results-table__row">
                <th scope="row" className="results-table__cell">{h.round}</th>
                {allOptions.map(b => (
                  <td key={b} className="results-table__cell">
                    {h.score && h.score[b] !== undefined ? (
                      b === h.eliminated ? (
                        <Chip label={h.score[b]} color="error" size="small" />
                      ) : (
                        h.score[b]
                      )
                    ) : "-"}
                  </td>
                ))}
              </tr>
            ))}
            <tr className="results-table__row">
              <th scope="row" className="results-table__cell"><strong>Winner</strong></th>
              {allOptions.map(b => (
                <td key={b} className="results-table__cell">
                  {b === winner && <Chip label="🏆" color="success" size="small" />}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
