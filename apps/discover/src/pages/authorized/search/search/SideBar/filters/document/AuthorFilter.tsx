import { getAuthorsFilter } from 'domain/documents/internal/transformers/getAuthorsFilter';
import { AuthorItem } from 'domain/documents/internal/types';
import { useDocumentAuthorsQuery } from 'domain/documents/service/queries/useDocumentAuthorsQuery';
import { useSetDocumentFilters } from 'domain/savedSearches/internal/hooks/useSetDocumentFilters';

import React, { useCallback, useState } from 'react';
import {
  OptionProps,
  OptionTypeBase,
  components,
  MenuListComponentProps,
  GroupTypeBase,
} from 'react-select';

import filter from 'lodash/filter';

import { Select, Menu, Icon } from '@cognite/cogs.js';

import { MultiSelectContainer } from 'components/Filters/MultiSelect/elements';
import { EMPTY_ARRAY, NOT_AVAILABLE } from 'constants/empty';
import { useDeepEffect } from 'hooks/useDeep';
import { useFilterAppliedFilters } from 'modules/sidebar/selectors';
import { FilterPayload } from 'pages/authorized/search/search/SideBar/types';

import { FilterCollapse } from '../../components/FilterCollapse';

const MAX_OPTIONS = 10;

type MenuListProps = MenuListComponentProps<
  AuthorItem,
  boolean,
  GroupTypeBase<AuthorItem>
>;

interface AuthorOptionType extends OptionProps<OptionTypeBase, boolean> {
  data: AuthorItem;
}

const Option = ({ data, isSelected, ...props }: AuthorOptionType) => {
  return (
    <components.Option {...props} data={data} isSelected={isSelected}>
      <div
        style={{
          overflow: 'hidden',
          whiteSpace: 'nowrap',
          textOverflow: 'ellipsis',
        }}
      >
        {data.value.trim() !== '' ? data.value : NOT_AVAILABLE}
      </div>
      {isSelected && <Icon style={{ flexShrink: 0 }} type="Checkmark" />}
    </components.Option>
  );
};

export const AuthorFilter = React.memo(({ title, ...rest }: FilterPayload) => {
  const docQueryFacetType = 'authors';
  const appliedFilters = useFilterAppliedFilters();
  const currentFilterStateFacets =
    appliedFilters.documents[docQueryFacetType] || [];

  const { data, isLoading } = useDocumentAuthorsQuery();

  const [filteredAuthors, setFilteredAuthors] = useState<Array<AuthorItem>>([]);
  const [value, setValue] = useState<Array<AuthorItem>>([]);

  const allAuthors = getAuthorsFilter(data || EMPTY_ARRAY);

  useDeepEffect(() => {
    setFilteredAuthors(allAuthors);
  }, [allAuthors]);

  useDeepEffect(() => {
    const selectedAuthors = allAuthors.filter((item: AuthorItem) => {
      return currentFilterStateFacets.includes(item.value);
    });
    setValue(selectedAuthors);
  }, [currentFilterStateFacets, allAuthors.length]);

  const setDocumentFilters = useSetDocumentFilters();

  const onInputChange = (inputValue: string) => {
    const results = filter(allAuthors, ({ value }) => {
      return value.indexOf(inputValue) > -1;
    });
    setFilteredAuthors(results);
  };

  const onChange = (authorData: AuthorItem[]) => {
    setValue(authorData);
    setDocumentFilters({
      ...appliedFilters.documents,
      [docQueryFacetType]: authorData.map((item: any) => item.value),
    });
  };

  const MenuList = useCallback(
    ({ children, ...props }: MenuListProps) => {
      return (
        <components.MenuList {...props}>
          {children}
          {filteredAuthors.length > MAX_OPTIONS && (
            <Menu.Footer>
              and {filteredAuthors.length - MAX_OPTIONS} more...
            </Menu.Footer>
          )}
        </components.MenuList>
      );
    },
    [filteredAuthors.length]
  );

  return (
    <FilterCollapse.Panel title={title} showApplyButton={false} {...rest}>
      <div data-testid="filter-item-wrapper" aria-label={`${title} list`}>
        <MultiSelectContainer>
          <Select
            options={filteredAuthors.slice(0, MAX_OPTIONS)}
            isMulti
            showSelectedItemCount
            components={{
              MenuList,
              Option,
            }}
            maxOptions={MAX_OPTIONS}
            onInputChange={onInputChange}
            onChange={onChange}
            value={value}
            isLoading={isLoading}
          />
        </MultiSelectContainer>
      </div>
    </FilterCollapse.Panel>
  );
});
