import React from 'react';
import { BrowserRouter } from 'react-router-dom';
// Here is where our custom render is being defined, so we don't need this check
/* eslint-disable-next-line @cognite/rtl-use-custom-render-function */
import { render, RenderOptions } from '@testing-library/react';
import { I18nContainer } from '@cognite/react-i18n';

const testRenderer = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'queries'>
) => {
  // This is where you can wrap your rendered UI component in redux stores,
  // providers, or anything else you might want.
  const component = (
    <I18nContainer>
      <BrowserRouter>{ui}</BrowserRouter>
    </I18nContainer>
  );

  return render(component, options);
};

export default testRenderer;
