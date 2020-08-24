import React from 'react';
// Here is where our custom render is being defined, so we don't need this check
/* eslint-disable-next-line @cognite/rtl-use-custom-render-function */
import { render, RenderOptions } from '@testing-library/react';
import { I18nContainer } from '@cognite/react-i18n';

export default (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'queries'>
) => {
  // This is where you can wrap your rendered UI component in redux stores,
  // providers, or anything else you might want.
  const component = <I18nContainer>{ui}</I18nContainer>;

  return render(component, options);
};
