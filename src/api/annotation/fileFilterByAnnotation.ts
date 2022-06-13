import { AnnotationFilterType } from 'src/modules/FilterSidePanel/types';
import { FileInfo } from '@cognite/sdk';
import { ANNOTATION_FETCH_BULK_SIZE } from 'src/constants/FetchConstants';
import { splitListIntoChunks } from 'src/utils/generalUtils';
import {
  AnnotationFilterRequest,
  AnnotationStatus,
} from '@cognite/sdk-playground';
import { cognitePlaygroundClient } from 'src/api/annotation/CognitePlaygroundClient';
import { convertCDFAnnotationToVisionAnnotations } from './converters';

const getAnnotations = async (
  annotationLabelOrText?: string,
  annotationState?: string,
  fileIds?: number[]
) => {
  const baseFilterPayload: AnnotationFilterRequest = {
    filter: {
      annotatedResourceType: 'file',
      annotatedResourceIds: fileIds?.map((id) => ({ id })) || [],
      status: annotationState as AnnotationStatus,
    },
    limit: 1000,
  };

  const fieldsToFilterBy = annotationLabelOrText
    ? ['label', 'text']
    : [undefined];
  const annotations = await Promise.all(
    fieldsToFilterBy.map(async (field?: string) => {
      const filterPayload = { ...baseFilterPayload };
      if (field) {
        filterPayload.filter.data = { [field]: annotationLabelOrText };
      }
      return cognitePlaygroundClient.annotations
        .list(filterPayload)
        .autoPagingToArray({ limit: Infinity });
    })
  );

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
