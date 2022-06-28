import { AuthorItem } from 'domain/documents/internal/types';
import { useDocumentAuthorsQuery } from 'domain/documents/service/queries/useDocumentAuthorsQuery';
import { useSetDocumentFilters } from 'domain/savedSearches/internal/hooks/useSetDocumentFilters';

import { memo, useState } from 'react';
import { OptionProps, OptionTypeBase } from 'react-select';

import { Checkbox, Flex, Label, Select } from '@cognite/cogs.js';

import { renderTitleAboveSelectComponent } from 'components/Filters/MultiSelect/commonMultiSelectComponents';
import { useDeepEffect } from 'hooks/useDeep';
import { useFilterAppliedFilters } from 'modules/sidebar/selectors';
import { FilterPayload } from 'pages/authorized/search/search/SideBar/types';
import { FlexGrow } from 'styles/layout';

import { FilterCollapse } from '../../components/FilterCollapse';

interface AuthorOptionType extends OptionProps<OptionTypeBase, boolean> {
  data: AuthorItem;
}

const AuthorOption = ({
  innerProps,
  isDisabled,
  data,
  isSelected,
}: AuthorOptionType) => {
  const { value, documentCount } = data;

  if (isDisabled) {
    return null;
  }

  return (
    <Flex
      {...innerProps}
      style={{ padding: '5px' }}
      data-testid="filter-option-label"
    >
      <div>
        <Checkbox name={innerProps.id} checked={isSelected} />
      </div>
      <div>{value}</div>
      <FlexGrow />
      <Label size="small">{documentCount}</Label>
    </Flex>
  );
};

export const AuthorFilter = memo(({ title, ...rest }: FilterPayload) => {
  const docQueryFacetType = 'authors';
  const appliedFilters = useFilterAppliedFilters();
  const currentFilterStateFacets =
    appliedFilters.documents[docQueryFacetType] || [];

  const allAuthors = useDocumentAuthorsQuery();

  const [value, setValue] = useState<Array<AuthorItem>>([]);

  useDeepEffect(() => {
    const selectedAuthors = allAuthors.filter((item: AuthorItem) => {
      return currentFilterStateFacets.includes(item.value);
    });
    setValue(selectedAuthors);
  }, [currentFilterStateFacets, allAuthors]);

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
        {renderTitleAboveSelectComponent(title, 'top')}
        <Select
          components={{ Option: AuthorOption }}
          menuPlacement="bottom"
          value={value}
          options={allAuthors}
          showCheckbox
          onChange={onChange}
          isMulti
          menuIsOpen
        />
      </div>
    </FilterCollapse.Panel>
  );
});
