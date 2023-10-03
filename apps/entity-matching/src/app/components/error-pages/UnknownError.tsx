import styled from 'styled-components';

import { Colors, Icon, Title } from '@cognite/cogs.js';
import { CogniteError } from '@cognite/sdk';

import { useTranslation } from '../../common';

import {
  ErrorInfo,
  InfoWrapper,
  Instructions,
  ErrorPageContent,
} from './styled-components';

type UnknownErrorPageProps = {
  error: CogniteError;
};

const UnknownErrorPage = ({ error }: UnknownErrorPageProps) => {
  const { t } = useTranslation();

  return (
    <ErrorPageContent>
      <Error>
        <Icon type="ErrorFilled" />
        <span>{t('unknown-error-title')}</span>
      </Error>
      <Instructions>
        <div>{error.message}</div>
        <div>{t('unknown-error-detail')}</div>
      </Instructions>
      <InfoWrapper>
        <ErrorInfo>
          <p>
            <strong>{t('unknown-error-request-id')} </strong>
            {error.requestId}
          </p>
          <p>
            <strong>{t('unknown-error-timestamp')} </strong>
            {Date.now()}
          </p>
        </ErrorInfo>
      </InfoWrapper>
    </ErrorPageContent>
  );
};

const Error = styled(Title).attrs({ level: 5 })`
  color: ${Colors['text-icon--status-critical']};
  display: flex;
  align-items: center;
  gap: 4px;
  margin-bottom: 8px;
`;

export default UnknownErrorPage;
