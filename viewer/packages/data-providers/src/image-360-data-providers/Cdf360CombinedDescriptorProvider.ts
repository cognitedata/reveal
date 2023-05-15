/*!
 * Copyright 2023 Cognite AS
 */

import { Metadata } from '@cognite/sdk';
import { Historical360ImageSet, Image360DescriptorProvider } from '../types';
import { Cdf360FdmProvider, FdmIdentifier } from './Cdf360FdmProvider';
import { Cdf360EventProvider } from './Cdf360EventProvider';

export class Cdf360CombinedDescriptorProvider implements Image360DescriptorProvider<Metadata | FdmIdentifier> {
  private readonly _eventProvider: Cdf360EventProvider;
  private readonly _fdmProvider: Cdf360FdmProvider;

  constructor(fdmProvider: Cdf360FdmProvider, eventProvider: Cdf360EventProvider) {
    this._fdmProvider = fdmProvider;
    this._eventProvider = eventProvider;
  }

  public get360ImageDescriptors(
    metadataFilter: Metadata | FdmIdentifier,
    preMultipliedRotation: boolean
  ): Promise<Historical360ImageSet[]> {
    if (isFdmIdentifier(metadataFilter)) {
      return this._fdmProvider.get360ImageDescriptors(metadataFilter, preMultipliedRotation);
    } else {
      return this._eventProvider.get360ImageDescriptors(metadataFilter, preMultipliedRotation);
    }

    function isFdmIdentifier(metadataFilter: Metadata | FdmIdentifier): metadataFilter is FdmIdentifier {
      const fdmFilter = metadataFilter as FdmIdentifier;
      return fdmFilter !== undefined && fdmFilter.space !== undefined && fdmFilter.dataModelExternalId !== undefined;
    }
  }
}
