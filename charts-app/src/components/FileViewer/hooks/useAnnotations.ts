import { useQuery } from 'react-query';
import { FileInfo } from '@cognite/sdk';
import { useSDK } from '@cognite/sdk-provider';
import { AnnotationModel } from '../sdk/sdkTypes';

export type AnnotationsData = { items: AnnotationModel[]; nextCursor?: string };

export const useAnnotations = (file: FileInfo | undefined) => {
  const { id: fileId } = file || {};
  const sdk = useSDK();

  return useQuery<AnnotationModel[]>(`annotations-file-${fileId}`, () =>
    sdk
      .post<AnnotationsData>(
        `api/v1/projects/${sdk.project}/annotations/list`,
        {
          data: {
            limit: 1000,
            filter: {
              annotatedResourceType: 'file',
              annotatedResourceIds: [{ id: fileId }],
            },
          },
        }
      )
      .then(({ data }) => {
        return data.items;
      })
  );
};
