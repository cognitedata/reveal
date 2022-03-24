import React, { useState } from 'react';

import { CollapsablePanel } from '@cognite/cogs.js';

import { BaseButton } from 'components/buttons/BaseButton';
import { useAnythingHasSearched } from 'hooks/useAnythingHasSearched';
import { useRelatedDocumentDataStats } from 'modules/wellSearch/selectors/sequence/RelatedDocuments/useRelatedDocument';
import { SearchBreadcrumb } from 'pages/authorized/search/common/searchResult';
import { SearchQueryInfoPanel } from 'pages/authorized/search/search/SearchQueryInfoPanel';
import { RelatedDocumentFilters } from 'pages/authorized/search/search/SideBar/filters/RelatedDocumentFilters';
import { FlexGrow, FlexRow } from 'styles/layout';

import {
  FlexContainer,
  Header,
  HeaderSearchWrapper,
  IconSeparator,
  ResultsContainer,
} from './elements';
import { RelatedDocumentAppliedFilters } from './RelatedDocumentAppliedFilters';
import { RelatedDocumentOptionPanel } from './RelatedDocumentOptionPanel';
import { RelatedDocumentSearch } from './RelatedDocumentSearch';
import { RelatedDocumentTable } from './RelatedDocumentTable';
import RelatedDocumentTypeFilter from './RelatedDocumentTypeFilter';

export const RelatedDocument: React.FC = () => {
  const anythingHasSearched = useAnythingHasSearched();
  const { total, documentInformation } = useRelatedDocumentDataStats();
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
            <SearchBreadcrumb
              stats={[
                {
                  currentHits: total,
                  info: documentInformation,
                },
              ]}
            />
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
            {anythingHasSearched && (
              <>
                <IconSeparator />
                <FlexContainer>
                  <RelatedDocumentFilters />
                </FlexContainer>
              </>
            )}
          </HeaderSearchWrapper>

          {/* Show the applied filters below the search bar when result count is >0 (otherwise, show in empty state) */}
          {total > 0 && <RelatedDocumentAppliedFilters showClearTag />}
        </Header>

        <RelatedDocumentTable />
      </ResultsContainer>
    </CollapsablePanel>
  );
};

export default RelatedDocument;
