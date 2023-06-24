import { useCallback, useMemo, useState } from 'react';

import { getTableColumns } from '@data-exploration/components';
import debounce from 'lodash/debounce';
import isEmpty from 'lodash/isEmpty';

import { useTranslation } from '@data-exploration-lib/core';
import { useAssetsMetadataKeys } from '@data-exploration-lib/domain-layer';

export const useAssetsMetadataColumns = () => {
  const [query, setQuery] = useState<string>();

  const { data: metadataKeys = [] } = useAssetsMetadataKeys();
  const { data: metadataKeysDynamic = [] } = useAssetsMetadataKeys({
    query,
    enabled: !isEmpty(query),
  });
  const { t } = useTranslation();

  const metadataColumns = useMemo(() => {
    const allMetadataKeys = [...metadataKeys, ...metadataKeysDynamic];
    const uniqueMetadataKeys = [...new Set(allMetadataKeys)];
    return uniqueMetadataKeys.map((key) => getTableColumns(t).metadata(key));
  }, [metadataKeys, metadataKeysDynamic]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const setMetadataKeyQuery = useCallback(
    debounce((value: string) => setQuery(value), 500),
    []
  );

  return { metadataColumns, setMetadataKeyQuery };
};
