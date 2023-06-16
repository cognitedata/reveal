import React, { PropsWithChildren } from 'react';

import styled, { css } from 'styled-components';

import { SearchResultsBody } from './components/SearchResultsBody';
import { SearchResultsFooter } from './components/SearchResultsFooter';
import { SearchResultsHeader } from './components/SearchResultsHeader';
import { SearchResultsItem } from './components/SearchResultsItem';

export const SearchResults = ({
  children,
  empty,
}: PropsWithChildren<{ empty?: boolean }>) => {
  return (
    <Container empty={empty}>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, { empty } as any);
        }
        return null;
      })}
    </Container>
  );
};

SearchResults.Header = SearchResultsHeader;
SearchResults.Body = SearchResultsBody;
SearchResults.Item = SearchResultsItem;
SearchResults.Footer = SearchResultsFooter;

const Container = styled.div<{ empty?: boolean }>`
  border-radius: 10px;
  margin-bottom: 16px;

  ${(props) => {
    if (!props.empty) {
      return css`
        /* background-color: white; */

        /* box-shadow: 0px 1px 8px rgba(79, 82, 104, 0.06),
          0px 1px 1px rgba(79, 82, 104, 0.1); */
      `;
    }
  }}
`;
