/*!
 * Copyright 2020 Cognite AS
 */

import { ModelDataRetriever } from '../ModelDataRetriever';
import { CogniteClient } from '@cognite/sdk';
import { CogniteClient3dExtensions } from '../../utils/CogniteClient3dExtensions';

export class CdfModelDataRetriever implements ModelDataRetriever {
  private readonly client: CogniteClient;
  private readonly clientExtensions: CogniteClient3dExtensions;
  private readonly blobId: number;

  constructor(client: CogniteClient, blobId: number) {
    this.client = client;
    this.clientExtensions = new CogniteClient3dExtensions(this.client);
    this.blobId = blobId;
  }

  public async fetchJson(path: string): Promise<any> {
    return this.clientExtensions.retrieveJsonBlob(this.blobId, path);
  }

  public async fetchData(path: string): Promise<ArrayBuffer> {
    return this.clientExtensions.retrieveBinaryBlob(this.blobId, path);
  }
}
