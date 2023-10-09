import React from 'react';

import {
  render as testingLibraryRender,
  RenderOptions,
} from '@testing-library/react';

import sdk from '@cognite/cdf-sdk-singleton';
import { SDKProvider } from '@cognite/sdk-provider';

import { styleScope } from '../../styles/styleScope';

export const render = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'queries'>
) => {
  const component = (
    <div className={styleScope}>
      <SDKProvider sdk={sdk}>{ui}</SDKProvider>
    </div>
  );

  return testingLibraryRender(component, options);
};
