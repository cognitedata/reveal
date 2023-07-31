import * as React from 'react';

import { SearchResultContainer } from 'pages/authorized/search/elements';

import { SearchWrapper } from '../elements';

import WellContent from './content';

export const WellSearch: React.FC = () => (
  <SearchWrapper>
    <SearchResultContainer>
      <WellContent />
    </SearchResultContainer>
  </SearchWrapper>
);

export default WellSearch;
