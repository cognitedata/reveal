/*!
 * Copyright 2024 Cognite AS
 */
import { type SourceSelectorV3 } from '@cognite/sdk';
import { COGNITE_CAD_REVISION_SOURCE } from './dataModels';

export const cogniteCadNodeSourceWithPRoperties = [
  {
    source: COGNITE_CAD_REVISION_SOURCE,
    properties: ['status', 'published', 'type', 'model3D', 'revisionId']
  }
] as const satisfies SourceSelectorV3;
