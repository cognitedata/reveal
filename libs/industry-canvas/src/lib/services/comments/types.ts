import { UserProfile } from '../../UserProfileProvider';

export enum CommentStatus {
  DRAFT = 'Draft',
  ASSIGNED = 'Assigned',
  RESOLVED = 'Resolved',
}

export enum CommentTargetType {
  CANVAS = 'canvas',
  ACTIVITY = 'activity',
  CHECKLIS = 'checklist',
}

export enum CommentTargetSubType {
  THREE_D = 'threeD',
  DOCUMENT = 'document',
  TIMESERIES = 'timeSeries',
  ASSET = 'asset',
  EVENT = 'event',
}

export type CommentTargetContextDataType = { x: number; y: number };

// Based on https://github.com/cognitedata/ark/blob/master/services/datamodelstorage/system-space-definitions/src/main/resources/system-spaces/apps_system_shared.yml
export type Comment = {
  text: string;
  // It might be that, for a given user identifier, the corresponding user
  // profile may not exist (e.g., because the user has deleted their account).
  // To let the application developer handle this case themselves, we allow
  // createdBy to be undefined.
  createdBy: UserProfile | undefined;
  status?: CommentStatus;
  parentComment?: Pick<Comment, 'externalId'>;

  targetId?: string;
  targetType?: CommentTargetType;
  targetSubType?: CommentTargetSubType;
  targetContext?: CommentTargetContextDataType;

  taggedUsers?: UserProfile[];

  // Built-in (non-modifiable) FDM properties
  externalId: string;
  lastUpdatedTime: Date;
  createdTime: Date;
};

// NOTE: This type is a proxy against the UserProfile type container via the
// `/profiles/me` endpoint. The userIdentifier of a UserProfile is expected to
// be identical to the externalId of its corresponding CdfUser
export type CdfUser = {
  externalId: string;
  email?: string;
};

export type SerializedComment = Omit<Comment, 'createdBy' | 'taggedUsers'> & {
  createdBy: CdfUser;
  taggedUsers?: CdfUser[];
};

export type CommentFilter = Partial<
  Pick<
    SerializedComment,
    | 'externalId'
    | 'createdBy'
    | 'status'
    | 'parentComment'
    | 'targetId'
    | 'targetType'
    | 'targetSubType'
    | 'taggedUsers'
  >
>;
