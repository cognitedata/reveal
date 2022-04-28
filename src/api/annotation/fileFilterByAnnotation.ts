import { AnnotationFilterType } from 'src/modules/FilterSidePanel/types';
import { AnnotationUtilsV1 } from 'src/utils/AnnotationUtilsV1/AnnotationUtilsV1';
import { AnnotationApi } from 'src/api/annotation/AnnotationApi';
import { validateAnnotation } from 'src/api/annotation/utils';
import { FileInfo } from '@cognite/sdk';
import {
  ANNOTATION_FETCH_BULK_SIZE,
  FETCH_ANNOTATION_LIMIT,
} from 'src/constants/FetchConstants';
import { splitListIntoChunks } from 'src/utils/generalUtils';
import { CDFAnnotationV1 } from './types';

const getAnnotations = async (
  annotationText?: string,
  annotationState?: string,
  fileIds?: number[]
) => {
  const filterPayload: any = {
    annotatedResourceType: 'file',
    text: annotationText,
    status: annotationState,
    annotatedResourceIds: fileIds && fileIds.map((id) => ({ id })),
  };
  const annotationListRequest = {
    limit: FETCH_ANNOTATION_LIMIT,
    filter: filterPayload,
  };
  const annotations = await AnnotationApi.list(annotationListRequest);

  const validAnnotations = annotations.filter((annotation: CDFAnnotationV1) => {
    try {
      return validateAnnotation(annotation);
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
  const { annotationText, annotationState } = annotation;
  const bulkedIds = splitListIntoChunks(
    items.map((file) => file.id),
    ANNOTATION_FETCH_BULK_SIZE
  );

  const relatedAnnotations = (
    await Promise.all(
      bulkedIds.map((ids) =>
        getAnnotations(annotationText, annotationState, ids)
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
