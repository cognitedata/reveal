import { CogniteClient } from '@cognite/sdk';
import { OCRAnnotation } from '../../types';

export const retrievePnIdRawOCRResult = (
  sdk: CogniteClient,
  fileId: number
) => {
  return sdk
    .post<{ items: { annotations: OCRAnnotation[] }[] }>(
      `/api/playground/projects/${sdk.project}/context/pnid/ocr`,
      { data: { fileId } }
    )
    .then(
      ({
        data: {
          items: [{ annotations }],
        },
      }) => annotations
    );
};
