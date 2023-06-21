import { Revision3DWithIndex } from '@data-exploration-lib/domain-layer';

export const selectDefaultRevision = (revisions: Revision3DWithIndex[]) => {
  const publishedRevisions = revisions.filter((r) => r.published);

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
