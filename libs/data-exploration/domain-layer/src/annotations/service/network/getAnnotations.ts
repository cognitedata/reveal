import {
  AnnotationFilterProps,
  AnnotationModel,
  CogniteClient,
} from '@cognite/sdk';

export const getAnnotations = async (
  sdk: CogniteClient,
  filter: AnnotationFilterProps,
  limit = 1000
): Promise<AnnotationModel[]> => {
  return sdk.annotations
    .list({ filter, limit })
    .then(({ items }) => {
      return items;
    })
    .catch(() => {
      return [];
    });
};
