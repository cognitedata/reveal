import { Relationship } from '@cognite/sdk';

export interface ExtendedRelationship extends Relationship {
  relation: 'Source' | 'Target';
}
