import { useState } from 'react';
import isEmpty from 'lodash/isEmpty';
import { RegularHeader } from 'components/Header';
import { NoResults } from 'components/NoResults/NoResults';
import { SearchBar } from 'components/SearchBar';
import {
  SearchPeopleRoomsQueryTypeGenerated,
  useSearchPeopleRoomsQuery,
} from 'graphql/generated';
import { getArrayOfItems, getFuseSearch } from 'utils/search';
import { useQueryClient } from 'react-query';
import { List } from 'components/List';

const renderLeftHeader = (
  query: string,
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void
) => (
  <SearchBar
    icon="ArrowLeft"
    placeholder="What are you looking for?"
    autoFocus
    query={query}
    handleChange={handleChange}
  />
);

export const Search = () => {
  const [query, setQuery] = useState('');
  const queryClient = useQueryClient();
  const searchQueryKey = useSearchPeopleRoomsQuery.getKey();
  const cachedData =
    queryClient.getQueryData<SearchPeopleRoomsQueryTypeGenerated>(
      searchQueryKey
    ) || {};

  const itemsArray = getArrayOfItems(cachedData);
  const itemsObj = getFuseSearch(query, itemsArray);

  return (
    <>
      <RegularHeader
        Left={() => renderLeftHeader(query, (e) => setQuery(e.target.value))}
      />
      {isEmpty(itemsObj) ? <NoResults /> : <List items={itemsObj} />}
    </>
  );
};
