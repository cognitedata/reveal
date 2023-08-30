import React from 'react';

import styled from 'styled-components';

import { Body, Colors, Flex } from '@cognite/cogs.js';

import { useTranslation } from '../../../i18n';

type NoSearchResultProps = {
  searchText: string;
};

const NoSearchResults = ({ searchText }: NoSearchResultProps) => {
  const { t } = useTranslation();
  return (
    <div style={{ padding: 12 }}>
      <StyledNoResults direction="column" alignItems="center">
        <Flex
          justifyContent="center"
          alignItems="center"
          direction="column"
          style={{ padding: '32px 12px' }}
        >
          <Body level={2} strong>
            {t('no-search-results-for-text', { searchText })}
          </Body>
          <Body level={3} className="mute">
            {t('no-search-results-desc')}
          </Body>
        </Flex>
      </StyledNoResults>
    </div>
  );
};

const StyledNoResults = styled(Flex)`
  background: #fafafa;
  border-radius: 4px;
  .mute {
    color: rgba(0, 0, 0, 0.7);
  }
  .browse-btn {
    min-width: 300px;
    background: ${Colors['decorative--grayscale--white']};
  }
  .data-catalog-link-container {
    padding: 0 16px 16px 16px;
  }
`;

export default NoSearchResults;
