import { Input } from '@cognite/cogs.js';
import { URL_SEARCH_QUERY_PARAM, useTranslation } from 'common';
import styled from 'styled-components';
import { useUrlQuery } from 'utils';

export default function SearchInput() {
  const { t } = useTranslation();
  const [query, setQuery] = useUrlQuery(URL_SEARCH_QUERY_PARAM);
  return (
    <StyledInput
      type="search"
      icon="Search"
      placeholder={t('list-search-placeholder')}
      value={query || ''}
      onChange={(e) => setQuery(e.target.value)}
    />
  );
}

const StyledInput = styled(Input)`
  width: 220px;
`;
