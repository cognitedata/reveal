/*!
 * Copyright 2022 Cognite AS
 */

import { CogniteClient } from '@cognite/sdk';

export class Image360EntityFactory {
  private readonly _sdk: CogniteClient;
  constructor(cogniteClient: CogniteClient) {
    this._sdk = cogniteClient;
  }
  // public create(eventMetadataFilter: Metadata) {
  //   this._sdk.events.list();
  // }
}
