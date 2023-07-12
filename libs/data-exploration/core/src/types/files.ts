import { FileInfo, Document } from '@cognite/sdk';

import { RelationshipLabels } from './resource';

export type FileWithRelationshipLabels = RelationshipLabels & FileInfo;
