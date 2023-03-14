export interface OptionType {
  label?: string;
  value: string;
  count?: number;
  options?: Array<ChildOptionType>;
}

export type ChildOptionType = Omit<OptionType, 'options'>;

export type NestedFilterSelection = Record<string, string[]>;

export enum SortDirection {
  Ascending = 'asc',
  Descending = 'desc',
}

export type WidthProps = OneOf<{ width?: number; fullWidth?: boolean }>;
