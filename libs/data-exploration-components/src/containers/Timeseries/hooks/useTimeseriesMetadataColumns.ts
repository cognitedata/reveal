import { useCallback, useMemo, useState } from 'react';

import { useTimeseriesMetadataKeys } from '@data-exploration-lib/domain-layer';

import isEmpty from 'lodash/isEmpty';
import { ResourceTableColumns } from '@data-exploration/components';
import debounce from 'lodash/debounce';

export const useTimeseriesMetadataColumns = () => {
  const [query, setQuery] = useState<string>();

  const { data: metadataKeys = [] } = useTimeseriesMetadataKeys();
  const { data: metadataKeysDynamic = [] } = useTimeseriesMetadataKeys({
    query,
    enabled: !isEmpty(query),
  });

  const metadataColumns = useMemo(() => {
    const allMetadataKeys = [...metadataKeys, ...metadataKeysDynamic];
    const uniqueMetadataKeys = [...new Set(allMetadataKeys)];
    return uniqueMetadataKeys.map((key) =>
      ResourceTableColumns.metadata(String(key))
    );
  }, [metadataKeys, metadataKeysDynamic]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const setMetadataKeyQuery = useCallback(
    debounce((value: string) => setQuery(value), 500),
    []
  );

  return { metadataColumns, setMetadataKeyQuery };
};
