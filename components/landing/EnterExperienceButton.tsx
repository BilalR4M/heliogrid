import Link from "next/link";

type EnterExperienceButtonProps = {
  href?: string;
};

export default function EnterExperienceButton({
  href = "/experience",
}: EnterExperienceButtonProps) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-3 border border-hologram-cyan/40 bg-terminal-surface px-5 py-3 font-mono text-xs tracking-[0.18em] text-hologram-cyan uppercase transition-colors hover:border-hologram-cyan hover:bg-hologram-cyan/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-hologram-cyan"
    >
      <span aria-hidden className="text-hud-amber">
        ▸
      </span>
      Enter Experience
    </Link>
  );
}
