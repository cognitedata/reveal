import { RelationshipLabels } from './resource';
import { FileInfo } from '@cognite/sdk';

export type FileWithRelationshipLabels = RelationshipLabels & FileInfo;
