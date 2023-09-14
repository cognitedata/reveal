import { PropsWithChildren } from 'react';

import styled from 'styled-components';

import { SearchResultsBody } from './components/SearchResultsBody';
import { SearchResultsFooter } from './components/SearchResultsFooter';
import { SearchResultsHeader } from './components/SearchResultsHeader';
import { SearchResultsItem } from './components/SearchResultsItem';

export const SearchResults = ({
  children,
  empty,
}: PropsWithChildren<{ empty?: boolean }>) => {
  if (empty) {
    return null;
  }

  return <Container>{children}</Container>;
};

SearchResults.Header = SearchResultsHeader;
SearchResults.Body = SearchResultsBody;
SearchResults.Item = SearchResultsItem;
SearchResults.Footer = SearchResultsFooter;

const Container = styled.div`
  border-radius: 10px;
`;
