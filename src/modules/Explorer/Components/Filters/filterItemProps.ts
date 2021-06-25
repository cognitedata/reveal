import { FileFilterProps } from '@cognite/cdf-sdk-singleton';

export type FilterItemProps = {
  filter: FileFilterProps;
  setFilter: (newFilter: FileFilterProps) => void;
};
