/*!
 * Copyright 2023 Cognite AS
 */

import { Metadata } from '@cognite/sdk';
import { Historical360ImageSet, Image360DescriptorProvider } from '../../types';
import { Cdf360DataModelsDescriptorProvider, UniqueIdentifier } from './datamodels/Cdf360DataModelsDescriptorProvider';
import { Cdf360EventDescriptorProvider } from './events/Cdf360EventDescriptorProvider';

export class Cdf360CombinedDescriptorProvider implements Image360DescriptorProvider<Metadata | UniqueIdentifier> {
  private readonly _eventProvider: Cdf360EventDescriptorProvider;
  private readonly _fdmProvider: Cdf360DataModelsDescriptorProvider;

  public static isFdmIdentifier(metadataFilter: Metadata | UniqueIdentifier): metadataFilter is UniqueIdentifier {
    const fdmFilter = metadataFilter as UniqueIdentifier;
    return (
      fdmFilter !== undefined && fdmFilter.space !== undefined && fdmFilter.image360CollectionExternalId !== undefined
    );
  }

  constructor(fdmProvider: Cdf360DataModelsDescriptorProvider, eventProvider: Cdf360EventDescriptorProvider) {
    this._fdmProvider = fdmProvider;
    this._eventProvider = eventProvider;
  }

  public get360ImageDescriptors(
    metadataFilter: Metadata | UniqueIdentifier,
    preMultipliedRotation: boolean
  ): Promise<Historical360ImageSet[]> {
    if (Cdf360CombinedDescriptorProvider.isFdmIdentifier(metadataFilter)) {
      return this._fdmProvider.get360ImageDescriptors(metadataFilter, preMultipliedRotation);
    } else {
      return this._eventProvider.get360ImageDescriptors(metadataFilter, preMultipliedRotation);
    }
  }
}
