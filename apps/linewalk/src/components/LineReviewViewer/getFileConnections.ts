import {
  DocumentConnection,
  LineReview,
} from '../../modules/lineReviews/types';

const getFileConnections = (lineReview: LineReview) => {
  const allSymbolInstances = lineReview.documents.flatMap(
    ({ _annotations }) => _annotations.symbolInstances
  );

  const getSymbolNameByPathId = (pathId: string): string | undefined => {
    const symbolInstance = allSymbolInstances.find(({ id }) => id === pathId);

    if (symbolInstance === undefined) {
      return undefined;
    }

    return symbolInstance.symbolName;
  };

  const fileConnections: DocumentConnection[] = lineReview.documents
    .flatMap(({ _linking }) => _linking)
    .filter(
      (link) =>
        getSymbolNameByPathId(link.from.instanceId) === 'fileConnection' &&
        getSymbolNameByPathId(link.to.instanceId) === 'fileConnection'
    )
    .map((link) => [link.from.instanceId, link.to.instanceId]);

  return fileConnections;
};

export default getFileConnections;
