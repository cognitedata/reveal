import { type SourceSelectorV3 } from '@cognite/sdk';
import { COGNITE_CAD_REVISION_SOURCE } from './dataModels';

export const cogniteCadRevisionSourceWithProperties: [
  {
    readonly source: {
      readonly externalId: 'CogniteCADRevision';
      readonly space: 'cdf_cdm';
      readonly version: 'v1';
      readonly type: 'view';
    };
    readonly properties: ['status', 'published', 'type', 'model3D', 'revisionId'];
  }
] = [
  {
    source: COGNITE_CAD_REVISION_SOURCE,
    properties: ['status', 'published', 'type', 'model3D', 'revisionId']
  }
] as const satisfies SourceSelectorV3;
