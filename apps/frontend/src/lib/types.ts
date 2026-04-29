import { Edge, Node } from "@xyflow/react";

export type ProviderBreakdown = {
  provider: string;
  amount: number;
  available: number;
  spent: number;
};

export type BalanceLineageResponse = {
  balance_id: string;
  balance_name?: string;
  total_with_lineage?: string | number;
  precision?: number;
  providers: Array<{
    provider: string;
    amount: string | number;
    available: string | number;
    spent: string | number;
  }>;
  transfers?: Array<{
    from_balance_id: string;
    to_balance_id: string;
    from_balance_name?: string;
    to_balance_name?: string;
    provider?: string;
    amount: string | number;
    transaction_id?: string;
    exits_system?: boolean;
    exit_name?: string;
  }>;
};

export type TransactionLineageResponse = {
  transaction_id?: string;
  reference?: string;
  amount?: string | number;
  precision?: number;
  fund_allocation?: Array<{
    provider: string;
    amount: string | number;
  }>;
  BLNK_FUND_ALLOCATION?: Array<{
    provider: string;
    amount: string | number;
  }>;
  shadow_transactions?: Array<{
    transaction_id: string;
    description?: string;
    provider?: string;
    amount?: string | number;
  }>;
};

export type ProviderNodeData = {
  provider: string;
  amount: number;
};

export type BalanceNodeData = {
  balanceId: string;
  name: string;
  total: number;
  providers: ProviderBreakdown[];
};

export type ExitNodeData = {
  label: string;
  provider?: string;
  amount: number;
};

export type LineageGraphResult = {
  nodes: Node[];
  edges: Edge[];
  raw: BalanceLineageResponse | null;
  breakdown: ProviderBreakdown[];
};
