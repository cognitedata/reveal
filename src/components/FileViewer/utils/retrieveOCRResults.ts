import { CogniteClient } from '@cognite/sdk';
import { OCRAnnotation } from '@cognite/unified-file-viewer';

export const retrieveOCRResults = async (
  client: CogniteClient,
  fileId: number
) => {
  try {
    const {
      data: {
        items: [{ annotations }],
      },
    } = await client.post<{ items: { annotations: OCRAnnotation[] }[] }>(
      `/api/playground/projects/${client.project}/context/pnid/ocr`,
      { data: { fileId } }
    );
    return annotations ?? [];
  } catch (e) {
    return [];
  }
};
