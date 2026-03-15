import React, { useState } from 'react';
import { Collapse, Box, IconButton } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useVoting } from '../../context/votingContext.jsx';
import { Alert } from '../../components/molecules/Alert/Alert';
import { Heading } from '../../components/atoms/Heading/Heading';
import { Icon } from '../../components/atoms/Icon/Icon';
import { ResultsTable } from '../../components/organisms/ResultsTable/ResultsTable';
import './Winner.scss';

export function Winner() {
  const { state } = useVoting();
  const { winner, eliminatedHistory, scoreHistory, candidates, session } = state;
  const [expanded, setExpanded] = useState(false);

  // Use original candidates list from session, or reconstruct from eliminated + current
  const allCandidates = session?.candidates || [...new Set([...eliminatedHistory, ...candidates])];

  const historyArr = eliminatedHistory.map((el, idx) => ({
    round: idx + 1,
    eliminated: el,
    score: scoreHistory[idx],
  }));

  return (
    <article className="winner" aria-labelledby="winner-heading">
      <Heading level={2} id="winner-heading" className="sr-only">
        Final Results
      </Heading>

      <Alert variant="success">
        <Icon emoji="🏆" label="trophy" /> <strong>Winner: {winner}</strong>
      </Alert>

      <section className="winner__summary" aria-labelledby="summary-title">
        <Box
          role="button"
          tabIndex={0}
          onClick={() => setExpanded(!expanded)}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setExpanded(!expanded) }}
          sx={{
            display: 'flex',
            alignItems: 'center',
            cursor: 'pointer',
            userSelect: 'none',
          }}
        >
          <Heading level={3} id="summary-title" className="winner__summary-title">
            Voting summary
          </Heading>
          <IconButton
            size="small"
            sx={{
              ml: 1,
              transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.2s',
            }}
            aria-label={expanded ? 'Collapse summary' : 'Expand summary'}
          >
            <ExpandMoreIcon />
          </IconButton>
        </Box>
        <Collapse in={expanded}>
          <ResultsTable
            historyData={historyArr}
            allOptions={allCandidates}
            winner={winner}
          />
        </Collapse>
      </section>
    </article>
  );
}
