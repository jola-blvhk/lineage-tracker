import { Handle, Node, NodeProps, Position } from "@xyflow/react";
import { ProviderNodeData } from "../lib/types";

type ProviderNodeType = Node<ProviderNodeData, "providerNode">;

export function ProviderNode({ data }: NodeProps<ProviderNodeType>) {
  return (
    <div
      className="min-w-[240px] rounded-lg border border-(--node-provider-border) bg-(--platform-main-bg) p-3 shadow-[0_12px_26px_rgba(0,0,0,0.3)]"
      style={{
        background:
          "linear-gradient(180deg, var(--node-provider-top), transparent 42%), var(--platform-main-bg)",
      }}
    >
      <div className="mb-3 flex items-center justify-between">
        <span className="rounded-md border border-(--node-provider-border) bg-(--node-pill-bg) px-2 py-1 text-[10px] font-medium uppercase tracking-wide text-(--platform-custom-burnt-yellow-inflight)">
          Provider
        </span>
      </div>
      <div className="truncate text-base font-semibold text-(--platform-primary-text)">{data.provider}</div>

      <div className="mt-3 rounded-md border border-(--platform-stroke) bg-(--platform-cloud-500)/35 px-3 py-2">
        <div className="text-[11px] uppercase tracking-wide text-(--platform-muted-secondary)">Credited</div>
        <div
          className="mt-1 text-lg font-semibold text-(--platform-primary-text)"
          style={{ fontFamily: "'IBM Plex Mono', monospace" }}
        >
          {data.amount}
        </div>
      </div>
      <Handle type="source" position={Position.Right} className="bg-[#7dd3fc]!" />
    </div>
  );
}
