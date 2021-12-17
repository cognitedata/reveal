import * as React from 'react';

import styled from 'styled-components/macro';

import { Badge } from '@cognite/cogs.js';

import { formatBigNumbersWithSuffix } from '_helpers/number';
import { BetaSymbol } from 'pages/authorized/elements';
import { sizes } from 'styles/layout';

const TabPaneBadgeWrapper = styled.div`
  height: 20px !important;
  margin-left: ${sizes.extraSmall};

  & > span[class='cogs-badge'] {
    padding: 2px 8px !important;
  }
`;

interface SearchTabProps {
  text: string;
  count?: number;
  displayBetaSymbol?: boolean;
  displayCount?: boolean;
}

export const SearchTab: React.FC<SearchTabProps> = ({
  text,
  count,
  displayBetaSymbol,
  displayCount,
}) => {
  return (
    <>
      <span>{text}</span>
      {displayBetaSymbol && <BetaSymbol />}
      {displayCount && (
        <TabPaneBadgeWrapper>
          <Badge
            text={formatBigNumbersWithSuffix(count || 0).toString()}
            size={12}
          />
        </TabPaneBadgeWrapper>
      )}
    </>
  );
};
