import React from 'react';
import { Icon } from '@cognite/cogs.js';
import { useTranslation } from '@cognite/react-i18n';

import { StyledLoginTip } from './elements';

type Props = {
  helpLink: string;
};

const LoginTip = ({ helpLink }: Props) => {
  const { t } = useTranslation('TenantSelector');
  return (
    <StyledLoginTip>
      <div className="login-tip-wrapper">
        <a
          className="external-link"
          href={helpLink}
          target="blank"
          rel="noopener noreferrer"
        >
          {t('loggin-trouble_link', { defaultValue: 'Trouble logging in?' })}
        </a>
        <span className="separator" />
        <a
          className="external-link"
          href={helpLink}
          target="blank"
          rel="noopener noreferrer"
        >
          <span>
            {t('loggin-trouble_link-with-icon', { defaultValue: 'Help' })}
          </span>{' '}
          <Icon type="ExternalLink" />
        </a>
      </div>
    </StyledLoginTip>
  );
};

export default LoginTip;
