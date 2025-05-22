import { describe, expect, test } from 'vitest';
import { I18nContextProvider } from './I18n';
import { render, waitFor } from '@testing-library/react';
import { translate } from '../../architecture/base/utilities/translateUtils';

describe(I18nContextProvider.name, () => {
  test('correctly sets translation language', async () => {
    render(
      <I18nContextProvider appLanguage="en">
        <></>
      </I18nContextProvider>
    );

    await waitFor(() => expect(translate({ key: 'CANCEL' })).toBe('Cancel'));

    render(
      <I18nContextProvider appLanguage="sv">
        <></>
      </I18nContextProvider>
    );

    await waitFor(() => expect(translate({ key: 'CANCEL' })).toBe('Avbryt'));
  });
});
