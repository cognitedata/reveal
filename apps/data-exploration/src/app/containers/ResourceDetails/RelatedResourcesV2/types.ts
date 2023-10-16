export enum LinkType {
  AllLinked = 'Linked',
  DirectlyLinked = 'Directly linked',
  Relationships = 'Relationships',
  Annotations = 'Annotations',
}

export interface LinkTypeOption {
  key: LinkType;
  label: string;
  count: number;
  enabled?: boolean;
}
