import { ComponentProps } from 'react';
import { Button } from '@cognite/cogs.js';
import { useTranslation } from 'react-i18next';

export const LogoutButton = (props: ComponentProps<typeof Button>) => {
  const { t } = useTranslation();

  return (
    <LogoutButtonWithoutTranslation {...props}>
      {props.children ?? t('Logout')}
    </LogoutButtonWithoutTranslation>
  );
};

export const LogoutButtonWithoutTranslation = (
  props: ComponentProps<typeof Button>
) => (
  <Button
    type="secondary"
    icon="Logout"
    role="button"
    aria-label="Logout"
    {...props}
  >
    {props.children ?? 'Logout'}
  </Button>
);
