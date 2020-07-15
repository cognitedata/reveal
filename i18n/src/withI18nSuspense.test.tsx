import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { TFunction, i18n } from 'i18next';
import { withTranslation } from 'react-i18next';

import { useTranslation } from './Provider';
import { withI18nSuspense } from './withI18nSuspense';

describe('withI18nSuspense', () => {
  it('Renders a functional component', async () => {
    const Test = () => {
      const { t } = useTranslation();

      return <div>TRANS: {t('test_string', 'COMPLETE')}</div>;
    };
    const Wrapped = withI18nSuspense(Test);

    const { getByText } = render(<Wrapped />);
    await waitFor(() => getByText('TRANS: COMPLETE'));
  });

  it('Renders a class-based component', async () => {
    class Test extends React.Component<{
      t: TFunction;
      i18n: i18n;
      tReady: boolean;
    }> {
      render() {
        const { t } = this.props;

        return <div>TRANS: {t('test_string', 'COMPLETE')}</div>;
      }
    }

    const WithT = withTranslation('Test')(Test);

    const Wrapped = withI18nSuspense(WithT);

    const { getByText } = render(<Wrapped />);
    await waitFor(() => getByText('TRANS: COMPLETE'));
  });
});
