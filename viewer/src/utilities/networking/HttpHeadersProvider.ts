/*!
 * Copyright 2020 Cognite AS
 */

import { HttpHeaders } from '@cognite/sdk/dist/src/utils/http/basicHttpClient';

export interface HttpHeadersProvider {
  readonly headers: HttpHeaders;
}
