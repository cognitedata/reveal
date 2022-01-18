import { AnnotationFilterType } from 'src/modules/FilterSidePanel/types';
import { AnnotationUtils } from 'src/utils/AnnotationUtils';
import { AnnotationApi } from 'src/api/annotation/AnnotationApi';
import { Annotation } from 'src/api/types';
import { validateAnnotation } from 'src/api/annotation/utils';
import { FileInfo } from '@cognite/cdf-sdk-singleton';
import {
  ANNOTATION_FETCH_BULK_SIZE,
  FETCH_ANNOTATION_LIMIT,
} from 'src/constants/FetchConstants';
import { splitListIntoChunks } from 'src/utils/generalUtils';

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

  const validAnnotations = annotations.filter((annotation: Annotation) => {
    try {
      return validateAnnotation(annotation);
    } catch (error) {
      return false;
    }
  });

  return AnnotationUtils.convertToVisionAnnotations(validAnnotations);
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
