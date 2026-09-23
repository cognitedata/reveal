/*!
 * Copyright 2022 Cognite AS
 */

import type { Image360CollectionSourceType } from '../types';
import type {
  ClassicDataSourceType,
  DataSourceType,
  DMDataSourceType,
  Image360DescriptorProvider,
  Image360FileProvider
} from '@reveal/data-providers';
import { isFdm360ImageCollectionIdentifier } from '@reveal/data-providers';
import type { Image360AnnotationProvider } from './Image360AnnotationProvider';

export type Image360ProviderMap = Map<
  Image360CollectionSourceType,
  Image360Provider<DMDataSourceType> | Image360Provider<ClassicDataSourceType>
>;

export function getImage360ProviderFromMap<T extends DataSourceType>(
  identifier: T['image360Identifier'],
  providerMap: Image360ProviderMap
): Image360Provider<T> {
  if (isFdm360ImageCollectionIdentifier(identifier)) {
    const source = identifier.source ?? 'dm';
    return providerMap.get(source) as unknown as Image360Provider<T>;
  } else {
    return providerMap.get('event') as unknown as Image360Provider<T>;
  }
}

export interface Image360Provider<T extends DataSourceType>
  extends Image360DescriptorProvider<T>, Image360FileProvider, Image360AnnotationProvider<T> {}
