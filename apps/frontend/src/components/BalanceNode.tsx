import { Handle, Node, NodeProps, Position } from "@xyflow/react";
import { BalanceNodeData } from "../lib/types";

type BalanceNodeType = Node<BalanceNodeData, "balanceNode">;

export function BalanceNode({ data }: NodeProps<BalanceNodeType>) {
  return (
    <div
      className="min-w-[300px] rounded-xl border border-(--node-balance-border) bg-(--platform-main-bg) p-4 shadow-[0_14px_30px_rgba(0,0,0,0.34)]"
      style={{
        background:
          "linear-gradient(180deg, var(--node-balance-top), transparent 38%), var(--platform-main-bg)",
      }}
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <div className="text-base font-semibold text-(--platform-primary-text)">{data.name}</div>
          <div className="text-xs text-(--platform-muted-secondary)">lineage enabled</div>
        </div>
        <span className="rounded-md border border-(--node-balance-border) bg-(--node-pill-bg) px-2 py-1 text-[10px] font-medium uppercase tracking-wide text-(--platform-muted-secondary)">
          Balance
        </span>
      </div>

      <div className="text-[11px] font-medium uppercase tracking-wide text-(--platform-muted-secondary)">
        Provider availability
      </div>
      <div className="mt-2 rounded-lg border border-(--platform-stroke) bg-(--platform-cloud-500)/35">
        {data.providers.length ? (
          data.providers.map((provider, index) => (
            <div
              key={`${provider.provider}-${provider.amount}`}
              className={`flex items-center justify-between px-3 py-2 text-xs ${
                index > 0 ? "border-t border-(--platform-stroke)" : ""
              }`}
            >
              <span className="truncate text-(--platform-primary-text)">{provider.provider}</span>
              <span
                className="text-(--platform-primary-text)"
                style={{ fontFamily: "'IBM Plex Mono', monospace" }}
              >
                {provider.available}
              </span>
            </div>
          ))
        ) : (
          <div className="px-3 py-2 text-xs text-(--platform-muted)">No provider split available</div>
        )}
      </div>

      <div className="mt-3 flex items-center justify-between rounded-md border border-(--platform-stroke) bg-(--platform-cloud-500)/35 px-3 py-2">
        <span className="text-xs uppercase tracking-wide text-(--platform-muted-secondary)">Total</span>
        <span
          className="text-sm font-semibold text-(--platform-primary-text)"
          style={{ fontFamily: "'IBM Plex Mono', monospace" }}
        >
          {data.total}
        </span>
      </div>
      <Handle type="target" position={Position.Left} className="bg-(--node-balance-border)!" />
      <Handle type="source" position={Position.Right} className="bg-(--node-balance-border)!" />
    </div>
  );
}
