import { getDummyImageObjectDetectionBoundingBoxAnnotation } from '../../../../../__test-utils/getDummyAnnotations';
import { VisionFile } from '../../../store/files/types';
import {
  annotationTypeCountIsValid,
  fileTypesValid,
  imageCountPerAnnotationTypeIsValid,
  imagesHaveAnnotations,
} from '../datasetValidators';

jest.mock('@vision/api/vision/autoML/constants', () => ({
  ...jest.requireActual('@vision/api/vision/autoML/constants'),
  MIN_AUTOML_DATASET_SIZE: 2,
  MAX_AUTOML_ANNOTATIONS_TYPE: 2,
  MIN_AUTOML_FILES_PER_ANNOTATIONS_TYPE: 2,
}));

describe('Test AutoML validator: fileTypesValid', () => {
  const commonVisionFileMock = {
    uploaded: true,
    createdTime: 1,
    lastUpdatedTime: 1,
    linkedAnnotations: [],
  };

  test('image/png and image/jpeg are valid mime types', () => {
    const mockVisionFiles = [
      {
        id: 1,
        name: 'one.png',
        mimeType: 'image/png',
        ...commonVisionFileMock,
      },
      {
        id: 2,
        name: 'two.jpeg',
        mimeType: 'image/jpeg',
        ...commonVisionFileMock,
      },
      {
        id: 3,
        name: 'two.jpg',
        mimeType: 'image/jpeg',
        ...commonVisionFileMock,
      },
    ] as VisionFile[];
    expect(fileTypesValid(mockVisionFiles)).toBe(true);
  });

  test('video/mp4 is not valid mime types', () => {
    const mockVisionFiles = [
      {
        id: 1,
        name: 'one.png',
        mimeType: 'video/mp4',
        ...commonVisionFileMock,
      },
      {
        id: 2,
        name: 'two.jpeg',
        mimeType: 'image/jpeg',
        ...commonVisionFileMock,
      },
    ] as VisionFile[];
    expect(fileTypesValid(mockVisionFiles)).toBe(false);
  });

  test('missing mime type is not valid', () => {
    const mockVisionFiles = [
      {
        id: 1,
        name: 'one.png',
        ...commonVisionFileMock,
      },
    ] as VisionFile[];
    expect(fileTypesValid(mockVisionFiles)).toBe(false);
  });

  test('invalid mime type is not valid', () => {
    const mockVisionFiles = [
      {
        id: 1,
        name: 'one.png',
        mimeType: '',
        ...commonVisionFileMock,
      },
    ] as VisionFile[];
    expect(fileTypesValid(mockVisionFiles)).toBe(false);
  });
  test('missing file extension is not valid', () => {
    const mockVisionFiles = [
      {
        id: 1,
        name: 'one',
        ...commonVisionFileMock,
      },
    ] as VisionFile[];
    expect(fileTypesValid(mockVisionFiles)).toBe(false);
  });
  test('mp4 is not valid file extension', () => {
    const mockVisionFiles = [
      {
        id: 1,
        name: 'one.mp4',
        ...commonVisionFileMock,
      },
    ] as VisionFile[];
    expect(fileTypesValid(mockVisionFiles)).toBe(false);
  });
});

describe('Test AutoML validator: annotationTypeCountIsValid', () => {
  test('should be valid since unique annotation count is less than MAX_AUTOML_ANNOTATIONS_TYPE', () => {
    const mockVisionAnnotationList = [
      getDummyImageObjectDetectionBoundingBoxAnnotation({
        id: 1,
        label: 'pump',
      }),
    ];
    expect(annotationTypeCountIsValid(mockVisionAnnotationList)).toBe(true);
  });

  test('should be valid since unique annotation count is equal to MAX_AUTOML_ANNOTATIONS_TYPE', () => {
    const mockVisionAnnotationList = [
      getDummyImageObjectDetectionBoundingBoxAnnotation({
        id: 1,
        label: 'pump',
      }),
      getDummyImageObjectDetectionBoundingBoxAnnotation({
        id: 2,
        label: 'valve',
      }),
    ];
    expect(annotationTypeCountIsValid(mockVisionAnnotationList)).toBe(true);
  });

  test('should be invalid since unique annotation count is larger to MAX_AUTOML_ANNOTATIONS_TYPE', () => {
    const mockVisionAnnotationList = [
      getDummyImageObjectDetectionBoundingBoxAnnotation({
        id: 1,
        label: 'pump',
      }),
      getDummyImageObjectDetectionBoundingBoxAnnotation({
        id: 2,
        label: 'valve',
      }),
      getDummyImageObjectDetectionBoundingBoxAnnotation({
        id: 3,
        label: 'gauge',
      }),
    ];
    expect(annotationTypeCountIsValid(mockVisionAnnotationList)).toBe(false);
  });
});

