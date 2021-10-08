/*!
 * Copyright 2021 Cognite AS
 */

import { HttpHeaders } from '@cognite/sdk-core';

export interface HttpHeadersProvider {
  readonly headers: HttpHeaders;
}
