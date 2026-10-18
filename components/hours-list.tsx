import { businessHours } from "@/lib/site";

export function HoursList() {
  return (
    <div>
      {businessHours.confirmed ? null : (
        <p className="mb-3 inline-flex border border-current px-2 py-1 text-[0.7rem] uppercase tracking-[0.16em]">
          Placeholder hours
        </p>
      )}
      <p className="text-sm leading-relaxed">{businessHours.summary}</p>
      <ul className="mt-3 grid gap-1.5">
        {businessHours.entries.map((entry) => (
          <li key={entry.days} className="flex justify-between gap-6 text-sm">
            <span>{entry.days}</span>
            <span>{entry.time}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