describe('Test AutoML validator: imageCountPerAnnotationTypeIsValid', () => {
  test('should be valid since files per unique annotation type is larger than MIN_AUTOML_FILES_PER_ANNOTATIONS_TYPE', () => {
    const mockVisionAnnotationList = [
      getDummyImageObjectDetectionBoundingBoxAnnotation({
        id: 1,
        annotatedResourceId: 1,
        label: 'pump',
      }),
      getDummyImageObjectDetectionBoundingBoxAnnotation({
        id: 2,
        annotatedResourceId: 2,
        label: 'pump',
      }),
      getDummyImageObjectDetectionBoundingBoxAnnotation({
        id: 3,
        annotatedResourceId: 3,
        label: 'pump',
      }),
    ];
    expect(imageCountPerAnnotationTypeIsValid(mockVisionAnnotationList)).toBe(
      true
    );
  });

  test('should be valid since files per unique annotation type is equal to MIN_AUTOML_FILES_PER_ANNOTATIONS_TYPE', () => {
    const mockVisionAnnotationList = [
      getDummyImageObjectDetectionBoundingBoxAnnotation({
        id: 1,
        annotatedResourceId: 1,
        label: 'pump',
      }),
      getDummyImageObjectDetectionBoundingBoxAnnotation({
        id: 2,
        annotatedResourceId: 2,
        label: 'pump',
      }),
    ];
    expect(imageCountPerAnnotationTypeIsValid(mockVisionAnnotationList)).toBe(
      true
    );
  });

  test('should be invalid since files per unique annotation type is less to MIN_AUTOML_FILES_PER_ANNOTATIONS_TYPE', () => {
    const mockVisionAnnotationList = [
      getDummyImageObjectDetectionBoundingBoxAnnotation({
        id: 1,
        annotatedResourceId: 1,
        label: 'pump',
      }),
    ];
    expect(imageCountPerAnnotationTypeIsValid(mockVisionAnnotationList)).toBe(
      false
    );
  });

  test('should be invalid since unique files per unique annotation type is less to MIN_AUTOML_FILES_PER_ANNOTATIONS_TYPE', () => {
    const mockVisionAnnotationList = [
      getDummyImageObjectDetectionBoundingBoxAnnotation({
        id: 1,
        annotatedResourceId: 1,
        label: 'pump',
      }),
      getDummyImageObjectDetectionBoundingBoxAnnotation({
        id: 2,
        annotatedResourceId: 1,
        label: 'pump',
      }),
    ];
    expect(imageCountPerAnnotationTypeIsValid(mockVisionAnnotationList)).toBe(
      false
    );
  });
});

describe('Test AutoML validator: imagesHaveAnnotations', () => {
  test('should be invalid since annotations are empty', () => {
    const mockVisionAnnotationMap = {};
    expect(imagesHaveAnnotations(mockVisionAnnotationMap)).toBe(false);
  });

  test('should be valid since all images have annotations', () => {
    const mockVisionAnnotationMap = {
      '1': [
        getDummyImageObjectDetectionBoundingBoxAnnotation({
          id: 1,
          annotatedResourceId: 1,
          label: 'pump',
        }),
      ],
      '2': [
        getDummyImageObjectDetectionBoundingBoxAnnotation({
          id: 2,
          annotatedResourceId: 1,
          label: 'pump',
        }),
      ],
    };
    expect(imagesHaveAnnotations(mockVisionAnnotationMap)).toBe(true);
  });

  test('should be invalid since all images do not have annotations', () => {
    const mockVisionAnnotationMap = {
      '1': [
        getDummyImageObjectDetectionBoundingBoxAnnotation({
          id: 2,
          annotatedResourceId: 1,
          label: 'pump',
        }),
      ],
      '2': [],
    };
    expect(imagesHaveAnnotations(mockVisionAnnotationMap)).toBe(false);
  });
});
