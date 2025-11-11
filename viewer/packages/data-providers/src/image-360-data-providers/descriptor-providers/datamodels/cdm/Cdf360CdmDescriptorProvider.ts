/*!
 * Copyright 2023 Cognite AS
 */

import { CogniteClient } from '@cognite/sdk';
import { Historical360ImageSet, Image360DescriptorProvider } from '../../../../types';
import { DataModelsSdk } from '../../../../DataModelsSdk';
import { Image360DataModelIdentifier } from '../system-space/Cdf360DataModelsDescriptorProvider';
import { DMDataSourceType } from '../../../../DataSourceType';
import { Cdf360CdmBatchCollectionLoader } from './Cdf360CdmBatchCollectionLoader';

export class Cdf360CdmDescriptorProvider implements Image360DescriptorProvider<DMDataSourceType> {
  private readonly _dmsSdk: DataModelsSdk;
  private readonly _batchLoader: Cdf360CdmBatchCollectionLoader;

  constructor(sdk: CogniteClient) {
    this._dmsSdk = new DataModelsSdk(sdk);
    this._batchLoader = new Cdf360CdmBatchCollectionLoader(this._dmsSdk, sdk);
  }

  public async get360ImageDescriptors(
    collectionIdentifier: Image360DataModelIdentifier,
    _: boolean
  ): Promise<Historical360ImageSet<DMDataSourceType>[]> {
    return this._batchLoader.getCollectionDescriptors({
      externalId: collectionIdentifier.image360CollectionExternalId,
      space: collectionIdentifier.space
    });
  }
}
