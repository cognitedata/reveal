import React from 'react';
import { useParams } from 'react-router-dom';

import { createLink } from '@cognite/cdf-utilities';
import { A, Body, Colors } from '@cognite/cogs.js';
import styled from 'styled-components';

import { Trans } from 'common';

const SearchHelper = (): JSX.Element => {
  const { subAppPath } = useParams<{ subAppPath?: string }>();

  return (
    <StyledContainer>
      <Body level={2}>
        <Trans
          i18nKey="search-helper"
          components={{
            1: <A href={createLink(`/${subAppPath}/new`)} />,
            2: <A href="https://hub.cognite.com/" />,
          }}
        />
      </Body>
    </StyledContainer>
  );
};

const StyledContainer = styled.div`
  background-color: ${Colors['surface--status-neutral--muted--default']};
  border: 1px solid ${Colors['border--status-neutral--muted']};
  border-radius: 8px;
  padding: 16px;
  text-align: center;
`;

export default SearchHelper;
