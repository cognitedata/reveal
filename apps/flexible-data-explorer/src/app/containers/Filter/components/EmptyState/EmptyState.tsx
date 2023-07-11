import * as React from 'react';

import styled from 'styled-components/macro';

import { EmptyState as CogsEmptyState } from '@cognite/cogs.js';

import { useTranslation } from '../../../../hooks/useTranslation';

export const EmptyState: React.FC = () => {
  const { t } = useTranslation();

  return (
    <Wrapper>
      <CogsEmptyState
        illustration="EmptyStateSearchSad"
        title={t('FILTER_EMPTY_STATE_TITLE')}
        body={t('FILTER_EMPTY_STATE_BODY')}
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
