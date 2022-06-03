import * as React from 'react';
import { Body } from '@cognite/cogs.js';
import { Alert } from 'antd';
import { t } from 'i18next';
import styled from 'styled-components';

export const OIDCConfigurationWarning = () => {
  return (
    <StyledAlertContainer>
      <Body level={2}>
        <Alert
          type="warning"
          message={t(
            'chaging-oidc-settings-could-have-unintended-consequences'
          )}
        />
      </Body>
    </StyledAlertContainer>
  );
};

const StyledAlertContainer = styled.div`
  max-width: 640px;
  margin-bottom: 16px;
`;
