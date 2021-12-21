import { useEffect, useState } from 'react';
import Konva from 'konva';
import { CogniteOrnate } from '@cognite/ornate';
import { DocumentConnection } from 'modules/lineReviews/types';

import {
  drawConnectionLine,
  getConnectionPath,
  getPathsWithoutOverlaps,
  Path,
} from './utils';

type UseDrawConnectionsProps = {
  ornateViewer?: CogniteOrnate;
  connections?: DocumentConnection[];
  columnGap: number;
  rowGap: number;
};

export const useDrawConnections = ({
  ornateViewer,
  connections,
  columnGap,
  rowGap,
}: UseDrawConnectionsProps) => {
  // to track when documents are updated
  const documentsUpdateHash = ornateViewer?.documents
    .map((document) => document.group.id())
    .join('');

  const [committedLines, setCommittedLines] = useState<Konva.Line[]>([]);

  useEffect(() => {
    if (documentsUpdateHash && ornateViewer) {
      committedLines?.forEach((line) => line.remove());

      let paths: Path[] = [];
      connections?.forEach((annotationIds) => {
        try {
          const path = getConnectionPath({
            annotationIds,
            ornateViewer,
            columnGap,
            rowGap,
          });
          paths.push(path);
        } catch (e) {
          // report in a better via Sentry
          console.error(e);
        }
      });
      paths = getPathsWithoutOverlaps({ paths, columnGap, rowGap });
      const lines = paths.map((path) =>
        drawConnectionLine({ path, ornateViewer })
      );
      setCommittedLines(lines);
    }
  }, [connections, documentsUpdateHash]);
};
