/*!
 * Copyright 2020 Cognite AS
 */

import { ModelDataRetriever } from '../ModelDataRetriever';
import { CogniteClient } from '@cognite/sdk';
import { CogniteClient3dExtensions } from '../../utils/CogniteClient3dExtensions';

export class CdfModelDataRetriever implements ModelDataRetriever {
  private readonly sdk: CogniteClient;
  private readonly sdkExtensions: CogniteClient3dExtensions;
  private readonly blobId: number;

  constructor(client: CogniteClient, blobId: number) {
    this.sdk = client;
    this.sdkExtensions = new CogniteClient3dExtensions(this.sdk);
    this.blobId = blobId;
  }

  public async fetchJson(path: string): Promise<any> {
    return this.sdkExtensions.retrieveJsonBlob(this.blobId, path);
  }

  public async fetchData(path: string): Promise<ArrayBuffer> {
    return this.sdkExtensions.retrieveBinaryBlob(this.blobId, path);
  }
}
