import { useState } from 'react';
import isEmpty from 'lodash/isEmpty';
import { RegularHeader } from 'components/Header';
import { List } from 'components/List';
import { NoResults } from 'components/NoResults/NoResults';
import { SearchBar } from 'components/SearchBar';
import { useSearchPeopleRoomsQuery } from 'graphql/generated';
import { getArrayOfItems, getFuseSearch } from 'utils/search';
import { ErrorDisplay } from 'components/ErrorDisplay';

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
  const { isLoading, error, data } = useSearchPeopleRoomsQuery({
    personFilter: {},
    roomFilter: {},
  });

  if (error) return <ErrorDisplay>{error as string}</ErrorDisplay>;

  const itemsArray = getArrayOfItems(data);
  const itemsObj = getFuseSearch(query, itemsArray);

  return (
    <>
      <RegularHeader
        Left={() => renderLeftHeader(query, (e) => setQuery(e.target.value))}
      />
      {isLoading && <>Loading</>}
      {isEmpty(itemsObj) && !isLoading ? (
        <NoResults />
      ) : (
        <List items={itemsObj} />
      )}
    </>
  );
};
