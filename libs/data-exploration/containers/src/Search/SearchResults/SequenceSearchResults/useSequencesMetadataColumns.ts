import { useCallback, useMemo, useState } from 'react';

import { ResourceTableColumns } from '@data-exploration/components';
import { useSequencesMetadataKeys } from '@data-exploration-lib/domain-layer';
import debounce from 'lodash/debounce';
import isEmpty from 'lodash/isEmpty';

export const useSequencesMetadataColumns = () => {
  const [query, setQuery] = useState<string>();

  const { data: metadataKeys = [] } = useSequencesMetadataKeys();
  const { data: metadataKeysDynamic = [] } = useSequencesMetadataKeys({
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
