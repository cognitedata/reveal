import React, { useState, useEffect } from 'react';
import { Input } from '@cognite/cogs.js';
import { debounce } from 'lodash';
import { useQueryString } from 'app/hooks';
import { SEARCH_KEY } from 'app/utils/contants';

export const ExplorationSearchBar = () => {
  const [urlQuery, setUrlQuery] = useQueryString(SEARCH_KEY);
  const debouncedSetUrlQuery = debounce(setUrlQuery, 200);
  const [localQuery, setLocalQuery] = useState(urlQuery);

  useEffect(() => {
    if (localQuery !== urlQuery) {
      debouncedSetUrlQuery(encodeURIComponent(localQuery));
    }
    return () => debouncedSetUrlQuery.cancel();
  }, [debouncedSetUrlQuery, localQuery, urlQuery]);

  useEffect(() => {
    if (localQuery !== urlQuery) {
      setLocalQuery(urlQuery);
    }
    // Disabeling react-hooks/exhaustive-deps because this should /not/ be
    // triggered when localQuery changes.
    // eslint-disable-next-line
  }, [urlQuery, setLocalQuery]);

  return (
    <Input
      size="large"
      variant="noBorder"
      fullWidth
      style={{
        background: 'transparent',
        border: 'none',
        outline: 'none',
        boxShadow: 'none',
      }}
      icon="Search"
      placeholder="Search..."
      onChange={ev => setLocalQuery(ev.target.value)}
      value={localQuery}
    />
  );
};
