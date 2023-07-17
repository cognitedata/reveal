import { UserProfile } from '../../UserProfileProvider';

export enum CommentStatus {
  DRAFT = 'Draft',
  ASSIGNED = 'Assigned',
  RESOLVED = 'Resolved',
}

export enum CommentTargetType {
  CANVAS = 'canvas',
}

// TODO: What entries should this enum have?
export enum CommentContextType {
  FOO = 'foo',
}

export type Comment<CommentContextDataType = any> = {
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
  contextId?: string;
  contextType?: CommentContextType;
  contextData?: CommentContextDataType;

  taggedUsers?: UserProfile[];

  externalId: string;
  lastUpdatedTime: Date;
  createdTime: Date;
};

export type SerializedComment<CommentContextDataType = any> = Omit<
  Comment<CommentContextDataType>,
  'createdBy' | 'taggedUsers'
> & {
  createdById: string;
  taggedUsers?: string[];
};

export type CommentFilter = Partial<
  Pick<
    SerializedComment,
    | 'externalId'
    | 'createdById'
    | 'status'
    | 'parentComment'
    | 'targetId'
    | 'targetType'
    | 'contextId'
    | 'contextType'
    | 'taggedUsers'
  >
>;
