import React from 'react';
import { Button } from '@cognite/cogs.js';
import { useTranslation } from 'react-i18next';

interface Props {
  handleClick: () => void;
}
export const LogoutButton: React.FC<Props> = ({ handleClick }) => {
  const { t } = useTranslation();

  return (
    <Button
      type="secondary"
      icon="LogOut"
      role="button"
      aria-label="Logout"
      onClick={handleClick}
    >
      {t('Logout')}
    </Button>
  );
};
