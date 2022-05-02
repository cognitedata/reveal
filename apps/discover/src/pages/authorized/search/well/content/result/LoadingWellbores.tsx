import { useTranslation } from 'react-i18next';

import { LoadingSpinner } from 'components/Loading';

import { LOADING_TEXT } from '../constants';

import { Message } from './WellBoreResultTable';

export const LoadingWellbores = () => {
  const { t } = useTranslation('WellData');
  return (
    <Message>
      <LoadingSpinner isLoading message={t(LOADING_TEXT)} />
    </Message>
  );
};

export default LoadingWellbores;
