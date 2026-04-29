import { Handle, Node, NodeProps, Position } from "@xyflow/react";
import { ExitNodeData } from "../lib/types";

type ExitNodeType = Node<ExitNodeData, "exitNode">;

export function ExitNode({ data }: NodeProps<ExitNodeType>) {
  return (
    <div
      className="min-w-[240px] rounded-lg border border-(--node-exit-border) bg-(--platform-main-bg) p-3 shadow-[0_12px_26px_rgba(0,0,0,0.3)]"
      style={{
        background:
          "linear-gradient(180deg, var(--node-exit-top), transparent 42%), var(--platform-main-bg)",
      }}
    >
      <div className="mb-3 flex items-center justify-between">
        <span className="rounded-md border border-(--node-exit-border) bg-(--node-pill-bg) px-2 py-1 text-[10px] font-medium uppercase tracking-wide text-(--blnk-blnk-400)">
          Exit
        </span>
      </div>
      <div className="truncate text-base font-semibold text-(--platform-primary-text)">@{data.label}</div>
      <div className="text-xs text-(--platform-muted-secondary)">leaving the system</div>
      <div className="mt-3 rounded-md border border-(--platform-stroke) bg-(--platform-cloud-500)/35 px-3 py-2">
        <div className="text-[11px] uppercase tracking-wide text-(--platform-muted-secondary)">
          Amount moved
        </div>
        <div
          className="mt-1 text-sm font-semibold text-(--platform-primary-text)"
          style={{ fontFamily: "'IBM Plex Mono', monospace" }}
        >
          {data.amount} {data.provider ? `via ${data.provider}` : ""}
        </div>
      </div>
      <Handle type="target" position={Position.Left} className="bg-(--node-exit-border)!" />
    </div>
  );
}
