import dagre from "dagre";
import {
  Background,
  Controls,
  Edge,
  Node,
  NodeMouseHandler,
  ReactFlow,
  ReactFlowProvider,
  useEdgesState,
  useNodesState,
} from "@xyflow/react";
import { useEffect } from "react";
import { BalanceNode } from "./BalanceNode";
import { ExitNode } from "./ExitNode";
import { ProviderNode } from "./ProviderNode";

const g = new dagre.graphlib.Graph();
g.setDefaultEdgeLabel(() => ({}));

const nodeWidth = 280;
const nodeHeight = 170;

const nodeTypes = {
  providerNode: ProviderNode,
  balanceNode: BalanceNode,
  exitNode: ExitNode,
};

function applyLayout(nodes: Node[], edges: Edge[]) {
  g.setGraph({ rankdir: "LR", ranksep: 90, nodesep: 40 });

  nodes.forEach((node) => g.setNode(node.id, { width: nodeWidth, height: nodeHeight }));
  edges.forEach((edge) => g.setEdge(edge.source, edge.target));
  dagre.layout(g);

  return nodes.map((node) => {
    const pos = g.node(node.id);
    return {
      ...node,
      position: { x: pos?.x ?? 0, y: pos?.y ?? 0 },
    };
  });
}

type FlowGraphProps = {
  nodes: Node[];
  edges: Edge[];
  onNodeClick?: (node: Node) => void;
  onEdgeClick?: (edge: Edge) => void;
};

function FlowGraphInternal({ nodes, edges, onNodeClick, onEdgeClick }: FlowGraphProps) {
  const [layoutNodes, setNodes, onNodesChange] = useNodesState(nodes);
  const [layoutEdges, setEdges, onEdgesChange] = useEdgesState(edges);

  useEffect(() => {
    setNodes(applyLayout(nodes, edges));
    setEdges(edges);
  }, [edges, nodes, setEdges, setNodes]);

  const handleNodeClick: NodeMouseHandler = (_, node) => {
    onNodeClick?.(node);
  };

  return (
    <div className="h-full w-full rounded-xl border border-(--platform-stroke) bg-(--platform-main-bg)">
      <ReactFlow
        fitView
        nodes={layoutNodes}
        edges={layoutEdges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={handleNodeClick}
        onEdgeClick={(_, edge) => onEdgeClick?.(edge)}
        nodeTypes={nodeTypes}
      >
        <Background color="var(--platform-stroke)" />
        <Controls />
      </ReactFlow>
    </div>
  );
}

export function FlowGraph(props: FlowGraphProps) {
  return (
    <ReactFlowProvider>
      <FlowGraphInternal {...props} />
    </ReactFlowProvider>
  );
}
