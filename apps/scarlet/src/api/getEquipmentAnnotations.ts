import { CogniteClient } from '@cognite/sdk';
import { transformScannerAnnotation } from 'transformations';
import {
  DocumentType,
  EquipmentConfig,
  EquipmentDocument,
  ScannerDetection,
} from 'types';

export const getEquipmentAnnotations = async (
  client: CogniteClient,
  {
    config,
    documents,
  }: { config?: EquipmentConfig; documents?: EquipmentDocument[] }
): Promise<ScannerDetection[]> => {
  const u1Documents = documents?.filter(
    (document) => document.type === DocumentType.U1
  );
  const creatingAppVersions = config?.creatingAppVersions || [];
  if (!u1Documents?.length || !creatingAppVersions?.length) return [];

  // eslint-disable-next-line no-restricted-syntax
  for (const creatingAppVersion of creatingAppVersions) {
    // eslint-disable-next-line no-await-in-loop
    const annotations = await fetchAnnotations(client, {
      annotatedResourceIds: u1Documents.map(({ id }) => ({ id })),
      creatingAppVersion,
    });
    if (annotations.length) {
      const externalIds = u1Documents?.reduce(
        (result, document) => ({
          ...result,
          [document.id]: document.externalId!,
        }),
        {} as Record<number, string>
      );
      return annotations.map((annotation) =>
        transformScannerAnnotation(annotation, externalIds)
      );
    }
  }

  return [];
};

const fetchAnnotations = async (
  client: CogniteClient,
  filter: any,
  cursor?: string
): Promise<any[]> => {
  const response = await client.post(
    `/api/playground/projects/${client.project}/annotations/list`,
    {
      data: {
        filter: {
          annotatedResourceType: 'file',
          annotationType: 'forms.Detection',
          creatingApp: 'form-scanner',
          ...filter,
        },
        cursor,
        limit: 1000,
      },
    }
  );

  const { items, nextCursor } = response.data;
  if (!nextCursor) return items;

  return [...items, ...(await fetchAnnotations(client, filter, nextCursor))];
};
