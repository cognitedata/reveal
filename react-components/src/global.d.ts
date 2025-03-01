/*!
 * Copyright 2021 Cognite AS
 */

import { type Cognite3DViewer, type DataSourceType } from '@cognite/reveal';
import { type RevealRenderTarget } from './architecture';

declare global {
  /* eslint-disable no-var */
  var viewer: Cognite3DViewer<DataSourceType> | undefined;
  /* eslint-disable no-var */
  var renderTarget: RevealRenderTarget | undefined;
}
