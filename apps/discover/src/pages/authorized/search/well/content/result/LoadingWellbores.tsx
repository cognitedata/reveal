import { LoadingSpinner } from 'components/Loading';
import { useTranslation } from 'hooks/useTranslation';

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
