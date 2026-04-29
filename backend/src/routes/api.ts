import { Router } from "express";
import { z } from "zod";
import { AuthenticatedRequest } from "../middleware/auth";
import {
  enableLineageForBalance,
  fetchBalanceLineage,
  fetchTransactionLineage,
} from "../services/lineage.service";

export const apiRouter = Router();
const enableLineageSchema = z.object({
  ledger_id: z.string().min(1),
  identity_id: z.string().min(1),
  currency: z.string().min(1),
  allocation_strategy: z.enum(["FIFO", "LIFO", "PROPORTIONAL"]).optional(),
});

function firstParam(value: string | string[] | undefined): string {
  if (!value) {
    return "";
  }
  return Array.isArray(value) ? value[0] : value;
}

apiRouter.get("/lineage/balance/:balanceId", async (req: AuthenticatedRequest, res) => {
  try {
    const installedAppId = req.auth?.installed_app_id;
    if (!installedAppId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const data = await fetchBalanceLineage(firstParam(req.params.balanceId), installedAppId);
    res.json(data);
  } catch (error) {
    const detail = error instanceof Error ? error.message : "Unknown error";
    if (detail.includes("does not have fund lineage tracking enabled")) {
      res.status(409).json({
        error: "Lineage not enabled for this balance",
        detail:
          "This balance does not have fund lineage tracking enabled. Enable lineage first, then retry tracking.",
      });
      return;
    }

    res.status(502).json({
      error: "Failed to fetch balance lineage",
      detail,
    });
  }
});

apiRouter.get(
  "/lineage/transaction/:transactionId",
  async (req: AuthenticatedRequest, res) => {
    try {
      const installedAppId = req.auth?.installed_app_id;
      if (!installedAppId) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      const data = await fetchTransactionLineage(
        firstParam(req.params.transactionId),
        installedAppId,
      );
      res.json(data);
    } catch (error) {
      res.status(502).json({
        error: "Failed to fetch transaction lineage",
        detail: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },
);

apiRouter.post("/lineage/enable-balance", async (req: AuthenticatedRequest, res) => {
  try {
    const installedAppId = req.auth?.installed_app_id;
    if (!installedAppId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const parsed = enableLineageSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid payload", detail: parsed.error.flatten() });
      return;
    }

    const data = await enableLineageForBalance(installedAppId, parsed.data);
    res.json(data);
  } catch (error) {
    res.status(502).json({
      error: "Failed to enable lineage",
      detail: error instanceof Error ? error.message : "Unknown error",
    });
  }
});
