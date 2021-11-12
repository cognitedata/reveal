import { useTranslation } from 'react-i18next';

import { LoadingSpinner } from 'components/loading';

import { LOADING_TEXT } from '../constants';

import { Message } from './WellBoreResultTable';

export const LoadingWellbores = () => {
  const { t } = useTranslation('WellData');
  console.log('loader on');
  return (
    <Message>
      <LoadingSpinner isLoading />
      {t(LOADING_TEXT)}
    </Message>
  );
};

export default LoadingWellbores;
