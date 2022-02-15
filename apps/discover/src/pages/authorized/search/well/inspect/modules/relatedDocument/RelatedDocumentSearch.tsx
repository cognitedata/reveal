import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import get from 'lodash/get';
import { documentFacetsStructure } from 'services/documents/structure';
import { useQuerySavedSearchRelatedDocuments } from 'services/savedSearches/useSavedSearchQuery';
import { isEnterPressed } from 'utils/general.helper';

import { Input } from '@cognite/cogs.js';

import { useSetRelatedDocumentFilters } from 'modules/filterData/hooks/useSetRelatedDocumentFilters';

import { InputContainer } from './elements';

export const RelatedDocumentSearch: React.FC = () => {
  const { data } = useQuerySavedSearchRelatedDocuments();
  const setRelatedDocumentFilters = useSetRelatedDocumentFilters();
  const facets = useMemo(() => get(data, 'filters.documents.facets'), [data]);
  const query = get(data, 'query');
  const { t } = useTranslation();
  const [searchValue, setSearchValue] = useState<string>('');

  useMemo(() => setSearchValue(query), [query]);

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (isEnterPressed(event)) {
      const target = event.target as HTMLInputElement;
      updateSearch(target.value);
    }
  };

  const updateSearch = (search: string) => {
    setRelatedDocumentFilters(facets || documentFacetsStructure, search);
  };

  const handleChanged = (e: React.ChangeEvent<HTMLInputElement>) =>
    setSearchValue(e.target.value);

  const clearable = useMemo(() => {
    return {
      labelText: searchValue,
      callback: () => {
        setSearchValue('');
        setRelatedDocumentFilters(facets || documentFacetsStructure, '');
      },
    };
  }, [searchValue, facets]);

  return (
    <InputContainer>
      <Input
        data-testid="input-search"
        value={searchValue || ''}
        placeholder={t('Search')}
        onKeyPress={handleKeyPress}
        onChange={handleChanged}
        icon="Search"
        iconPlacement="left"
        clearable={clearable}
        aria-label="Search"
        variant="noBorder"
      />
    </InputContainer>
  );
};
