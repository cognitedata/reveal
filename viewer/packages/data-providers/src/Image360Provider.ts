/*!
 * Copyright 2022 Cognite AS
 */

import { Image360DescriptorProvider, Image360FileProvider, Image360AnnotationProvider } from './types';

export interface Image360Provider<T> extends Image360DescriptorProvider<T>, Image360DataProvider {}
export interface Image360DataProvider extends Image360FileProvider, Image360AnnotationProvider {}
