import { render } from '@testing-library/react';

import SharedCdfUiI18nUtilsCdfUiI18nUtils from './shared-cdf-ui-i18n-utils-cdf-ui-i18n-utils';

describe('SharedCdfUiI18nUtilsCdfUiI18nUtils', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<SharedCdfUiI18nUtilsCdfUiI18nUtils />);
    expect(baseElement).toBeTruthy();
  });
});
