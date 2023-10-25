import { RowSelectionState, Updater } from '@tanstack/react-table';

import { AllIconTypes } from '@cognite/cogs.js';
import type { ViewerState } from '@cognite/reveal';
import { SdkResourceType } from '@cognite/sdk-react-query-hooks';

import { FilterState } from './filters';

export enum ResourceTypes {
  Asset = 'asset',
  TimeSeries = 'timeSeries',
  Sequence = 'sequence',
  File = 'file',
  Event = 'event',
  ThreeD = 'threeD',
  Charts = 'charts',
}

export type ResourceType =
  | 'asset'
  | 'timeSeries'
  | 'sequence'
  | 'file'
  | 'event'
  | 'charts'
  | 'threeD';

export type ResourceSelectionMode = 'single' | 'multiple';
export type SelectableItemsProps = {
  onSelect: (
    updater?: Updater<RowSelectionState>,
    currentData?: ResourceItem[],
    resourceType?: ResourceType
  ) => void;
  selectionMode: ResourceSelectionMode;
  isSelected: boolean;
};

// Temporary mapping of the two almost identical types. Should be
// removed as soon as possible, but that requires a full refactor
// replacing ResourceType with SdkResourcetype
export function convertResourceType(type?: ResourceType): SdkResourceType {
  if (type === 'threeD') return type as SdkResourceType;

  switch (type) {
    case 'asset': {
      return 'assets';
    }
    case 'timeSeries': {
      return 'timeseries';
    }
    case 'sequence': {
      return 'sequences';
    }
    case 'file': {
      return 'files';
    }
    case 'event': {
      return 'events';
    }
    default: {
      throw new Error(`Unknown ResourceType: ${type}`);
    }
  }
}

export function getTitle(t: ResourceType, plural = true): string {
  switch (t) {
    case 'asset': {
      return plural ? 'Assets' : 'Asset';
    }
    case 'timeSeries': {
      return 'Time series';
    }
    case 'sequence': {
      return plural ? 'Sequences' : 'Sequence';
    }
    case 'file': {
      return plural ? 'Files' : 'File';
    }
    case 'event': {
      return plural ? 'Events' : 'Event';
    }
    case 'threeD': {
      return plural ? '3D models' : '3D model';
    }
    case 'charts': {
      return plural ? 'Charts' : 'Chart';
    }
    default: {
      throw new Error(`Unknown ResourceType: ${t}`);
    }
  }
}

export function getIcon(type: ResourceType): AllIconTypes {
  switch (type) {
    case 'asset':
      return 'Assets';
    case 'event':
      return 'Events';
    case 'file':
      return 'Document';
    case 'sequence':
      return 'Sequences';
    case 'timeSeries':
      return 'Timeseries';
    default:
      throw new Error('We forgot about a resource type :(');
  }
}

export type ResourceItem = {
  id: number;
  subId?: number; // E.g., the revisionId for threeD resources
  externalId?: string;
  type: ResourceType;
};

export type ExtendedResourceItem = ResourceItem & {
  dateRange?: [Date, Date];
  camera?: ViewerState['camera'];
  selectedAssetId?: number;
};

export type ResourceItemState = ResourceItem & {
  state: 'disabled' | 'active' | 'selected';
};

export type RenderResourceActionsFunction = (
  item: ResourceItem
) => React.ReactNode[];

export type ModelStatus =
  | 'New'
  | 'Scheduled'
  | 'Queued'
  | 'Completed'
  | 'Running'
  | 'Failed';

export const isModelRunning = (s?: ModelStatus) => {
  switch (s) {
    case 'New':
    case 'Scheduled':
    case 'Queued':
    case 'Running':
      return true;
    case undefined:
    default:
      return false;
  }
};

export const LocalStorageFileContextKey = 'LocalStorageFileContextKey';

export interface RelationshipLabels {
  relationshipLabels?: string[];
  relation?: string;
  relatedResourceType?: string;
}

export type ResourceSelectorFilter = Partial<FilterState>;

export type ResourceSelection = Record<
  ResourceType,
  Record<string, ResourceItem>
>;
