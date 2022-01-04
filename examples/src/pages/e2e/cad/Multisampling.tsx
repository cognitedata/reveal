/*!
 * Copyright 2022 Cognite AS
 */

import { registerVisualTest } from '../../../visual_tests';
import { Cognite3DTestViewer } from '../Cognite3DTestViewer';
import { CogniteClient } from '@cognite/sdk';

function Multisampling() {
  return (
    <Cognite3DTestViewer
      modelUrls={['primitives']}
      viewerOptions={{
        sdk: new CogniteClient({ appId: 'reveal-visual-lol'}),
        antiAliasingHint: 'msaa4' } } />
  );
}
registerVisualTest('cad', 'multisampling', 'Multisampling', <Multisampling />);
