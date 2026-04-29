"use client";

import { Edge, Node } from "@xyflow/react";
import { useEffect, useState } from "react";
import { FlowGraph } from "../components/FlowGraph";
import { LineagePanel } from "../components/LineagePanel";
import { useLineage } from "../hooks/useLineage";
import { createApiClient } from "../lib/api";
import { TransactionLineageResponse } from "../lib/types";

function useEmbedToken(): string | null | undefined {
  const [token, setToken] = useState<string | null>();

  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    setToken(query.get("token"));
  }, []);

  return token;
}

export function LineageView() {
  const token = useEmbedToken();
  const [inputBalanceId, setInputBalanceId] = useState("");
  const [selectedBalanceId, setSelectedBalanceId] = useState<string>("");
  const [trackRequestVersion, setTrackRequestVersion] = useState(0);
  const [transactionLineage, setTransactionLineage] =
    useState<TransactionLineageResponse | null>(null);

  const lineage = useLineage(selectedBalanceId, token ?? "", trackRequestVersion);

  const selectedBalanceName = lineage.raw?.balance_name;

  const handleNodeClick = (node: Node) => {
    if (node.type === "balanceNode") {
      const nextBalanceId =
        (node.data as { balanceId?: string } | undefined)?.balanceId ??
        node.id.replace("balance-", "");
      setInputBalanceId(nextBalanceId);
      setSelectedBalanceId(nextBalanceId);
      setTransactionLineage(null);
    }
  };

  const handleEdgeClick = async (edge: Edge) => {
    const transactionId = (edge.data as { transactionId?: string } | undefined)?.transactionId;
    if (!transactionId || !token) {
      return;
    }

    try {
      const client = createApiClient(token);
      const res = await client.get<TransactionLineageResponse>(
        `/api/lineage/transaction/${transactionId}`,
      );
      setTransactionLineage(res.data);
    } catch {
      setTransactionLineage(null);
    }
  };

  if (token === undefined) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[var(--platform-nav-bg)] p-4 text-(--platform-muted-secondary)">
        Loading...
      </main>
    );
  }

  if (!token) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[var(--platform-nav-bg)] p-4 text-(--platform-primary-text)">
        Missing or invalid embed token.
      </main>
    );
  }

  const handleTrackBalance = () => {
    const nextBalanceId = inputBalanceId.trim();
    if (!nextBalanceId) {
      return;
    }
    setSelectedBalanceId(nextBalanceId);
    setTrackRequestVersion((prev) => prev + 1);
    setTransactionLineage(null);
  };

  return (
    <main className="grid min-h-screen grid-cols-1 gap-4 bg-[var(--platform-nav-bg)] p-4 text-[var(--platform-primary-text)] lg:grid-cols-[2fr_1fr]">
      <section className="flex h-[calc(100vh-2rem)] flex-col gap-3 rounded-xl border border-[var(--platform-stroke)] bg-[var(--platform-nav-bg)]/85 p-3 shadow-[0_12px_36px_rgba(0,0,0,0.35)] backdrop-blur-sm">
        <div className="flex flex-wrap items-center gap-3 rounded-lg border border-[var(--platform-stroke)] bg-[var(--platform-main-bg)] p-3">
          <label htmlFor="balance-id-input" className="text-sm text-[var(--platform-muted-secondary)]">
            Balance ID
          </label>
          <input
            id="balance-id-input"
            value={inputBalanceId}
            onChange={(event) => {
              setInputBalanceId(event.target.value);
            }}
            placeholder="Enter balance ID to track"
            className="input-dark-autofill rounded-md border border-[var(--platform-input-border)] bg-[var(--platform-input-main-bg)] px-3 py-2 text-sm text-[var(--platform-primary-text)] placeholder:text-[var(--platform-muted)]"
          />
          <button
            type="button"
            onClick={handleTrackBalance}
            className="btn-primary-cta bg-cta px-3 py-2 text-[var(--platform-button-text-color)]"
          >
            Track
          </button>
        </div>

        <div className="flex-1">
          {!selectedBalanceId ? (
            <div className="flex h-full items-center justify-center rounded-xl border border-[var(--platform-stroke)] bg-[var(--platform-main-bg)] text-[var(--platform-muted-secondary)]">
              Enter a balance ID to load lineage.
            </div>
          ) : lineage.isLoading ? (
            <div className="flex h-full items-center justify-center rounded-xl border border-[var(--platform-stroke)] bg-[var(--platform-main-bg)] text-[var(--platform-muted-secondary)]">
              Loading lineage...
            </div>
          ) : lineage.error ? (
            <div className="flex h-full items-center justify-center rounded-xl border border-[var(--platform-custom-red)]/80 bg-[var(--platform-main-bg)] p-4 text-[var(--platform-custom-red)]">
              <p className="w-full max-w-2xl">{lineage.error}</p>
            </div>
          ) : (
            <FlowGraph
              nodes={lineage.nodes}
              edges={lineage.edges}
              onNodeClick={handleNodeClick}
              onEdgeClick={handleEdgeClick}
            />
          )}
        </div>
      </section>

      <LineagePanel
        selectedBalanceName={selectedBalanceName}
        breakdown={lineage.breakdown}
        transactionLineage={transactionLineage}
      />
    </main>
  );
}
