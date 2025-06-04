import { type Cognite3DViewer, type DataSourceType } from '@cognite/reveal';
import { type RevealRenderTarget } from './architecture';

declare global {
  /* eslint-disable @typescript-eslint/consistent-type-definitions */
  interface Window {
    viewer: Cognite3DViewer<DataSourceType> | undefined;
    renderTarget: RevealRenderTarget | undefined;
    renderTargets: RevealRenderTarget[] | undefined;
  }
}
