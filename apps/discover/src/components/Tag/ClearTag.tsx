import React from 'react';
import { useTranslation } from 'react-i18next';

import { CLEAR_ALL_TEXT } from 'components/TableEmpty/constants';

import { ClearTagWrapper } from './elements';

export interface ClearTagProps {
  onClick: () => void;
}
export const ClearTag: React.FC<ClearTagProps> = ({ onClick }) => {
  const { t } = useTranslation();

  return (
    <ClearTagWrapper closable onClick={onClick}>
      {t(CLEAR_ALL_TEXT)}
    </ClearTagWrapper>
  );
};
