import React from 'react';
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
