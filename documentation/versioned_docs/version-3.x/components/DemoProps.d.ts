/*!
 * Copyright 2021 Cognite AS
 */

import type { CogniteClient } from '@cognite/sdk-3.x';

export type DemoProps = {
  client: CogniteClient;
  modelId: number;
  revisionId: number;
}
