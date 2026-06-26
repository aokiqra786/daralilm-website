"use client";

/**
 * AmountPicker — donation amount tiers + a custom option.
 * Controlled: the parent owns `value` (a tier number or "custom") and the
 * `customAmount` string. Resolve the final amount with `resolveAmount()`.
 *
 * Usage:
 *   <AmountPicker amounts={[50,100,250]} value={amount} onChange={setAmount}
 *                 customAmount={custom} onCustomChange={setCustom} />
 */
export function resolveAmount(value: number | "custom", customAmount: string): number {
  return value === "custom" ? Number(customAmount) || 0 : value;
}

export function AmountPicker({
  amounts,
  value,
  onChange,
  customAmount,
  onCustomChange,
}: {
  amounts: number[];
  value: number | "custom";
  onChange: (value: number | "custom") => void;
  customAmount: string;
  onCustomChange: (v: string) => void;
}) {
  const tile = (selected: boolean) =>
    [
      "py-3 rounded-lg font-bold border transition-all focus:outline-none",
      "focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2",
      selected
        ? "bg-green text-white border-green shadow-sm"
        : "bg-white text-ink border-line hover:border-green",
    ].join(" ");

  return (
    <div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {amounts.map((amt) => (
          <button
            key={amt}
            type="button"
            aria-pressed={value === amt}
            onClick={() => onChange(amt)}
            className={tile(value === amt)}
          >
            ${amt}
          </button>
        ))}
        <button
          type="button"
          aria-pressed={value === "custom"}
          onClick={() => onChange("custom")}
          className={tile(value === "custom")}
        >
          Custom
        </button>
      </div>

      {value === "custom" && (
        <div className="relative mt-3">
          <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-muted">$</span>
          <input
            type="number"
            min="1"
            inputMode="numeric"
            aria-label="Custom donation amount"
            value={customAmount}
            onChange={(e) => onCustomChange(e.target.value)}
            placeholder="Enter amount"
            className="w-full rounded-md border border-line bg-white py-3 pl-7 pr-4 text-lg font-semibold text-ink placeholder-muted outline-none focus:border-green focus:ring-2 focus:ring-gold/40"
          />
        </div>
      )}
    </div>
  );
}
