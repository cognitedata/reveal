import { SdkResourceType } from '@cognite/sdk-react-query-hooks';
import { AllIconTypes } from '@cognite/cogs.js';

export enum ResourceTypes {
  Asset = 'asset',
  TimeSeries = 'timeSeries',
  Sequence = 'sequence',
  File = 'file',
  Event = 'event',
  ThreeD = 'threeD',
}

export type ResourceType =
  | 'asset'
  | 'timeSeries'
  | 'sequence'
  | 'file'
  | 'event'
  | 'threeD';

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

export function getTitle(t: ResourceType, plural: boolean = true): string {
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
  externalId?: string;
  type: ResourceType;
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
