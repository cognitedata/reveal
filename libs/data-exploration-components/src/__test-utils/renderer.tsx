import * as React from 'react';

import render, { CogniteRenderOptions } from '@platypus-app/tests/render';

export const renderComponent = <PropsType,>(
  component: React.FC<PropsType>,
  props: PropsType,
  options?: CogniteRenderOptions
) => {
  return render(
    <React.Fragment>{React.createElement(component, props)}</React.Fragment>,
    options
  );
};
