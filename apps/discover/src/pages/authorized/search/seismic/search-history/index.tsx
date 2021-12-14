import React, { useMemo } from 'react';

import { TS_FIX_ME } from 'core';
import {
  FilterIcon1,
  FilterIcon2,
  FilterIcon3,
  FilterIcon4,
  FilterIcon5,
  FilterIcon6,
  FilterIcon7,
  FilterIcon8,
  FilterIcon9,
  FilterIcon9Plus,
  BrokenImage,
  ImageSearch,
} from 'images/icons';
import styled from 'styled-components/macro';

import {
  Button,
  Dropdown,
  Icon as CogsIcon,
  Menu,
  Tooltip,
} from '@cognite/cogs.js';

import { shortDateTime } from '_helpers/date';
import { SliceCollection } from 'modules/seismicSearch/types';

const ButtonWrapper = styled.div`
  position: relative;
  bottom: 84px;
  left: 50%;

  button > span {
    margin-right: 0 !important;
  }

  .cogs-menu {
    margin-bottom: 16px;
  }
`;

const getIcon = (slices: TS_FIX_ME) => {
  switch (slices.length || 0) {
    case 1:
      return FilterIcon1;
    case 2:
      return FilterIcon2;
    case 3:
      return FilterIcon3;
    case 4:
      return FilterIcon4;
    case 5:
      return FilterIcon5;
    case 6:
      return FilterIcon6;
    case 7:
      return FilterIcon7;
    case 8:
      return FilterIcon8;
    case 9:
      return FilterIcon9;
    default:
      return FilterIcon9Plus;
  }
};
interface SearchHistoryProps {
  sliceSearches: SliceCollection;
  isVisible: boolean;
  handleOnItemClick: (item: TS_FIX_ME) => void;
}

const SearchHistory: React.FC<SearchHistoryProps> = ({
  handleOnItemClick,
  sliceSearches,
  isVisible,
}) => {
  const Icon = useMemo(() => {
    return getIcon(sliceSearches);
  }, [sliceSearches]);

  const isLoading = useMemo(() => {
    return sliceSearches.filter((s) => s.isLoading).length > 0;
  }, [sliceSearches]);

  const selectItem = (item: TS_FIX_ME) => {
    handleOnItemClick(item);
  };

  const renderContent = () => {
    return sliceSearches.map((slice: TS_FIX_ME) => (
      <Menu.Item key={slice.id} onClick={() => selectItem(slice)}>
        <Tooltip content={shortDateTime(slice.time)}>
          {
            // eslint-disable-next-line no-nested-ternary
            slice.isLoading ? (
              <>
                <ImageSearch />
                <CogsIcon
                  aria-label="Loading"
                  type="Loader"
                  style={{ position: 'absolute' }}
                />
              </>
            ) : slice.hasError ? (
              <BrokenImage />
            ) : (
              <ImageSearch />
            )
          }
        </Tooltip>
      </Menu.Item>
    ));
  };

  if (!isVisible) {
    return null;
  }

  return (
    <>
      <ButtonWrapper>
        <Dropdown openOnHover content={<Menu>{renderContent()}</Menu>}>
          <Button type="primary">
            {isLoading && <CogsIcon type="Loader" />}
            <Icon />
          </Button>
        </Dropdown>
      </ButtonWrapper>
    </>
  );
};

export default SearchHistory;
