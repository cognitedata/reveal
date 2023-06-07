import { UseQueryOptions } from '@tanstack/react-query';

export interface OptionType {
  label?: string;
  value: string;
  count?: number;
  options?: Array<ChildOptionType>;
}

export type ChildOptionType = Omit<OptionType, 'options'>;

export type OptionSelection = Record<string, string[]>;

export enum SortDirection {
  Ascending = 'asc',
  Descending = 'desc',
}

export type WidthProps = OneOf<{
  width?: number | string;
  fullWidth?: boolean;
}>;

export type CustomMetadataValue = (
  metadataKeys?: string | null,
  query?: string,
  options?: UseQueryOptions<ChildOptionType>
) => {
  options: {
    label: string | undefined;
    value: string;
    count: number;
  }[];
  isLoading: boolean;
};
