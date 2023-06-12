import * as React from 'react';

import styled from 'styled-components/macro';

import { EmptyState as CogsEmptyState } from '@cognite/cogs.js';

import { translationKeys } from '../../../../../common';
import { useTranslation } from '../../../../../hooks/useTranslation';

export const ErrorState: React.FC = () => {
  const { t } = useTranslation();

  return (
    <Wrapper>
      <CogsEmptyState
        illustration="WrongStopNo"
        illustrationColor="red"
        title={t(translationKeys.filterEmptyStateTitle, 'Error')}
        body={t(
          translationKeys.filterEmptyStateSubtitle,
          'Sorry, we have encountered an error while loading filter options.'
        )}
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
