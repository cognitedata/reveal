/*!
 * Copyright 2023 Cognite AS
 */

import { Metadata } from '@cognite/sdk';
import { Historical360ImageSet, Image360DescriptorProvider } from '../types';
import { Cdf360FdmProvider, DM360Identifier } from './Cdf360FdmProvider';
import { Cdf360EventProvider } from './Cdf360EventProvider';

export class Cdf360CombinedDescriptorProvider implements Image360DescriptorProvider<Metadata | DM360Identifier> {
  private readonly _eventProvider: Cdf360EventProvider;
  private readonly _fdmProvider: Cdf360FdmProvider;

  constructor(fdmProvider: Cdf360FdmProvider, eventProvider: Cdf360EventProvider) {
    this._fdmProvider = fdmProvider;
    this._eventProvider = eventProvider;
  }

  public get360ImageDescriptors(
    metadataFilter: Metadata | DM360Identifier,
    preMultipliedRotation: boolean
  ): Promise<Historical360ImageSet[]> {
    if (isFdmIdentifier(metadataFilter)) {
      return this._fdmProvider.get360ImageDescriptors(metadataFilter, preMultipliedRotation);
    } else {
      return this._eventProvider.get360ImageDescriptors(metadataFilter, preMultipliedRotation);
    }

    function isFdmIdentifier(metadataFilter: Metadata | DM360Identifier): metadataFilter is DM360Identifier {
      const fdmFilter = metadataFilter as DM360Identifier;
      return fdmFilter !== undefined && fdmFilter.space !== undefined && fdmFilter.dataModelExternalId !== undefined;
    }
  }
}
