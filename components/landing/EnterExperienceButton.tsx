type EnterExperienceButtonProps = {
  onEnter?: () => void;
  disabled?: boolean;
  label?: string;
};

export default function EnterExperienceButton({
  onEnter,
  disabled = false,
  label = "Enter Experience",
}: EnterExperienceButtonProps) {
  return (
    <button
      type="button"
      onClick={onEnter}
      disabled={disabled}
      className="inline-flex items-center gap-3 border border-hologram-cyan/40 bg-terminal-surface px-5 py-3 font-mono text-xs tracking-[0.18em] text-hologram-cyan uppercase transition-colors hover:border-hologram-cyan hover:bg-hologram-cyan/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-hologram-cyan disabled:cursor-wait disabled:opacity-50"
    >
      <span aria-hidden className="text-hud-amber">
        ▸
      </span>
      {label}
    </button>
  );
}
