import { useCallback, useMemo, useState } from 'react';

import { getTableColumns } from '@data-exploration/components';
import debounce from 'lodash/debounce';
import isEmpty from 'lodash/isEmpty';

import {
  getMetadataValueByKey,
  useTranslation,
} from '@data-exploration-lib/core';
import { useDocumentsMetadataKeys } from '@data-exploration-lib/domain-layer';

export const useDocumentsMetadataColumns = () => {
  const [query, setQuery] = useState<string>();

  const { data: metadataKeys = [] } = useDocumentsMetadataKeys();
  const { data: metadataKeysDynamic = [] } = useDocumentsMetadataKeys({
    query,
    enabled: !isEmpty(query),
  });
  const { t } = useTranslation();

  const metadataColumns = useMemo(() => {
    const allMetadataKeys = [...metadataKeys, ...metadataKeysDynamic];
    const uniqueMetadataKeys = [...new Set(allMetadataKeys)];
    return uniqueMetadataKeys.map((key) =>
      getTableColumns(t).metadata(key, (row) =>
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
