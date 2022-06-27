import { useState } from 'react';
import { Button, Input, Loader } from '@cognite/cogs.js';
import { useDebounce } from 'utils/hooks/useDebounce';
import axios from 'axios';

import { Container } from '../elements';

import { Result } from './Result/Result';
import { ResultType } from './types';

const Search = () => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchResult, setSearchResult] = useState<
    { data: ResultType } | undefined
  >();

  const onSearch = async (query: string) => {
    /*
    curl \
      -H 'Authorization: Bearer [SECRET HERE]' \
      'https://api.wit.ai/message?v=20220601&q=[MESSAGE HERE]'
    */

    if (query === '') return;

    setLoading(true);
    const config = {
      headers: {
        Authorization: `Bearer ${process.env.REACT_APP_SEARCH_API_TOKEN}`,
      },
    };

    axios
      .get(`https://api.wit.ai/message?v=20220601&q=${query}`, config)
      .then((m) => {
        setSearchResult(m);
        setLoading(false);
      })
      .catch((e) => {
        setSearchResult(e.message);
        setLoading(false);
        // console.warn(e, 'did you add the API token to env?');
      });
  };

  const debouncedSearch = useDebounce(onSearch, 1000);

  const onQuery = (query: string) => {
    debouncedSearch(query);
  };

  return (
    <Container>
      <Input
        type="text"
        placeholder="Ask me anything..."
        value={query}
        onKeyPress={(e) => {
          if (e.key === 'Enter') {
            onQuery(query);
          }
        }}
        onChange={(e) => {
          setQuery(e.target.value);
          setSearchResult(undefined);
        }}
        style={{ width: '60%', margin: '2rem' }}
        size="large"
      />
      <Button onClick={() => onQuery(query)}>Search</Button>
      {loading ? <Loader /> : <Result result={searchResult?.data} />}
    </Container>
  );
};

export default Search;
