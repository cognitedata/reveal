/*!
 * Copyright 2023 Cognite AS
 */

import { Metadata } from '@cognite/sdk';
import { Historical360ImageSet, Image360DescriptorProvider } from '../../types';
import {
  Cdf360DataModelsDescriptorProvider,
  DM360CollectionIdentifier
} from './datamodels/Cdf360DataModelsDescriptorProvider';
import { Cdf360EventDescriptorProvider } from './events/Cdf360EventDescriptorProvider';

export class Cdf360CombinedDescriptorProvider
  implements Image360DescriptorProvider<Metadata | DM360CollectionIdentifier>
{
  private readonly _eventProvider: Cdf360EventDescriptorProvider;
  private readonly _fdmProvider: Cdf360DataModelsDescriptorProvider;

  constructor(fdmProvider: Cdf360DataModelsDescriptorProvider, eventProvider: Cdf360EventDescriptorProvider) {
    this._fdmProvider = fdmProvider;
    this._eventProvider = eventProvider;
  }

  public get360ImageDescriptors(
    metadataFilter: Metadata | DM360CollectionIdentifier,
    preMultipliedRotation: boolean
  ): Promise<Historical360ImageSet[]> {
    if (isFdmIdentifier(metadataFilter)) {
      return this._fdmProvider.get360ImageDescriptors(metadataFilter, preMultipliedRotation);
    } else {
      return this._eventProvider.get360ImageDescriptors(metadataFilter, preMultipliedRotation);
    }

    function isFdmIdentifier(
      metadataFilter: Metadata | DM360CollectionIdentifier
    ): metadataFilter is DM360CollectionIdentifier {
      const fdmFilter = metadataFilter as DM360CollectionIdentifier;
      return (
        fdmFilter !== undefined && fdmFilter.space !== undefined && fdmFilter.image360CollectionExternalId !== undefined
      );
    }
  }
}
