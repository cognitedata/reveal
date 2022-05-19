import mime from 'mime-types';
import { VisionFile } from 'src/modules/Common/store/files/types';
import {
  MAX_AUTOML_ANNOTATIONS_TYPE,
  MIN_AUTOML_FILES_PER_ANNOTATIONS_TYPE,
} from 'src/api/vision/autoML/constants';
import {
  VisionAnnotation,
  VisionAnnotationDataType,
} from 'src/modules/Common/types';
import { getAnnotationLabelOrText } from 'src/modules/Common/Utils/AnnotationUtils/AnnotationUtils';

export interface DatasetValidationType {
  valid: boolean;
  message?: string;
}

export const fileTypesValid = (files: VisionFile[]) => {
  return files.every((item) =>
    ['png', 'jpeg'].includes(mime.extension(item?.mimeType || '') || '')
  );
};

export const annotationTypeCountIsValid = (
  annotations: VisionAnnotation<VisionAnnotationDataType>[]
) => {
  return (
    [...new Set(annotations.map((item) => getAnnotationLabelOrText(item)))]
      .length <= MAX_AUTOML_ANNOTATIONS_TYPE
  );
};

export const imageCountPerAnnotationTypeIsValid = (
  annotations: VisionAnnotation<VisionAnnotationDataType>[]
) => {
  const uniqueAnnotationLabels = [
    ...new Set(annotations.map((item) => getAnnotationLabelOrText(item))),
  ];

  const counts = uniqueAnnotationLabels.map((a) => {
    return [
      ...new Set(
        annotations
          .filter((item) => getAnnotationLabelOrText(item) === a)
          .map((item) => item.annotatedResourceId)
      ),
    ].length;
  });
  return counts.every((item) => item >= MIN_AUTOML_FILES_PER_ANNOTATIONS_TYPE);
};

export const imagesHaveAnnotations = (
  annotationsMap: Record<number, VisionAnnotation<VisionAnnotationDataType>[]>
) => {
  const counts = Object.entries(annotationsMap).map(([_, item]) => {
    return item.length;
  });
  return counts.length ? counts.every((item) => item > 0) : false;
};

export const validateDataset = (
  files: VisionFile[],
  annotationsMap: Record<number, VisionAnnotation<VisionAnnotationDataType>[]>
): DatasetValidationType => {
  if (!fileTypesValid(files)) {
    return {
      valid: false,
      message: `Images must be of type jpeg or png, with mime type image/png or image/jpeg`,
    };
  }

  if (!imagesHaveAnnotations(annotationsMap)) {
    return {
      valid: false,
      message: `All images must have at least one annotation`,
    };
  }

  const annotations = Object.entries(annotationsMap)
    .map(([_, item]) => item)
    .flat();

  if (!annotationTypeCountIsValid(annotations)) {
    return {
      valid: false,
      message: `There can maximum be ${MAX_AUTOML_ANNOTATIONS_TYPE} unique annotation types`,
    };
  }

  if (!imageCountPerAnnotationTypeIsValid(annotations)) {
    return {
      valid: false,
      message: `There must be at least ${MIN_AUTOML_FILES_PER_ANNOTATIONS_TYPE} images per unique annotation type`,
    };
  }

  return {
    valid: true,
  };
};
