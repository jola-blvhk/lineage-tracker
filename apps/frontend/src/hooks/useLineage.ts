import axios from "axios";
import { useEffect, useMemo, useState } from "react";
import { Edge, MarkerType, Node } from "@xyflow/react";
import { createApiClient } from "../lib/api";
import {
  BalanceLineageResponse,
  BalanceNodeData,
  ExitNodeData,
  LineageGraphResult,
  ProviderBreakdown,
  ProviderNodeData,
} from "../lib/types";

function toNumericValue(amount: string | number | undefined): number {
  const numeric = Number(amount ?? 0);
  if (!Number.isFinite(numeric)) {
    return 0;
  }
  return numeric;
}

function buildGraph(raw: BalanceLineageResponse): LineageGraphResult {
  const edgeColors = {
    provider: "#7dd3fc",
    transfer: "#a5b4cf",
    exit: "#c4b5fd",
    label: "#e6ecf8",
  };

  const balanceId = raw.balance_id;
  const balanceNodeId = `balance-${balanceId}`;
  const balanceName = raw.balance_name ?? `Balance ${balanceId.slice(0, 8)}`;

  const breakdown: ProviderBreakdown[] = raw.providers.map((provider) => ({
    provider: provider.provider,
    amount: toNumericValue(provider.amount),
    available: toNumericValue(provider.available),
    spent: toNumericValue(provider.spent),
  }));

  const providerNodes: Node<ProviderNodeData>[] = breakdown.map((provider) => ({
    id: `provider-${provider.provider}`,
    type: "providerNode",
    position: { x: 0, y: 0 },
    data: {
      provider: provider.provider,
      amount: provider.amount,
    },
  }));

  const balanceNode: Node<BalanceNodeData> = {
    id: balanceNodeId,
    type: "balanceNode",
    position: { x: 0, y: 0 },
    data: {
      balanceId,
      name: balanceName,
      total: breakdown.reduce((sum, item) => sum + item.available, 0),
      providers: breakdown,
    },
  };

  const providerEdges: Edge[] = breakdown.map((provider) => ({
    id: `e-provider-${provider.provider}-${balanceId}`,
    source: `provider-${provider.provider}`,
    target: balanceNodeId,
    label: `${provider.amount} via ${provider.provider}`,
    type: "smoothstep",
    data: { provider: provider.provider, amount: provider.amount },
    style: { stroke: edgeColors.provider, strokeWidth: 2.1 },
    markerEnd: { type: MarkerType.ArrowClosed, color: edgeColors.provider },
    labelStyle: { fill: edgeColors.label, fontSize: 12 },
    labelBgStyle: {
      fill: "#141925",
      stroke: edgeColors.provider,
      strokeWidth: 1,
      fillOpacity: 0.98,
    },
    labelBgPadding: [8, 5],
    labelBgBorderRadius: 8,
  }));

  const transferNodes = new Map<string, Node>();
  const transferEdges: Edge[] = [];

  for (const transfer of raw.transfers ?? []) {
    const amount = toNumericValue(transfer.amount);
    const fromId = `balance-${transfer.from_balance_id}`;
    const toNodeId = transfer.exits_system
      ? `exit-${transfer.exit_name ?? transfer.to_balance_id}`
      : `balance-${transfer.to_balance_id}`;

    if (!transferNodes.has(fromId) && transfer.from_balance_id !== balanceId) {
      transferNodes.set(fromId, {
        id: fromId,
        type: "balanceNode",
        position: { x: 0, y: 0 },
        data: {
          balanceId: transfer.from_balance_id,
          name: transfer.from_balance_name ?? `Balance ${transfer.from_balance_id.slice(0, 8)}`,
          total: amount,
          providers: [],
        } satisfies BalanceNodeData,
      });
    }

    if (!transferNodes.has(toNodeId)) {
      if (transfer.exits_system) {
        transferNodes.set(toNodeId, {
          id: toNodeId,
          type: "exitNode",
          position: { x: 0, y: 0 },
          data: {
            label: transfer.exit_name ?? transfer.to_balance_name ?? "Exit",
            amount,
            provider: transfer.provider,
          } satisfies ExitNodeData,
        });
      } else if (transfer.to_balance_id !== balanceId) {
        transferNodes.set(toNodeId, {
          id: toNodeId,
          type: "balanceNode",
          position: { x: 0, y: 0 },
          data: {
            balanceId: transfer.to_balance_id,
            name: transfer.to_balance_name ?? `Balance ${transfer.to_balance_id.slice(0, 8)}`,
            total: amount,
            providers: [],
          } satisfies BalanceNodeData,
        });
      }
    }

    transferEdges.push({
      id: `e-transfer-${transfer.transaction_id ?? `${fromId}-${toNodeId}`}`,
      source: fromId,
      target: toNodeId,
      label: `${amount}${transfer.provider ? ` via ${transfer.provider}` : ""}`,
      type: "smoothstep",
      data: {
        transactionId: transfer.transaction_id,
        provider: transfer.provider,
        amount,
      },
      style: {
        stroke: transfer.exits_system ? edgeColors.exit : edgeColors.transfer,
        strokeWidth: 2.1,
      },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: transfer.exits_system ? edgeColors.exit : edgeColors.transfer,
      },
      labelStyle: {
        fill: transfer.exits_system ? edgeColors.exit : edgeColors.label,
        fontSize: 12,
      },
      labelBgStyle: {
        fill: "#141925",
        stroke: transfer.exits_system ? edgeColors.exit : edgeColors.transfer,
        strokeWidth: 1,
        fillOpacity: 0.98,
      },
      labelBgPadding: [8, 5],
      labelBgBorderRadius: 8,
    });
  }

  return {
    nodes: [...providerNodes, balanceNode, ...transferNodes.values()],
    edges: [...providerEdges, ...transferEdges],
    raw,
    breakdown,
  };
}

export function useLineage(balanceId: string, token: string, refreshTrigger = 0) {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [raw, setRaw] = useState<BalanceLineageResponse | null>(null);
  const [breakdown, setBreakdown] = useState<ProviderBreakdown[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!balanceId || !token) {
      return;
    }

    let active = true;
    const client = createApiClient(token);

    setIsLoading(true);
    setError(null);

    client
      .get<BalanceLineageResponse>(`/api/lineage/balance/${balanceId}`)
      .then((response) => {
        if (!active) {
          return;
        }
        const graph = buildGraph(response.data);
        setNodes(graph.nodes);
        setEdges(graph.edges);
        setRaw(graph.raw);
        setBreakdown(graph.breakdown);
      })
      .catch((err: unknown) => {
        if (!active) {
          return;
        }
        if (axios.isAxiosError(err)) {
          const detail = (err.response?.data as { detail?: string; error?: string } | undefined)
            ?.detail;
          const message = (err.response?.data as { detail?: string; error?: string } | undefined)
            ?.error;
          setError(detail ?? message ?? err.message);
          return;
        }
        setError(err instanceof Error ? err.message : "Failed to fetch lineage");
      })
      .finally(() => {
        if (active) {
          setIsLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [balanceId, token, refreshTrigger]);

  return useMemo(
    () => ({ nodes, edges, raw, breakdown, isLoading, error }),
    [nodes, edges, raw, breakdown, isLoading, error],
  );
}
