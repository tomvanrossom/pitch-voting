import React, { useState, useEffect } from "react";
import {
  Container, Typography, Card, CardContent, Button, Select, MenuItem,
  FormControl, InputLabel, Box, Chip, Stepper, Step, StepLabel,
  Stack, Paper, Alert, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow,
} from "@mui/material";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";

const VOTERS = ["Bert", "Birger", "Dave", "Ewoud", "Tom"];
const OPTIONS = ["Taghazout", "Albanie", "Malta", "FuerteVentura", "Chartreuse (drank)", "Tunesie"];

// Weighted sum elimination ("Borda count"): loser = highest sum.
function weightedFindLoser(ballots, candidates) {
  const score = {};
  candidates.forEach(c => (score[c] = 0));
  ballots.forEach(ranking => {
    ranking.forEach((cand, idx) => {
      if (candidates.includes(cand)) {
        score[cand] += idx + 1;
      }
    });
  });
  const maxSum = Math.max(...Object.values(score));
  const losers = Object.entries(score).filter(([_, v]) => v === maxSum).map(([k]) => k);
  return {
    loser: losers.length === 1 ? losers[0] : losers[Math.floor(Math.random() * losers.length)],
    score,
  };
}

function BallotForm({ candidates, onSubmit, voterName }) {
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
    setError(""); // Clear error on change
  }

  function handleSubmit(e) {
    e.preventDefault();
    // Validate: no duplicates
    const chosen = rankings.filter(r => r);
    const duplicates = chosen.filter((r, i) => chosen.indexOf(r) !== i);
    if (duplicates.length > 0) {
      setError("Each candidate must be ranked exactly once (no duplicates).");
      return;
    }
    // All must be ranked
    if (
      rankings.length !== candidates.length ||
      new Set(rankings).size !== candidates.length ||
      rankings.includes("")
    ) {
      setError("Please rank all candidates, with no blanks or duplicates.");
      return;
    }
    setError("");
    onSubmit(rankings);
  }

  return (
    <Paper elevation={2} sx={{ p: 3, my: 2 }}>
      <Typography
        variant="h5"
        align="center"
        color="primary"
        gutterBottom
        sx={{ fontWeight: "bold", letterSpacing: 1 }}
      >
        {voterName}'s Ballot
      </Typography>
      <form onSubmit={handleSubmit}>
        <Stack spacing={2}>
          {Array.from({ length: candidates.length }).map((_, rankIdx) => {
            // Disallow picking a candidate that's already picked in a previous select
            const available = candidates.filter(
              c =>
                !rankings.slice(0, rankIdx).includes(c) ||
                rankings[rankIdx] === c
            );
            return (
              <FormControl key={rankIdx} fullWidth error={!!error}>
                <InputLabel>{`Rank ${rankIdx + 1}`}</InputLabel>
                <Select
                  label={`Rank ${rankIdx + 1}`}
                  value={rankings[rankIdx]}
                  onChange={e => onChange(e, rankIdx)}
                  required
                >
                  <MenuItem value="">
                    <em>Select candidate...</em>
                  </MenuItem>
                  {available.map(c => (
                    <MenuItem key={c} value={c}>
                      {c}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            );
          })}
          {error && (
            <Alert severity="error" sx={{ mt: 1 }}>
              {error}
            </Alert>
          )}
          <Button
            variant="contained"
            color="primary"
            type="submit"
            sx={{ alignSelf: "center", mt: 1 }}
          >
            Submit Ballot
          </Button>
        </Stack>
      </form>
    </Paper>
  );
}

export default function App() {
  const [stage, setStage] = useState("setup");
  const [candidates, setCandidates] = useState([...OPTIONS]);
  const [round, setRound] = useState(1);
  const [ballots, setBallots] = useState([]);
  const [currentBallot, setCurrentBallot] = useState(0);

  // For history/report
  const [eliminatedHistory, setEliminatedHistory] = useState([]);
  const [scoreHistory, setScoreHistory] = useState([]);
  const [loser, setLoser] = useState(null);
  const [winner, setWinner] = useState(null);

  // Suspense flag for the "And the X is..." screen
  const [pendingAnnouncement, setPendingAnnouncement] = useState(false);

  function startVoting() {
    setStage("voting");
    setCandidates([...OPTIONS]);
    setBallots([]);
    setCurrentBallot(0);
    setRound(1);
    setEliminatedHistory([]);
    setScoreHistory([]);
    setLoser(null);
    setWinner(null);
    setPendingAnnouncement(false);
  }

  // Collecting ballots for the CURRENT round
  function handleBallotSubmit(rankings) {
    const updated = [...ballots, rankings];
    if (currentBallot + 1 < VOTERS.length) {
      setBallots(updated);
      setCurrentBallot(currentBallot + 1);
    } else {
      setBallots(updated);
      setPendingAnnouncement(true);
      setStage("announce");
    }
  }

  // Reveal the loser or winner after suspense
  function revealLoserOrWinner() {
    const { loser, score } = weightedFindLoser(ballots, candidates);
    // Final round (two candidates): loser is not the winner
    if (candidates.length === 2) {
      setWinner(candidates.find(c => c !== loser));
      setScoreHistory(hist => [...hist, score]);
      setEliminatedHistory(hist => [...hist, loser]);
      setStage("winner");
    } else {
      setLoser(loser);
      setScoreHistory(hist => [...hist, score]);
      setEliminatedHistory(hist => [...hist, loser]);
      setStage("eliminated");
    }
    setPendingAnnouncement(false);
  }

  function handleNextRound() {
    const remain = candidates.filter(c => c !== loser);
    setCandidates(remain);
    setBallots([]);
    setCurrentBallot(0);
    setRound(r => r + 1);
    setLoser(null);
    setStage("voting");
  }

  function handleReset() {
    setStage("setup");
    setCandidates([...OPTIONS]);
    setRound(1);
    setBallots([]);
    setCurrentBallot(0);
    setEliminatedHistory([]);
    setScoreHistory([]);
    setLoser(null);
    setWinner(null);
    setPendingAnnouncement(false);
  }

  const historyArr = eliminatedHistory.map((el, idx) => ({
    round: idx + 1,
    eliminated: el,
    score: scoreHistory[idx],
  }));

  const suspenseText =
    candidates.length === 2
      ? "And the winner is..."
      : "And the loser is...";

  return (
    <Container maxWidth="sm" sx={{ p: 3 }}>
      <Box my={4} mb={5}>
        <Typography variant="h3" align="center" gutterBottom fontWeight="bold">
          🗳️ 2025 pitch voting
        </Typography>
      </Box>

      {/* Setup */}
      {stage === "setup" && (
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h5" mb={2}>Voters</Typography>
            <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: "wrap" }}>
              {VOTERS.map(v => (
                <Chip label={v} key={v} color="secondary" />
              ))}
            </Stack>
            <Typography>
              <b>Candidates:</b>{" "}
              {OPTIONS.map(c => (
                <Chip
                  key={c}
                  label={c}
                  color="primary"
                  variant="outlined"
                  size="small"
                  sx={{ mr: 1 }}
                />
              ))}
            </Typography>
            <Button
              variant="contained"
              color="primary"
              sx={{ mt: 3 }}
              onClick={startVoting}
              fullWidth
            >
              Start Voting
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Voting round */}
      {stage === "voting" && (
        <>
          <Typography variant="h4" align="center" sx={{ mb: 2 }} color="primary">
            {VOTERS[currentBallot]}'s turn to vote
          </Typography>
          <Stepper activeStep={round - 1} alternativeLabel sx={{ mb: 3 }}>
            {Array.from({ length: OPTIONS.length - 1 }).map((_, idx) => (
              <Step key={idx}>
                <StepLabel>
                  Round {idx + 1}
                  {idx < eliminatedHistory.length && (
                    <Chip
                      label={`Eliminated: ${eliminatedHistory[idx]}`}
                      size="small"
                      color="error"
                      sx={{ ml: 1 }}
                    />
                  )}
                </StepLabel>
              </Step>
            ))}
          </Stepper>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: "wrap" }}>
                <Typography color="text.secondary">Remaining:</Typography>
                {candidates.map(c => (
                  <Chip key={c} label={c} color="primary" />
                ))}
              </Stack>
              <Stack direction="row" spacing={1}>
                <Typography color="text.secondary">Eliminated:</Typography>
                {eliminatedHistory.length === 0
                  ? <Chip label="None" size="small" />
                  : eliminatedHistory.map(c => <Chip key={c} label={c} color="error" size="small" />)}
              </Stack>
            </CardContent>
          </Card>
          <BallotForm
            candidates={candidates}
            onSubmit={handleBallotSubmit}
            voterName={VOTERS[currentBallot]}
          />
        </>
      )}

      {/* Suspense announcement step */}
      {stage === "announce" && (
        <Card>
          <CardContent>
            <Box my={4} textAlign="center">
              <Typography variant="h4" sx={{ mb: 4 }}>
                {suspenseText}
              </Typography>
              <Button
                variant="contained"
                color="primary"
                size="large"
                sx={{ fontSize: 22, px: 6, py: 1.5 }}
                onClick={revealLoserOrWinner}
              >
                Reveal
              </Button>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* After Reveal, show loser (not for final round) */}
      {stage === "eliminated" && (
        <Card>
          <CardContent>
            <Alert severity="warning" sx={{ mb: 3, fontSize: "1.2em" }}>
              Eliminated this round: <b>{loser}</b>
            </Alert>
            <Button
              variant="contained"
              color="primary"
              fullWidth
              sx={{ mb: 1 }}
              onClick={handleNextRound}
            >
              Next Round
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Only at end: show full summary and all scores */}
      {stage === "winner" && (
        <Card>
          <CardContent>
            <Alert
              severity="success"
              iconMapping={{
                success: <EmojiEventsIcon fontSize="inherit" />,
              }}
              sx={{ fontSize: 20, my: 2 }}
            >
              <b>Winner: {winner}</b>
            </Alert>
            <Box mt={4}>
              <Typography variant="h6" gutterBottom>
                Voting summary (elimination order and weighted scores)
              </Typography>
              <TableContainer component={Paper} sx={{ maxHeight: 340 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell align="center">Round</TableCell>
                      <TableCell align="center">Eliminated</TableCell>
                      {OPTIONS.map(c => (
                        <TableCell key={c} align="center">Score: {c}</TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {historyArr.map((h, idx) => (
                      <TableRow key={idx}>
                        <TableCell align="center">{h.round}</TableCell>
                        <TableCell align="center">
                          <Chip label={h.eliminated} color="error" />
                        </TableCell>
                        {OPTIONS.map(b =>
                          <TableCell key={b} align="center">
                            {h.score && h.score[b] !== undefined ? h.score[b] : "-"}
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                    <TableRow>
                      <TableCell align="center"><b>Winner</b></TableCell>
                      <TableCell align="center">
                        <Chip label={winner} color="success" />
                      </TableCell>
                      {OPTIONS.map(b => <TableCell key={b}></TableCell>)}
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
            <Button
              startIcon={<EmojiEventsIcon />}
              variant="contained"
              color="success"
              onClick={handleReset}
              fullWidth
              sx={{ mt: 3 }}
            >
              Restart
            </Button>
          </CardContent>
        </Card>
      )}

      <Box mt={6} textAlign="center" color="text.secondary">
        <Typography variant="caption">
          &copy; {new Date().getFullYear()} 2025 pitch voting - Made with React & Material UI
        </Typography>
      </Box>
    </Container>
  );
}
