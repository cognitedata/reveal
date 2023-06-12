import * as React from 'react';

import styled from 'styled-components/macro';

import { EmptyState as CogsEmptyState } from '@cognite/cogs.js';

import { translationKeys } from '../../../../../common';
import { useTranslation } from '../../../../../hooks/useTranslation';

export const EmptyState: React.FC = () => {
  const { t } = useTranslation();

  return (
    <Wrapper>
      <CogsEmptyState
        illustration="EmptyStateSearchSad"
        title={t(translationKeys.filterEmptyStateTitle, 'No options')}
        body={t(
          translationKeys.filterEmptyStateSubtitle,
          'Try changing your search phrase'
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
