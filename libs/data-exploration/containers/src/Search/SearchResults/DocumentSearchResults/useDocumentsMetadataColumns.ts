import { useCallback, useMemo, useState } from 'react';

import { ResourceTableColumns } from '@data-exploration/components';
import { getMetadataValueByKey } from '@data-exploration-lib/core';
import { useDocumentsMetadataKeys } from '@data-exploration-lib/domain-layer';
import debounce from 'lodash/debounce';
import isEmpty from 'lodash/isEmpty';

export const useDocumentsMetadataColumns = () => {
  const [query, setQuery] = useState<string>();

  const { data: metadataKeys = [] } = useDocumentsMetadataKeys();
  const { data: metadataKeysDynamic = [] } = useDocumentsMetadataKeys({
    query,
    enabled: !isEmpty(query),
  });

  const metadataColumns = useMemo(() => {
    const allMetadataKeys = [...metadataKeys, ...metadataKeysDynamic];
    const uniqueMetadataKeys = [...new Set(allMetadataKeys)];
    return uniqueMetadataKeys.map((key) =>
      ResourceTableColumns.metadata(key, (row) =>
        getMetadataValueByKey(key, row?.sourceFile?.metadata)
      )
    );
  }, [metadataKeys, metadataKeysDynamic]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const setMetadataKeyQuery = useCallback(
    debounce((value: string) => setQuery(value), 500),
    []
  );

  return { metadataColumns, setMetadataKeyQuery };
};
