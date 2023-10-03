/* eslint-disable @cognite/require-t-function */
import styled from 'styled-components';

import { Colors, Icon, Title } from '@cognite/cogs.js';

import { Trans, useTranslation } from '../../common';

import {
  ErrorInfo,
  InfoWrapper,
  Instructions,
  ErrorPageContent,
} from './styled-components';

const NoAccessPage = () => {
  const { t } = useTranslation();

  return (
    <ErrorPageContent>
      <Warning>
        <Icon type="WarningFilled" />
        <span>{t('no-access-title')}</span>
      </Warning>
      <Instructions>{t('no-access-detail')}</Instructions>
      <InfoWrapper>
        <ErrorInfo>
          <p>
            <Trans i18nKey="no-access-info-entity-matching" />
          </p>
        </ErrorInfo>
      </InfoWrapper>
    </ErrorPageContent>
  );
};

const Warning = styled(Title).attrs({ level: 5 })`
  color: ${Colors['text-icon--status-warning']};
  display: flex;
  align-items: center;
  gap: 4px;
  margin-bottom: 8px;
`;

export default NoAccessPage;
