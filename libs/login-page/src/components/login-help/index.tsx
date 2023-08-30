import React from 'react';

import { Button, Dropdown, Menu } from '@cognite/cogs.js';

import { useTranslation } from '../../common/i18n';

type LoginHelpProps = {
  onClickDocs: () => void;
  onClickChat: () => void;
};

const LoginHelp = (props: LoginHelpProps): JSX.Element => {
  const { onClickDocs, onClickChat } = props;
  const { t } = useTranslation();

  return (
    <Dropdown
      openOnHover
      content={
        <Menu>
          <Menu.Item
            iconPlacement="left"
            icon="Documentation"
            onClick={onClickDocs}
          >
            {t('cdf-docs')}
          </Menu.Item>
          <Menu.Item iconPlacement="left" icon="Feedback" onClick={onClickChat}>
            {t('contact-support-chat')}
          </Menu.Item>
        </Menu>
      }
    >
      <Button
        type="ghost-accent"
        icon="ChevronDown"
        iconPlacement="right"
        style={{ cursor: 'default' }}
      >
        {t('help')}
      </Button>
    </Dropdown>
  );
};

export default LoginHelp;
