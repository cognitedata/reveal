/*!
 * Copyright 2021 Cognite AS
 */

import { type Cognite3DViewer, type DataSourceType } from '@cognite/reveal';
import { type RevealRenderTarget } from './architecture';

declare global {
  var viewer: Cognite3DViewer<DataSourceType> | undefined;
  var renderTarget: RevealRenderTarget | undefined;
}
