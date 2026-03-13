import './VoterChip.scss'

export function VoterChip({ name, selected, onSelect, disabled = false }) {
  return (
    <button
      type="button"
      className={`voter-chip ${selected ? 'voter-chip--selected' : ''}`}
      onClick={() => onSelect(name)}
      disabled={disabled}
      aria-pressed={selected}
    >
      {name}
    </button>
  )
}
