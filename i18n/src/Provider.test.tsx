import React from 'react';
import { render, screen } from '@testing-library/react';

import { I18nContainer } from './Provider';
import { useTranslation } from './i18n';

describe('Provider', () => {
  it('Renders without exploding', async () => {
    const Test = () => {
      const { t } = useTranslation();

      return <div>TRANS: {t('test_string', { defaultValue: 'COMPLETE' })}</div>;
    };

    const Wrapped = () => {
      return (
        <I18nContainer>
          <Test />
        </I18nContainer>
      );
    };

    render(<Wrapped />);
    expect(await screen.findByText('TRANS: COMPLETE')).toBeTruthy();
  });
});
