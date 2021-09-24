/*!
 * Copyright 2021 Cognite AS
 */

import React from 'react';
import { registerVisualTest } from '../../../visual_tests';

import { TestViewer } from '../TestViewer';

function DefaultCadTestPage() {
  return <TestViewer />;
}
registerVisualTest('cad', 'default', 'Default', <DefaultCadTestPage />)
