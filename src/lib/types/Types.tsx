import { SdkResourceType } from '@cognite/sdk-react-query-hooks';

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

export type ResourceItem = {
  id: number;
  externalId?: string;
  type: ResourceType;
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
