/*!
 * Copyright 2020 Cognite AS
 */

import { HttpHeaders } from '@cognite/sdk-core';

export interface HttpHeadersProvider {
  readonly headers: HttpHeaders;
}
