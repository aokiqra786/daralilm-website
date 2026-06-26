/**
 * Stepper — shows a sequence of steps with the current one highlighted.
 * Used for the admissions enrollment process.
 *
 * Usage: <Stepper steps={["Apply","Assess","Enroll"]} current={0} />
 */
export function Stepper({ steps, current }: { steps: string[]; current: number }) {
  return (
    <ol className="flex flex-wrap items-center gap-y-3" aria-label="Progress">
      {steps.map((label, i) => {
        const state = i < current ? "done" : i === current ? "current" : "upcoming";
        return (
          <li key={label} className="flex items-center">
            <span
              aria-current={state === "current" ? "step" : undefined}
              className={[
                "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold",
                state === "done" && "bg-green text-white",
                state === "current" && "bg-gold text-navy ring-2 ring-gold/40",
                state === "upcoming" && "bg-parchment text-muted border border-line",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              {i + 1}
            </span>
            <span
              className={[
                "ml-2 text-sm",
                state === "current" ? "font-semibold text-ink" : "text-muted",
              ].join(" ")}
            >
              {label}
            </span>
            {i < steps.length - 1 && <span className="mx-3 h-px w-8 bg-line" aria-hidden="true" />}
          </li>
        );
      })}
    </ol>
  );
}
