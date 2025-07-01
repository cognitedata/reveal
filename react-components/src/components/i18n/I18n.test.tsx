import { beforeEach, describe, expect, test } from 'vitest';
import { I18nContextProvider } from './I18n';
import { render, waitFor } from '@testing-library/react';
import { setCurrentLanguage, translate } from '../../architecture/base/utilities/translateUtils';

describe(I18nContextProvider.name, () => {
  beforeEach(async () => {
    await setCurrentLanguage('en');
  });

  test('correctly sets translation language', async () => {
    render(
      <I18nContextProvider appLanguage="en">
        <></>
      </I18nContextProvider>
    );

    await waitFor(() => {
      expect(translate({ key: 'CANCEL' })).toBe('Cancel');
    });

    render(
      <I18nContextProvider appLanguage="sv">
        <></>
      </I18nContextProvider>
    );

    await waitFor(() => {
      expect(translate({ key: 'CANCEL' })).toBe('Avbryt');
    });
  });

  test('setting invalid language defaults to previously selected language', async () => {
    render(
      <I18nContextProvider appLanguage="pt">
        <></>
      </I18nContextProvider>
    );

    await waitFor(() => {
      expect(translate({ key: 'CANCEL' })).toBe('Cancelar');
    });
    render(
      <I18nContextProvider appLanguage="some-invalid-language">
        <></>
      </I18nContextProvider>
    );

    await waitFor(() => {
      expect(translate({ key: 'CANCEL' })).toBe('Cancelar');
    });
  });
});
