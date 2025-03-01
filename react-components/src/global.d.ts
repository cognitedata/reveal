/*!
 * Copyright 2021 Cognite AS
 */

import { type Cognite3DViewer, type DataSourceType } from '@cognite/reveal';
import { type RevealRenderTarget } from './architecture';

declare global {
  interface Window {
    viewer: Cognite3DViewer<DataSourceType> | undefined;
    renderTarget: RevealRenderTarget | undefined;
    renderTargets: RevealRenderTarget[] | undefined;
  }
}
