import {
  annotationTypeCountIsValid,
  fileTypesValid,
  imageCountPerAnnotationTypeIsValid,
  imagesHaveAnnotations,
} from 'src/modules/Common/Components/ModelTrainingModal/datasetValidators';
import { VisionFile } from 'src/modules/Common/store/files/types';
import { AnnotationUtils, VisionAnnotation } from 'src/utils/AnnotationUtils';

jest.mock('src/api/vision/autoML/constants', () => ({
  ...jest.requireActual('src/api/vision/autoML/constants'),
  MIN_AUTOML_DATASET_SIZE: 2,
  MAX_AUTOML_ANNOTATIONS_TYPE: 2,
  MIN_AUTOML_FILES_PER_ANNOTATIONS_TYPE: 2,
}));

const getDummyAnnotation = (text: string, fileId?: number) => {
  return {
    ...AnnotationUtils.createVisionAnnotationStub(
      1,
      text,
      1,
      fileId || 1,
      123,
      124
    ),
    show: true,
    selected: false,
  } as VisionAnnotation;
};

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
        name: 'one',
        mimeType: 'image/png',
        ...commonVisionFileMock,
      },
      {
        id: 2,
        name: 'two',
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
        name: 'one',
        mimeType: 'video/mp4',
        ...commonVisionFileMock,
      },
      {
        id: 2,
        name: 'two',
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
        name: 'one',
        ...commonVisionFileMock,
      },
    ] as VisionFile[];
    expect(fileTypesValid(mockVisionFiles)).toBe(false);
  });

  test('invalid mime type is not valid', () => {
    const mockVisionFiles = [
      {
        id: 1,
        name: 'one',
        mimeType: '',
        ...commonVisionFileMock,
      },
    ] as VisionFile[];
    expect(fileTypesValid(mockVisionFiles)).toBe(false);
  });
});

describe('Test AutoML validator: annotationTypeCountIsValid', () => {
  test('should be valid since unique annotation count is less than MAX_AUTOML_ANNOTATIONS_TYPE', () => {
    const mockVisionAnnotationList = [getDummyAnnotation('pump')];
    expect(annotationTypeCountIsValid(mockVisionAnnotationList)).toBe(true);
  });

  test('should be valid since unique annotation count is equal to MAX_AUTOML_ANNOTATIONS_TYPE', () => {
    const mockVisionAnnotationList = [
      getDummyAnnotation('pump'),
      getDummyAnnotation('valve'),
    ];
    expect(annotationTypeCountIsValid(mockVisionAnnotationList)).toBe(true);
  });

  test('should be invalid since unique annotation count is larger to MAX_AUTOML_ANNOTATIONS_TYPE', () => {
    const mockVisionAnnotationList = [
      getDummyAnnotation('pump'),
      getDummyAnnotation('valve'),
      getDummyAnnotation('gauge'),
    ];
    expect(annotationTypeCountIsValid(mockVisionAnnotationList)).toBe(false);
  });
});

describe('Test AutoML validator: imageCountPerAnnotationTypeIsValid', () => {
  test('should be valid since files per unique annotation type is larger than MIN_AUTOML_FILES_PER_ANNOTATIONS_TYPE', () => {
    const mockVisionAnnotationList = [
      getDummyAnnotation('pump', 1),
      getDummyAnnotation('pump', 2),
      getDummyAnnotation('pump', 3),
    ];
    expect(imageCountPerAnnotationTypeIsValid(mockVisionAnnotationList)).toBe(
      true
    );
  });

  test('should be valid since files per unique annotation type is equal to MIN_AUTOML_FILES_PER_ANNOTATIONS_TYPE', () => {
    const mockVisionAnnotationList = [
      getDummyAnnotation('pump', 1),
      getDummyAnnotation('pump', 2),
    ];
    expect(imageCountPerAnnotationTypeIsValid(mockVisionAnnotationList)).toBe(
      true
    );
  });

  test('should be invalid since files per unique annotation type is less to MIN_AUTOML_FILES_PER_ANNOTATIONS_TYPE', () => {
    const mockVisionAnnotationList = [getDummyAnnotation('pump', 1)];
    expect(imageCountPerAnnotationTypeIsValid(mockVisionAnnotationList)).toBe(
      false
    );
  });

  test('should be invalid since unique files per unique annotation type is less to MIN_AUTOML_FILES_PER_ANNOTATIONS_TYPE', () => {
    const mockVisionAnnotationList = [
      getDummyAnnotation('pump', 1),
      getDummyAnnotation('pump', 1),
    ];
    expect(imageCountPerAnnotationTypeIsValid(mockVisionAnnotationList)).toBe(
      false
    );
  });
});

describe('Test AutoML validator: imagesHaveAnnotations', () => {
  test('should be valid since all imagess have annotations', () => {
    const mockVisionAnnotationMap = {};
    expect(imagesHaveAnnotations(mockVisionAnnotationMap)).toBe(false);
  });

  test('should be valid since all images have annotations', () => {
    const mockVisionAnnotationMap = {
      '1': [getDummyAnnotation('pump', 1)],
      '2': [getDummyAnnotation('pump', 1)],
    };
    expect(imagesHaveAnnotations(mockVisionAnnotationMap)).toBe(true);
  });

  test('should be invalid since all images do not have annotations', () => {
    const mockVisionAnnotationMap = {
      '1': [getDummyAnnotation('pump', 1)],
      '2': [],
    };
    expect(imagesHaveAnnotations(mockVisionAnnotationMap)).toBe(false);
  });
});
