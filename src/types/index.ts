export interface Position {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface Node {
  id: string;
  label: string;
  position: Position;
  size?: Size;
  type?: string;
  icon?: string;
  color?: string;
  borderColor?: string;
  description?: string;
  parentContainer?: string;
}

export interface Container {
  id: string;
  label: string;
  position: Position;
  size: Size;
  icon?: string;
  color?: string;
  borderColor?: string;
  description?: string;
}

export interface Connection {
  id: string;
  source: string;
  target: string;
  label?: string;
  type?: string;
  animated?: boolean;
  description?: string;
  style?: Record<string, any>;
}

export interface DiagramData {
  containers: Container[];
  nodes: Node[];
  connections: Connection[];
  metadata?: Record<string, any>;
}

export interface ArchitectureDiagramEditorProps {
  value?: DiagramData;
  defaultValue?: DiagramData;
  onChange?: (diagram: DiagramData) => void;
  onNodeChange?: (nodeId: string, changes: Partial<Node>) => void;
  onConnectionChange?: (connectionId: string, changes: Partial<Connection>) => void;
  onSelectionChange?: (selection: { nodes: string[]; connections: string[] }) => void;
  onError?: (error: Error) => void;
  style?: React.CSSProperties;
  className?: string;
  mode?: 'light' | 'dark';
  readOnly?: boolean;
  disabled?: boolean;
}
