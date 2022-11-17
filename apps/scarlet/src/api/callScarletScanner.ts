import { CogniteClient } from '@cognite/sdk';

export const callScarletScanner = async (
  client: CogniteClient,
  { documentId }: { documentId: number }
) => {
  try {
    await client.post(
      `/api/playground/projects/${client.project}/context/forms/scan`,
      {
        data: {
          items: [{ fileId: documentId }],
        },
      }
    );
  } catch (e) {
    console.error('Failed executing scans on U1 documents', e);
  }
};
