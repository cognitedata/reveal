import React from 'react';

import { Icon } from '@cognite/cogs.js';
import styled from 'styled-components';
import { Trans, useTranslation } from 'common/i18n';

const NoAccessPage = (): JSX.Element => {
  const { t } = useTranslation();

  return (
    <NoAccessContent>
      <Warning>
        <Icon type="WarningFilled" />
        <div>{t('error-page-no-access-title')}</div>
      </Warning>
      <Instructions>{t('error-page-no-access-instructions')}</Instructions>
      <AccessInfoWrapper className="z-4">
        <AccessInfo>
          <p>
            <Trans i18nKey="error-page-no-access-required-for-any-feature" />
          </p>
          <p>
            <Trans i18nKey="error-page-no-access-required-for-this-feature" />
          </p>
        </AccessInfo>
      </AccessInfoWrapper>
    </NoAccessContent>
  );
};

export default NoAccessPage;

const NoAccessContent = styled.div`
  margin: 80px 50px;
`;

const Warning = styled.div`
  font-size: 16px;
  color: var(--cogs-yellow-1);
  font-weight: bold;
  margin-bottom: 14px;
  display: flex;
  align-items: center;
  svg {
    margin-right: 1em;
  }
`;

const Instructions = styled.div`
  margin-bottom: 28px;
`;

const AccessInfoWrapper = styled.div`
  background-color: white;
  padding: 14px;
  margin: 14px;
  border-radius: 4px;
`;

const AccessInfo = styled.div`
  color: var(--cogs-text-color);
  padding: 7px 14px;
  width: 100%;
  p:last-child {
    margin-bottom: 0;
  }
  strong {
    font-weight: bold;
  }
`;
