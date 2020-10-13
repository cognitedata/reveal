import React from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { styleScope } from 'utils';

export default (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'queries'>
) => {
  // This is where you can wrap your rendered UI component in redux stores,
  // providers, or anything else you might want.
  const component = <div className={styleScope}>{ui}</div>;

  return render(component, options);
};
