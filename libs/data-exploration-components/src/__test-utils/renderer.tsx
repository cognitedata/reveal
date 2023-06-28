import React, { JSXElementConstructor } from 'react';

// Here is where our custom render is being defined, so we don't need this check
import { render, RenderOptions } from '@testing-library/react';

export type CogniteRenderOptions = Omit<RenderOptions, 'queries'>;

type RenderableComponent<Props, T> = React.ReactElement<
  Props,
  JSXElementConstructor<Props> & { story?: T }
>;

export default <Props, T>(
  ui: RenderableComponent<Props, T>,
  options: CogniteRenderOptions = {}
) => {
  // This is where you can wrap your rendered UI component in redux stores,
  // providers, or anything else you might want.

  return render(ui, { ...options });
};

export const renderComponent = <PropsType extends object>(
  component: React.FC<PropsType>,
  props: PropsType,
  options?: CogniteRenderOptions
) => {
  return render(
    <React.Fragment>{React.createElement(component, props)}</React.Fragment>,
    options
  );
};
