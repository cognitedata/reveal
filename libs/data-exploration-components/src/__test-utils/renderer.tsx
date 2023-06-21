import { createElement, FC, Fragment } from 'react';

import { render, RenderOptions, RenderResult } from '@testing-library/react';

export const renderComponent = <Props extends object>(
  component: FC<Props>,
  props: Props,
  options?: RenderOptions
): RenderResult => {
  return render(
    <Fragment>{createElement(component, props)}</Fragment>,
    options
  );
};
