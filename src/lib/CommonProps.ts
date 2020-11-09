import { ResourceSelectionMode } from 'lib/hooks/useSelection';
import { ResourceItem } from './types/Types';

export type SmallPreviewProps = {
  actions?: React.ReactNode[];
  extras?: React.ReactNode[];
  children?: React.ReactNode;
  statusText?: string;
};

export type SelectableItemsProps = {
  onSelect: (item: ResourceItem) => void;
  selectionMode: ResourceSelectionMode;
  isSelected: (item: ResourceItem) => boolean;
};

export type SelectableItemProps = {
  onSelect: () => void;
  selectionMode: ResourceSelectionMode;
  isSelected: boolean;
};
