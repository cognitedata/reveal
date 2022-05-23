import { AnnotationFilterType } from 'src/modules/FilterSidePanel/types';
import { AnnotationUtilsV1 } from 'src/utils/AnnotationUtilsV1/AnnotationUtilsV1';
import { AnnotationApiV1 } from 'src/api/annotation/AnnotationApiV1';
import { validateAnnotationV1 } from 'src/api/annotation/utils';
import { FileInfo } from '@cognite/sdk';
import {
  ANNOTATION_FETCH_BULK_SIZE,
  FETCH_ANNOTATION_LIMIT,
} from 'src/constants/FetchConstants';
import { splitListIntoChunks } from 'src/utils/generalUtils';
import { CDFAnnotationV1 } from './types';

const getAnnotations = async (
  annotationLabelOrText?: string,
  annotationState?: string,
  fileIds?: number[]
) => {
  const filterPayload: any = {
    annotatedResourceType: 'file',
    text: annotationLabelOrText,
    status: annotationState,
    annotatedResourceIds: fileIds && fileIds.map((id) => ({ id })),
  };
  const annotationListRequest = {
    limit: FETCH_ANNOTATION_LIMIT,
    filter: filterPayload,
  };
  const annotations = await AnnotationApiV1.list(annotationListRequest);

  const validAnnotations = annotations.filter((annotation: CDFAnnotationV1) => {
    try {
      return validateAnnotationV1(annotation);
    } catch (error) {
      return false;
    }
  });

  return AnnotationUtilsV1.convertToVisionAnnotationsV1(validAnnotations);
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
