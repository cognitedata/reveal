import React from 'react';

import {
  render as testingLibraryRender,
  RenderOptions,
} from '@testing-library/react';
import { styleScope } from '@vision/styles/styleScope';

import sdk from '@cognite/cdf-sdk-singleton';
import { SDKProvider } from '@cognite/sdk-provider';

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
