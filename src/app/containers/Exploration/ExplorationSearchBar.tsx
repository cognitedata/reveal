import React, { useState, useEffect } from 'react';
import { Input } from 'antd';
import { useQuery } from 'app/context/ResourceSelectionContext';
import { debounce } from 'lodash';

export const ExplorationSearchBar = () => {
  const [urlQuery, setUrlQuery] = useQuery();
  const debouncedSetUrlQuery = debounce(setUrlQuery, 200);
  const [localQuery, setLocalQuery] = useState(urlQuery);

  useEffect(() => {
    if (localQuery !== urlQuery) {
      debouncedSetUrlQuery(localQuery);
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
    <Input.Search
      size="large"
      style={{ width: '100%' }}
      placeholder="Search for a file or asset..."
      onChange={ev => setLocalQuery(ev.target.value)}
      value={localQuery}
    />
  );
};
