/*!
 * Copyright 2026 Cognite AS
 */

import { CdfModelIdentifier, DMModelIdentifier } from '../../packages/data-providers';

export const mockDMModelIdentifier = new DMModelIdentifier({
  modelId: 1,
  revisionId: 2,
  revisionExternalId: 'ext-id',
  revisionSpace: 'my-space'
});

export const mockClassicModelIdentifier = new CdfModelIdentifier(3, 4);
