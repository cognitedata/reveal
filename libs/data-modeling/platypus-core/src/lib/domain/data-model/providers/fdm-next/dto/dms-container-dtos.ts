export interface ContainerReference {
  space: string;
  externalId: string;
}
export interface ContainerInstance {
  space: string;
  externalId: string;
  name: string;
  description: string;
  usedFor: 'node' | 'edge' | 'all';
}

export type ListQueryParams = {
  limit?: number;
  cursor?: string;
  space?: string;
};
