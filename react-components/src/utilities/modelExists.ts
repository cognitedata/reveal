/*!
 * Copyright 2024 Cognite AS
 */

import {
  type CognitePointCloudModel,
  type Cognite3DViewer,
  type CogniteCadModel
} from '@cognite/reveal';

export function modelExists(
  model: CogniteCadModel | CognitePointCloudModel | undefined,
  viewer: Cognite3DViewer
): model is CogniteCadModel | CognitePointCloudModel {
  return model !== undefined && viewer.models.includes(model);
}
