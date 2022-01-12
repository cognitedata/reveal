import { CogniteOrnate } from '@cognite/ornate';

import {
  getConnectionPath,
  getPathsWithoutOverlaps,
  Path,
} from '../../hooks/useDrawConnections/utils';
import { DocumentConnection } from '../../modules/lineReviews/types';

const getFileConnectionPaths = (
  connections: DocumentConnection[],
  ornateViewer: CogniteOrnate,
  columnGap: number,
  rowGap: number
) => {
  const paths: Path[] = connections?.map((annotationIds) =>
    getConnectionPath({
      annotationIds,
      ornateViewer,
      columnGap,
      rowGap,
    })
  );
  const nonOverlappingPaths = getPathsWithoutOverlaps({
    paths,
    columnGap,
    rowGap,
  });
  return nonOverlappingPaths;
};

export default getFileConnectionPaths;
