import * as React from 'react';

import styled from 'styled-components/macro';

import { useFilterBarIsOpen } from 'modules/sidebar/selectors';
import { FlexColumn } from 'styles/layout';

import { SearchMenu } from '../SearchMenu';

import { getFilterSizeStateInPX } from './constants';
import { FilterBar } from './FilterBar';

const SideBarContent = styled(FlexColumn)`
  max-width: ${(props: { isOpen: boolean }) =>
    `${getFilterSizeStateInPX(props.isOpen)}`};
`;

export const SideBar: React.FC = React.memo(() => {
  const isOpen = useFilterBarIsOpen();

  return (
    <SideBarContent data-testid="side-bar" isOpen={isOpen}>
      <SearchMenu />
      <FilterBar />
    </SideBarContent>
  );
});
