import React from 'react';
import { render, waitFor } from '@testing-library/react';

import { useTranslation, I18nContainer } from './Provider';

describe('Provider', () => {
  it('Renders without exploding', async () => {
    const Test = () => {
      const { t } = useTranslation();

      return <div>TRANS: {t('test_string', 'COMPLETE')}</div>;
    };

    const Wrapped = () => {
      return (
        <I18nContainer>
          <Test />
        </I18nContainer>
      );
    };

    const { getByText } = render(<Wrapped />);
    await waitFor(() => getByText('TRANS: COMPLETE'));
  });
});
