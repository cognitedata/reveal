import { CogniteClient } from '@cognite/sdk';
import { OCRAnnotationPageResult } from '../../types';

export const retrievePnIdRawOCRResult = (
  sdk: CogniteClient,
  fileId: number
) => {
  return sdk
    .post<{ items: OCRAnnotationPageResult[] }>(
      `/api/playground/projects/${sdk.project}/context/pnid/ocr`,
      { data: { fileId } }
    )
    .then(({ data: { items: annotationsByPage } }) => annotationsByPage);
};
