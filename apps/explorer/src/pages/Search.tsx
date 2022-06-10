import { useState } from 'react';
import isEmpty from 'lodash/isEmpty';
import { RegularHeader } from 'components/Header';
import { List } from 'components/List';
import { NoResults } from 'components/NoResults/NoResults';
import { SearchBar } from 'components/SearchBar';
import { useGetSearchAPI } from 'hooks/useGetSearchAPI';
import { useFuseSearch } from 'hooks/useFuseSearch';

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
  const itemsArray = useGetSearchAPI();
  const itemsObj = useFuseSearch(query, itemsArray);

  return (
    <>
      <RegularHeader
        Left={() => renderLeftHeader(query, (e) => setQuery(e.target.value))}
      />
      {isEmpty(itemsObj) ? <NoResults /> : <List items={itemsObj} />}
    </>
  );
};
