/*!
 * Copyright 2022 Cognite AS
 */

import { Image360CollectionSourceType } from '@reveal/360-images';
import { ClassicDataSourceType, DataSourceType, DMDataSourceType } from './DataSourceType';
import { Image360DescriptorProvider, Image360FileProvider, Image360AnnotationProvider } from './types';
import { isFdm360ImageCollectionIdentifier } from './image-360-data-providers/shared';

export type Image360ProviderMap = Map<
  Image360CollectionSourceType,
  Image360Provider<DMDataSourceType> | Image360Provider<ClassicDataSourceType>
>;

export function getImage360ProviderFromMap<T extends DataSourceType>(
  identifier: T['image360Identifier'],
  providerMap: Image360ProviderMap
): Image360Provider<DataSourceType> {
  if (isFdm360ImageCollectionIdentifier(identifier)) {
    return providerMap.get(identifier.source) as Image360Provider<T>;
  } else {
    return providerMap.get('event') as Image360Provider<T>;
  }
}

export interface Image360Provider<T extends DataSourceType>
  extends Image360DescriptorProvider<T>,
    Image360FileProvider,
    Image360AnnotationProvider<T> {}
