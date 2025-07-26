export interface Node {
  id: number;
  name: string;
  parent_id: number | null;
  path: string;
}

export interface Property {
  id: number;
  node_id: number;
  key: string;
  value: number;
}

export interface NodeTree {
  id: number;
  name: string;
  path: string;
  properties: { [key: string]: number };
  children: NodeTree[];
}