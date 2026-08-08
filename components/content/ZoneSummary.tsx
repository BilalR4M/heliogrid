import { getZone } from "@/content/zones";
import type { ZoneId } from "@/content/zones";

type ZoneSummaryProps = {
  zoneId: ZoneId;
};

/** Accessible text mirror of the spatial zone (design doc §5). */
export default function ZoneSummary({ zoneId }: ZoneSummaryProps) {
  const zone = getZone(zoneId);

  return (
    <section className="sr-only" aria-labelledby={`zone-summary-${zone.id}`}>
      <h2 id={`zone-summary-${zone.id}`}>{zone.name}</h2>
      <p>{zone.summary}</p>
    </section>
  );
}
