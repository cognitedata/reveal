/*!
 * Copyright 2023 Cognite AS
 */
import { CogniteClient, Metadata } from '@cognite/sdk';
import { Historical360ImageSet, Image360DescriptorProvider } from '../../../types';
import { ClassicDataSourceType } from '../../../DataSourceType';

import { Cdf360BatchEventCollectionLoader } from './Cdf360BatchEventCollectionLoader';

export class Cdf360EventDescriptorProvider implements Image360DescriptorProvider<ClassicDataSourceType> {
  private readonly _batchLoader: Cdf360BatchEventCollectionLoader;

  constructor(client: CogniteClient) {
    this._batchLoader = new Cdf360BatchEventCollectionLoader(client);
  }

  public async get360ImageDescriptors(
    metadataFilter: Metadata,
    preMultipliedRotation: boolean
  ): Promise<Historical360ImageSet<ClassicDataSourceType>[]> {
    return this._batchLoader.getCollectionDescriptors(metadataFilter, preMultipliedRotation);
  }
}
