import { useCallback, useMemo, useState } from 'react';

import { useAssetsMetadataKeys } from '@data-exploration-lib/domain-layer';

import isEmpty from 'lodash/isEmpty';
import debounce from 'lodash/debounce';
import { ResourceTableColumns } from '@data-exploration/components';

export const useAssetsMetadataColumns = () => {
  const [query, setQuery] = useState<string>();

  const { data: metadataKeys = [] } = useAssetsMetadataKeys();
  const { data: metadataKeysDynamic = [] } = useAssetsMetadataKeys({
    query,
    enabled: !isEmpty(query),
  });

  const metadataColumns = useMemo(() => {
    const allMetadataKeys = [...metadataKeys, ...metadataKeysDynamic];
    const uniqueMetadataKeys = [...new Set(allMetadataKeys)];
    return uniqueMetadataKeys.map((key) => ResourceTableColumns.metadata(key));
  }, [metadataKeys, metadataKeysDynamic]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const setMetadataKeyQuery = useCallback(
    debounce((value: string) => setQuery(value), 500),
    []
  );

  return { metadataColumns, setMetadataKeyQuery };
};
