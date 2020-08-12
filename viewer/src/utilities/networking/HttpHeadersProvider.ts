/*!
 * Copyright 2020 Cognite AS
 */

export type HttpHeaders = { [key: string]: string };

export interface HttpHeadersProvider {
  readonly headers: HttpHeaders;
}
