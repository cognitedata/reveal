import * as React from 'react';
import { useHistory, useLocation } from 'react-router-dom';

import head from 'lodash/head';

import { Metadata } from '../../../../../domain/projectConfig/types';

export const useSelectedPath = (metadata: Metadata) => {
  const history = useHistory();
  const { search } = useLocation();
  const urlParams = React.useMemo(() => new URLSearchParams(search), [search]);

  React.useEffect(() => {
    if (!search) {
      history.push({
        search: `?selectedPath=${encodeURIComponent(
          head(Object.keys(metadata)) || ''
        )}`,
      });
    }
  }, [metadata, search]);

  const selectedPath: string = decodeURIComponent(
    urlParams.get('selectedPath') || ''
  );

  const setSelectedPath = (path: string) => {
    history.push({ search: `?selectedPath=${encodeURIComponent(path)}` });
  };

  return { selectedPath, setSelectedPath };
};
