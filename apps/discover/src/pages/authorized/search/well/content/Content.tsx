import React from 'react';

import isEmpty from 'lodash/isEmpty';

import { useWellSearchResultQuery } from 'modules/wellSearch/hooks/useWellSearchResultQuery';
import { ContentWrapper } from 'pages/authorized/search/elements';

import { WellResultTable } from './result';
import { WellSearchFrontPage } from './WellSearchFrontPage';

export const WellContent: React.FC = () => {
  const { data: wells, isLoading } = useWellSearchResultQuery();

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
