/*!
 * Copyright 2023 Cognite AS
 */
import { CogniteClient, Metadata } from '@cognite/sdk';
import { Historical360ImageSet, Image360DescriptorProvider } from '../../../types';
import { ClassicDataSourceType } from '../../../DataSourceType';

import { BatchEventCollectionLoader } from './BatchEventCollectionLoader';

export class Cdf360EventDescriptorProvider implements Image360DescriptorProvider<ClassicDataSourceType> {
  private readonly _batchLoader: BatchEventCollectionLoader;

  constructor(client: CogniteClient) {
    this._batchLoader = new BatchEventCollectionLoader(client);
  }

  public async get360ImageDescriptors(
    metadataFilter: Metadata,
    preMultipliedRotation: boolean
  ): Promise<Historical360ImageSet<ClassicDataSourceType>[]> {
    return this._batchLoader.getCollectionDescriptors(metadataFilter, preMultipliedRotation);
  }
}
