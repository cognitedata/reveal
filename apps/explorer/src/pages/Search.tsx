import { useState } from 'react';
import isEmpty from 'lodash/isEmpty';
import { RegularHeader } from 'components/Header';
import { List } from 'components/List';
import { NoResults } from 'components/NoResults/NoResults';
import { SearchBar } from 'components/SearchBar';
import { useSearchPeopleRoomsQuery } from 'graphql/queries/useSearchPeopleRoomsQuery';
import { useFuseSearch } from 'hooks/useFuseSearch';
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
  const {
    isLoading,
    error,
    data: itemsArray,
  } = useSearchPeopleRoomsQuery({
    personFilter: {},
    roomFilter: {},
  });
  let content;

  if (error) content = <ErrorDisplay>{error as string}</ErrorDisplay>;
  else {
    const itemsObj = useFuseSearch(query, itemsArray);
    if (isLoading) content = <>Loading</>;
    else
      content = isEmpty(itemsObj) ? <NoResults /> : <List items={itemsObj} />;
  }

  return (
    <>
      <RegularHeader
        Left={() => renderLeftHeader(query, (e) => setQuery(e.target.value))}
      />
      {content}
    </>
  );
};
