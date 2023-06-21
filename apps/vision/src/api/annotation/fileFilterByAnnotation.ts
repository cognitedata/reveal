import { AnnotationFilterType } from 'src/modules/FilterSidePanel/types';
import {
  AnnotationFilterRequest,
  AnnotationStatus,
  FileInfo,
} from '@cognite/sdk';
import { ANNOTATION_FETCH_BULK_SIZE } from 'src/constants/FetchConstants';
import { splitListIntoChunks } from 'src/utils/generalUtils';
import sdk from '@cognite/cdf-sdk-singleton';
import { convertCDFAnnotationToVisionAnnotations } from './converters';
const getAnnotations = async (
  annotationLabelOrText?: string,
  annotationState?: string,
  fileIds?: number[]
) => {
  const filterPayload: AnnotationFilterRequest = {
    filter: {
      annotatedResourceType: 'file',
      annotatedResourceIds: fileIds?.map((id) => ({ id })) || [],
      status: annotationState as AnnotationStatus,
      data: {
        label: annotationLabelOrText,
      },
    },
    limit: 1000,
  };

  const annotations = await sdk.annotations
    .list(filterPayload)
    .autoPagingToArray({ limit: Infinity });

  const visionAnnotations = convertCDFAnnotationToVisionAnnotations(
    annotations.flat()
  );

  return visionAnnotations;
};

export const fileFilterByAnnotation = async (
  annotation: AnnotationFilterType,
  items: FileInfo[]
): Promise<FileInfo[]> => {
  const { annotationLabelOrText, annotationState } = annotation;
  const bulkedIds = splitListIntoChunks(
    items.map((file) => file.id),
    ANNOTATION_FETCH_BULK_SIZE
  );

  const relatedAnnotations = (
    await Promise.all(
      bulkedIds.map((ids) =>
        getAnnotations(annotationLabelOrText, annotationState, ids)
      )
    )
  ).flat();

  const validItems = relatedAnnotations
    .map((a) => a.annotatedResourceId)
    // remove duplicates
    .filter((v, i, a) => a.indexOf(v) === i)
    // get valid Files(items)
    .map((id) => items.find((item) => item.id === id));
  return validItems as FileInfo[];
};
