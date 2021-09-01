/*!
 * Copyright 2021 Cognite AS
 */

import { CogniteInternalId } from '@cognite/sdk';

export type ByTreeIndicesResponse = {
  items: CogniteInternalId[];
};

export type ByNodeIdsReponse = {
  items: number[];
};
