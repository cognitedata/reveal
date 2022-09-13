import { getAuthorsFilter } from 'domain/documents/internal/transformers/getAuthorsFilter';
import { AuthorItem } from 'domain/documents/internal/types';
import { useDocumentAuthorsQuery } from 'domain/documents/service/queries/useDocumentAuthorsQuery';
import { useSetDocumentFilters } from 'domain/savedSearches/internal/hooks/useSetDocumentFilters';

import { memo, useState } from 'react';
import { OptionProps, OptionTypeBase, components } from 'react-select';

import { Select, Menu, Icon } from '@cognite/cogs.js';

import { MultiSelectContainer } from 'components/Filters/MultiSelect/elements';
import { EMPTY_ARRAY, NOT_AVAILABLE } from 'constants/empty';
import { useDeepEffect } from 'hooks/useDeep';
import { useFilterAppliedFilters } from 'modules/sidebar/selectors';
import { FilterPayload } from 'pages/authorized/search/search/SideBar/types';

import { FilterCollapse } from '../../components/FilterCollapse';

interface AuthorOptionType extends OptionProps<OptionTypeBase, boolean> {
  data: AuthorItem;
}

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const MenuList = ({ children, ...props }) => {
  return (
    <>
      {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
      {/* @ts-ignore */}
      <components.MenuList {...props}>
        {
          Array.isArray(children)
            ? children.slice(0, props.selectProps?.maxOptions) /* Options */
            : children /* NoOptionsLabel */
        }
        {children?.length > props.selectProps?.maxOptions && (
          <Menu.Footer>
            and {children.length - (props.selectProps?.maxOptions || 0)} more...
          </Menu.Footer>
        )}
      </components.MenuList>
    </>
  );
};

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

export const AuthorFilter = memo(({ title, ...rest }: FilterPayload) => {
  const docQueryFacetType = 'authors';
  const appliedFilters = useFilterAppliedFilters();
  const currentFilterStateFacets =
    appliedFilters.documents[docQueryFacetType] || [];

  const { data, isLoading } = useDocumentAuthorsQuery();

  const [value, setValue] = useState<Array<AuthorItem>>([]);

  const allAuthors = getAuthorsFilter(data || EMPTY_ARRAY);

  useDeepEffect(() => {
    const selectedAuthors = allAuthors.filter((item: AuthorItem) => {
      return currentFilterStateFacets.includes(item.value);
    });
    setValue(selectedAuthors);
  }, [currentFilterStateFacets, allAuthors.length]);

  const setDocumentFilters = useSetDocumentFilters();

  const onChange = (authorData: AuthorItem[]) => {
    setValue(authorData);
    setDocumentFilters({
      ...appliedFilters.documents,
      [docQueryFacetType]: authorData.map((item: any) => item.value),
    });
  };

  return (
    <FilterCollapse.Panel title={title} showApplyButton={false} {...rest}>
      <div data-testid="filter-item-wrapper" aria-label={`${title} list`}>
        <MultiSelectContainer>
          <Select
            options={allAuthors}
            isMulti
            showSelectedItemCount
            components={{
              MenuList,
              Option,
            }}
            maxOptions={10}
            onChange={onChange}
            value={value}
            isLoading={isLoading}
          />
        </MultiSelectContainer>
      </div>
    </FilterCollapse.Panel>
  );
});
