import * as React from 'react';

import { useWellInspect } from 'modules/wellInspect/selectors';
import { columns } from 'pages/authorized/search/well/inspect/modules/relatedDocument/constant';

export const useSelectedColumns = () => {
  const { selectedRelatedDocumentsColumns } = useWellInspect();
  return React.useMemo(() => {
    return Object.keys(columns)
      .filter((key) => selectedRelatedDocumentsColumns[key])
      .map((key) => columns[key]);
  }, [selectedRelatedDocumentsColumns]);
};
