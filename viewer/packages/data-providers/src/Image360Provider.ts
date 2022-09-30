/*!
 * Copyright 2022 Cognite AS
 */

import { Image360DescriptorProvider, Image360FileProvider } from './types';

export interface Image360Provider<T> extends Image360DescriptorProvider<T>, Image360FileProvider {}
