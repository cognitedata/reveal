import { useTranslation } from 'react-i18next';

import { CircularProgress } from '@material-ui/core';

import { LOADING_TEXT } from '../constants';

import { Message } from './WellBoreResultTable';

const iconStyle = { width: 12, height: 12, marginRight: 12 };

export const LoadingWellbores = () => {
  const { t } = useTranslation('WellData');
  return (
    <Message>
      <CircularProgress style={iconStyle} />
      {t(LOADING_TEXT)}
    </Message>
  );
};

export default LoadingWellbores;
