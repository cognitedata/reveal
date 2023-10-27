import * as React from 'react';

import { useTranslation } from '@fdx/shared/hooks/useTranslation';
import styled from 'styled-components/macro';

import { EmptyState as CogsEmptyState } from '@cognite/cogs.js';

export const ErrorState: React.FC = () => {
  const { t } = useTranslation();

  return (
    <Wrapper>
      <CogsEmptyState
        illustration="WrongStopNo"
        illustrationColor="red"
        title={t('FILTER_ERROR_STATE_TITLE')}
        body={t('FILTER_ERROR_STATE_BODY')}
        href=""
        target="_self"
      />
    </Wrapper>
  );
};

const Wrapper = styled.div`
  display: flex;
  width: 100%;
  justify-content: center;
`;
