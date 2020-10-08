import { SdkResourceType } from 'hooks/sdk';

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
