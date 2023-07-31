import { useWellSearchResultQuery } from 'domain/wells/well/internal/queries/useWellSearchResultQuery';

import * as React from 'react';

import isEmpty from 'lodash/isEmpty';

import { ContentWrapper } from 'pages/authorized/search/elements';

import { WellResultTable } from './result';
import { WellSearchFrontPage } from './WellSearchFrontPage';

export const WellContent: React.FC = () => {
  const { data, isLoading } = useWellSearchResultQuery();

  const wells = data ? data.wells : [];

  if (!wells || isEmpty(wells) || isLoading) {
    return (
      <ContentWrapper>
        <WellSearchFrontPage />
      </ContentWrapper>
    );
  }

  return (
    <ContentWrapper>
      <WellResultTable />
    </ContentWrapper>
  );
};

export default WellContent;
