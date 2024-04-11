/*!
 * Copyright 2022 Cognite AS
 */

import {
  Image360DescriptorProvider,
  Image360FileProvider,
  Image360AnnotationProvider,
  Image360AssetProvider
} from './types';

export type Image360Provider<T> = {} & Image360DescriptorProvider<T> & Image360DataProvider;
export type Image360DataProvider = {} & Image360FileProvider & Image360AnnotationProvider & Image360AssetProvider;
