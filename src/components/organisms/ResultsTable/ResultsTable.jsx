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
              <th scope="col" className="results-table__cell results-table__cell--header">
                Eliminated
              </th>
              {allOptions.map(c => (
                <th scope="col" key={c} className="results-table__cell results-table__cell--header">
                  Score: {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {historyData.map((h, idx) => (
              <tr key={idx} className="results-table__row">
                <th scope="row" className="results-table__cell">{h.round}</th>
                <td className="results-table__cell">
                  <Chip label={h.eliminated} color="error" size="small" />
                </td>
                {allOptions.map(b => (
                  <td key={b} className="results-table__cell">
                    {h.score && h.score[b] !== undefined ? h.score[b] : "-"}
                  </td>
                ))}
              </tr>
            ))}
            <tr className="results-table__row">
              <th scope="row" className="results-table__cell"><strong>Winner</strong></th>
              <td className="results-table__cell">
                <Chip label={winner} color="success" size="small" />
              </td>
              {allOptions.map(b => (
                <td key={b} className="results-table__cell"></td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
