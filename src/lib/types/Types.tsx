import { SdkResourceType } from '@cognite/sdk-react-query-hooks';
import { AllIconTypes } from '@cognite/cogs.js';

export type ResourceType =
  | 'asset'
  | 'timeSeries'
  | 'sequence'
  | 'file'
  | 'event';

// Temporary mapping of the two almost identical types. Should be
// removed as soon as possible, but that requires a full refactor
// replacing ResourceType with SdkResourcetype
export function convertResourceType(t: ResourceType): SdkResourceType {
  switch (t) {
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
      throw new Error(`Unknown ResourceType: ${t}`);
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
    default: {
      throw new Error(`Unknown ResourceType: ${t}`);
    }
  }
}

export function getIcon(type: ResourceType): AllIconTypes {
  switch (type) {
    case 'asset':
      return 'ResourceAssets';
    case 'event':
      return 'ResourceEvents';
    case 'file':
      return 'ResourceDocuments';
    case 'sequence':
      return 'ResourceSequences';
    case 'timeSeries':
      return 'ResourceTimeseries';
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
    case undefined:
      return true;
    default:
      return false;
  }
};

export const LocalStorageFileContextKey = 'LocalStorageFileContextKey';
