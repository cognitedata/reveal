import { useState } from 'react';

import styled from 'styled-components';

import { Dropdown } from 'antd';

import { Icon, Button, Colors } from '@cognite/cogs.js';

import { useTranslation } from '../../../i18n';
import { useGlobalSearch } from '../../utils/hooks';
import { trackUsage } from '../../utils/metrics';

import { GlobalSearchMenu, SearchResourceType } from './GlobalSearchMenu';

export default function GlobalSearch() {
  const { t } = useTranslation();
  const {
    query,
    debouncedQuery,
    isSearchDropdownVisible,
    setQuery,
    setIsSearchDropdownVisible,
  } = useGlobalSearch();

  const [appliedFilters = [], setAppliedFilters] = useState<
    SearchResourceType[]
  >([]);

  return (
    <StyledSearchContainer>
      <Dropdown
        trigger={['click']}
        placement="bottomRight"
        visible={isSearchDropdownVisible}
        onVisibleChange={setIsSearchDropdownVisible}
        overlay={
          <GlobalSearchMenu
            onClose={() => {
              setAppliedFilters([]);
              setIsSearchDropdownVisible(false);
            }}
            query={debouncedQuery}
            appliedFilters={appliedFilters}
            setAppliedFilters={setAppliedFilters}
          />
        }
      >
        <StyledSearchContent>
          <StyledSearchIcon type="Search" />
          <StyledSearch
            placeholder={t('search')}
            onChange={(e) => {
              const searchText = e?.target?.value;
              trackUsage({ e: 'data.catalog.search.click', searchText });
              setQuery(searchText);
            }}
            value={query}
            data-testid="global-search-input"
          />
          {query.length > 0 && (
            <StyledClearButton
              icon="ClearAll"
              onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                setQuery('');
                setAppliedFilters([]);
                e.stopPropagation();
              }}
              size="small"
              type="ghost"
              inverted
              data-testid="global-search-clear-input"
            />
          )}
        </StyledSearchContent>
      </Dropdown>
    </StyledSearchContainer>
  );
}

const StyledSearchIcon = styled(Icon)`
  color: ${Colors['text-icon--medium--inverted']};
  position: absolute;
  left: 12px;
  top: 10px;
`;

const StyledClearButton = styled(Button)`
  position: absolute;
  right: 4px;
  top: 4px;
`;

const StyledSearch = styled.input`
  background-color: ${Colors['surface--action--muted--default--inverted']};
  border: 2px solid transparent;
  border-radius: 6px;
  color: ${Colors['text-icon--strong--inverted']};
  font-size: 14px;
  height: 100%;
  padding: 7px 36px 8px 40px;
  transition: var(--cogs-transition-time-fast) all;
  width: 100%;
  ::placeholder {
    color: ${Colors['text-icon--medium--inverted']};
  }
`;

const StyledSearchContainer = styled.div`
  display: flex;
  flex: 1;
  justify-content: flex-end;
  margin: 0 8px;
`;

const StyledSearchContent = styled.div`
  flex: 1;
  height: 100%;
  max-width: 300px;
  position: relative;
  :hover {
    ${StyledSearch} {
      background-color: ${Colors['surface--action-muted--hover--inverted']};
      border-color: ${Colors['border--muted--inverted']};
    }
  }
  :focus-within {
    ${StyledSearch} {
      background-color: ${Colors['surface--action-muted--pressed--inverted']};
      border-color: ${Colors['border--muted--inverted']};
      outline: none;
    }
    ${StyledSearchIcon} {
      color: ${Colors['text-icon--interactive--default--inverted']};
    }
  }

  @media (max-width: 1280px) {
    max-width: 100%;
    min-width: 300px;
  }
`;
