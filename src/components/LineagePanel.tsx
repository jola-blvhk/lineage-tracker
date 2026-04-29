import { ProviderBreakdown, TransactionLineageResponse } from "../lib/types";

type LineagePanelProps = {
  selectedBalanceName?: string;
  breakdown: ProviderBreakdown[];
  transactionLineage: TransactionLineageResponse | null;
};

export function LineagePanel({
  selectedBalanceName,
  breakdown,
  transactionLineage,
}: LineagePanelProps) {
  if (transactionLineage) {
    const allocation =
      transactionLineage.BLNK_FUND_ALLOCATION ?? transactionLineage.fund_allocation ?? [];
    const amount = transactionLineage.amount ?? 0;
    const numericAmount = Number(amount);

    return (
      <aside className="h-full rounded-xl border border-(--platform-stroke) bg-(--platform-main-bg) p-4 shadow-[0_12px_34px_rgba(0,0,0,0.33)]">
        <h2 className="text-lg font-semibold text-(--platform-primary-text)">
          Transaction: {transactionLineage.reference ?? transactionLineage.transaction_id ?? "n/a"}
        </h2>
        <p className="mt-2 text-sm text-(--platform-muted-secondary)">Amount: {amount}</p>

        <h3 className="mt-4 text-sm font-semibold text-(--platform-nav-text)">Fund allocation</h3>
        <ul className="mt-2 space-y-2 text-sm text-(--platform-muted-secondary)">
          {allocation.map((entry, index) => {
            const entryAmount = entry.amount ?? 0;
            const numericEntryAmount = Number(entryAmount);
            const pct = numericAmount ? (numericEntryAmount / numericAmount) * 100 : 0;
            return (
              <li key={`${entry.provider}-${index}`}>
                {entry.provider}
                {" -> "}
                {entryAmount} ({pct.toFixed(0)}%)
              </li>
            );
          })}
        </ul>

        <h3 className="mt-4 text-sm font-semibold text-(--platform-nav-text)">Shadow transactions</h3>
        <ul className="mt-2 space-y-2 text-sm text-(--platform-muted-secondary)">
          {(transactionLineage.shadow_transactions ?? []).map((shadow) => (
            <li key={shadow.transaction_id}>
              [{shadow.transaction_id}] {shadow.description ?? "lineage update"}{" "}
              {shadow.amount ? `${shadow.amount} ${shadow.provider ? `via ${shadow.provider}` : ""}` : ""}
            </li>
          ))}
          {!transactionLineage.shadow_transactions?.length && (
            <li className="text-(--platform-muted)">No shadow transactions reported.</li>
          )}
        </ul>
      </aside>
    );
  }

  const totals = breakdown.reduce(
    (acc, item) => {
      acc.credited += item.amount;
      acc.available += item.available;
      acc.spent += item.spent;
      return acc;
    },
    { credited: 0, available: 0, spent: 0 },
  );

  return (
    <aside className="h-full rounded-xl border border-(--platform-stroke) bg-(--platform-main-bg) p-4 shadow-[0_12px_34px_rgba(0,0,0,0.33)]">
      <div className="rounded-lg border border-(--platform-stroke) bg-(--platform-cloud-500)/45 p-3">
        <div className="text-xs uppercase tracking-wide text-(--platform-muted-secondary)">
          Balance overview
        </div>
       
      </div>

      <div className="mt-4 overflow-auto rounded-lg border border-(--platform-stroke) bg-(--platform-cloud-500)/25 p-3">
        <table className="w-full text-left text-sm">
          <thead className="text-(--platform-muted-secondary)">
            <tr>
              <th className="pb-2 text-[9px] font-medium uppercase tracking-wide">Provider</th>
              <th className="pb-2 text-[9px] font-medium uppercase tracking-wide">Credited</th>
              <th className="pb-2 text-[9px] font-medium uppercase tracking-wide">Available</th>
              <th className="pb-2 text-[9px] font-medium uppercase tracking-wide">Spent</th>
            </tr>
          </thead>
          <tbody className="text-(--platform-primary-text)">
            {breakdown.map((row) => (
              <tr
                key={row.provider}
                className="border-t border-(--platform-stroke) transition-colors hover:bg-(--platform-cloud-500)/40"
              >
                <td className="py-2">{row.provider}</td>
                <td className="py-2">{row.amount}</td>
                <td className="py-2 text-(--platform-custom-green)">{row.available}</td>
                <td className="py-2 text-(--platform-muted-secondary)">{row.spent}</td>
              </tr>
            ))}
            {!breakdown.length && (
              <tr className="border-t border-(--platform-stroke)">
                <td colSpan={4} className="py-3 text-center text-(--platform-muted)">
                  No provider split loaded yet.
                </td>
              </tr>
            )}
            {!!breakdown.length && (
              <tr className="border-t border-(--platform-stroke) font-semibold">
                <td className="py-2">Total</td>
                <td className="py-2">{totals.credited}</td>
                <td className="py-2 text-(--platform-custom-green)">{totals.available}</td>
                <td className="py-2 text-(--platform-muted-secondary)">{totals.spent}</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

    </aside>
  );
}
