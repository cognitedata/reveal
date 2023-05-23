import {
  Revision3DWithIndex,
  RevisionOpts,
  use3DRevisionsQuery,
} from '@data-exploration-lib/domain-layer';
import { useCallback } from 'react';

export const useDefault3DModelRevision = (
  modelId?: number,
  opts?: Omit<
    RevisionOpts<Revision3DWithIndex | undefined>,
    'queryKey' | 'queryFn' | 'select'
  >
) => {
  return use3DRevisionsQuery(modelId, {
    select: useCallback((revisions: Revision3DWithIndex[] = []) => {
      const publishedRevisions = revisions.filter((r) => r.published);

      if (!revisions.length) {
        return undefined;
      } else {
        if (!publishedRevisions.length) {
          return (
            revisions.reduce(findNewestRevision, {} as Revision3DWithIndex) ||
            undefined
          );
        }
        return publishedRevisions.reduce(
          findNewestRevision,
          {} as Revision3DWithIndex
        );
      }
    }, []),
    ...opts,
  });
};

/**
 * iterator for reducer
 */
export const findNewestRevision = (
  acc: Revision3DWithIndex,
  current: Revision3DWithIndex
) => {
  return acc?.createdTime > current?.createdTime ? acc : current;
};
