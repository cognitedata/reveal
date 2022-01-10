/*!
 * Copyright 2021 Cognite AS
 */

import React from 'react';
import { registerVisualTest } from '../../../visual_tests';

import { TestViewer } from '../TestViewer';

function DefaultCadTestPageV8() {
  return <TestViewer modelName={"primitives_v8"} />;
}
registerVisualTest('cad', 'default-v8', 'Default V8', <DefaultCadTestPageV8 />)
