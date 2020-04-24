import React from 'react';

import { render, RenderOptions } from '@testing-library/react';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

i18n.use(initReactI18next).init({
  lng: 'en',
  fallbackLng: 'en',
  debug: false,
  interpolation: { escapeValue: false },
  react: { wait: true, useSuspense: false },
});

export default (
  component: React.ReactElement,
  options?: Omit<RenderOptions, 'queries'>
) => {
  return render(component, options);
};
