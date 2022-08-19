import { documentFacetsStructure } from 'domain/documents/internal/types';

import React, { useState, useMemo, useEffect } from 'react';

import get from 'lodash/get';
import { isEnterPressed } from 'utils/general.helper';

import { Input } from '@cognite/cogs.js';

import { useTranslation } from 'hooks/useTranslation';
import { useSetRelatedDocumentsFilters } from 'modules/inspectTabs/hooks/useSetRelatedDocumentsFilters';
import { useRelatedDocumentsFilters } from 'modules/inspectTabs/selectors';

import { InputContainer } from './elements';

export const RelatedDocumentSearch: React.FC = () => {
  const data = useRelatedDocumentsFilters();
  const setRelatedDocumentFilters = useSetRelatedDocumentsFilters();
  const facets = useMemo(() => get(data, 'filters.documents.facets'), [data]);
  const { t } = useTranslation();
  const [searchValue, setSearchValue] = useState<string>(data.query || '');

  useEffect(() => {
    if (data.query === '' && data.query !== searchValue) {
      setSearchValue(data.query);
    }
  }, [data.query]);

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
