import React, { useState } from 'react';

import { CollapsablePanel } from '@cognite/cogs.js';

import { BaseButton } from 'components/Buttons/BaseButton';
import { SearchQueryInfoPanel } from 'pages/authorized/search/search/SearchQueryInfoPanel';
import { FlexGrow, FlexRow } from 'styles/layout';

import {
  FlexContainer,
  Header,
  HeaderSearchWrapper,
  IconSeparator,
  ResultsContainer,
} from './elements';
import {
  RelatedDocumentDateRange,
  RelatedDocumentSource,
  RelatedDocumentFileType,
} from './filters';
import { RelatedDocumentAppliedFilters } from './RelatedDocumentAppliedFilters';
import { RelatedDocumentOptionPanel } from './RelatedDocumentOptionPanel';
import { RelatedDocumentSearch } from './RelatedDocumentSearch';
import { RelatedDocumentStats } from './RelatedDocumentStats';
import { RelatedDocumentTable } from './RelatedDocumentTable';
import RelatedDocumentTypeFilter from './RelatedDocumentTypeFilter';

export const RelatedDocument: React.FC = () => {
  const [showDocTypeFilter, setShowDocTypeFilter] = useState<boolean>(true);

  return (
    <CollapsablePanel
      sidePanelRight={<RelatedDocumentTypeFilter />}
      sidePanelRightVisible={showDocTypeFilter}
      sidePanelLeftWidth={268}
    >
      <ResultsContainer fullWidth={!showDocTypeFilter}>
        <Header>
          <FlexRow>
            <RelatedDocumentStats />
            <FlexGrow />
            <RelatedDocumentOptionPanel />
            <IconSeparator />
            <BaseButton
              type="secondary"
              aria-label="Panel Toggle"
              icon={showDocTypeFilter ? 'PanelRight' : 'PanelLeft'}
              onClick={() => {
                setShowDocTypeFilter((state) => !state);
              }}
            />
          </FlexRow>

          <HeaderSearchWrapper>
            <RelatedDocumentSearch />
            <SearchQueryInfoPanel />
            <IconSeparator />
            <FlexContainer>
              <RelatedDocumentFileType />
              <RelatedDocumentDateRange />
              <RelatedDocumentSource />
            </FlexContainer>
          </HeaderSearchWrapper>

          {/* Show the applied filters below the search bar */}
          <RelatedDocumentAppliedFilters showClearTag />
        </Header>

        <RelatedDocumentTable />
      </ResultsContainer>
    </CollapsablePanel>
  );
};

export default RelatedDocument;
