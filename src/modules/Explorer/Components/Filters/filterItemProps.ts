import { FileFilterProps } from '@cognite/cdf-sdk-singleton';

export type FilterItemProps = {
  filter: FileFilterProps;
  setFilter: (newFilter: FileFilterProps) => void;
};

// ToDo: remove once fileFilterProps have been properly updated with directoryPrefix field
export type VisionFileFilterProps = FileFilterProps & {
  directoryPrefix?: string;
};

// ToDo: remove once fileFilterProps have been properly updated with directoryPrefix field
export type DirectoryPrefixFilterProps = {
  filter: VisionFileFilterProps;
  setFilter: (newFilter: VisionFileFilterProps) => void;
};
