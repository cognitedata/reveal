import { CogniteOrnate } from '@cognite/ornate';

import { Group } from '../../components/LineReviewViewer/ReactOrnate';
import { DocumentConnection } from '../../modules/lineReviews/types';

import getConnectionGroupByPath from './getConnectionGroupByPath';
import { Path } from './types';
import { getConnectionPath, getPathsWithoutOverlaps } from './utils';

const getFileConnectionGroups = ({
  ornateViewer,
  connections,
  columnGap,
  rowGap,
  onSelect,
  selectedId,
}: {
  ornateViewer: CogniteOrnate;
  connections: DocumentConnection[];
  columnGap: number;
  rowGap: number;
  onSelect: (id: string) => void;
  selectedId: string | undefined;
}): Group[] => {
  const paths: Path[] = getPathsWithoutOverlaps({
    paths: connections
      .filter((annotationIds) =>
        annotationIds.every((annotationId) =>
          ornateViewer.stage.findOne(`#${annotationId}`)
        )
      )
      .map((annotationIds) =>
        getConnectionPath({
          annotationIds,
          ornateViewer,
          columnGap,
          rowGap,
        })
      ),
    columnGap,
    rowGap,
  });

  return paths.flatMap((path) =>
    getConnectionGroupByPath(path, { onSelect, selectedId })
  );
};

export default getFileConnectionGroups;
