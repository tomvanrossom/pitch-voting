import './CandidateChip.scss'

export function CandidateChip({ name, rank, onTap, disabled = false }) {
  const isRanked = rank !== undefined && rank !== null

  return (
    <button
      type="button"
      className={`candidate-chip ${isRanked ? 'candidate-chip--ranked' : ''}`}
      onClick={() => onTap(name)}
      disabled={disabled}
      aria-label={isRanked ? `${name}, ranked ${rank}` : `${name}, not ranked`}
    >
      {name}
    </button>
  )
}
