// types.ts
export interface StoryNode {
  id: string;
  label: string;
  x: number;
  y: number;
  description?: string;
  badge?: string;
  color?: string;
}

export interface Connection {
  from: string;
  to: string;
}
