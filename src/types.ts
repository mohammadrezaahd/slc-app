// types.ts
export interface StoryNode {
  id: string;
  label: string;
  x: number;
  y: number;
}

export interface Connection {
  from: string;
  to: string;
}
