import { CogniteOrnate } from '@cognite/ornate';

import { Discrepancy } from '../../components/LineReviewViewer/LineReviewViewer';

import { TextAnnotation } from './types';

const getBoundingBoxRelativeToParentById = (
  id: string,
  ornateRef: CogniteOrnate
) => {
  const node = ornateRef?.stage.findOne(`#${id}`);
  if (node === undefined) {
    throw new Error(
      `getBoundingBoxRelativeToParentById: Could not find node with id ${id}`
    );
  }

  const parentNode = node.getParent();
  if (!parentNode) {
    throw new Error(
      `getBoundingBoxRelativeToParentById: Could not find parent node for node with id ${id}`
    );
  }

  return node.getClientRect({ relativeTo: parentNode });
};

const getExportableTextAnnotationsFromOrnateJson = (
  ornateRef: CogniteOrnate
): TextAnnotation[] => {
  const json = ornateRef?.exportToJSON();

  if (json === undefined) {
    throw new Error("Couldn't export Ornate state to json");
  }

  return json.documents.flatMap((document) =>
    document.drawings
      .filter(({ type }) => type === 'text')
      .map(({ attrs: { fontSize, id, text, fill } }) => ({
        id,
        fontSize,
        text,
        fill,
        boundingBox: getBoundingBoxRelativeToParentById(id, ornateRef),
        targetExternalId: document.metadata.externalId,
      }))
  );
};

const getExportableDiscrepancies = (
  discrepancies: Discrepancy[],
  ornateRef: CogniteOrnate
): Discrepancy[] =>
  discrepancies.map((discrepancy) => ({
    id: discrepancy.id,
    comment: discrepancy.comment,
    createdAt: discrepancy.createdAt,
    status: discrepancy.status,
    targetExternalId: discrepancy.targetExternalId,
    boundingBox: getBoundingBoxRelativeToParentById(discrepancy.id, ornateRef),
  }));

type ExportableLineState = {
  textAnnotations: TextAnnotation[];
  discrepancies: Discrepancy[];
};

const getExportableLineState = (
  ornateRef: CogniteOrnate,
  discrepancies: Discrepancy[]
): ExportableLineState => ({
  textAnnotations: getExportableTextAnnotationsFromOrnateJson(ornateRef),
  discrepancies: getExportableDiscrepancies(discrepancies, ornateRef),
});

export default getExportableLineState;
