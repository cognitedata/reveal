import {
  CDFAnnotationTypeEnum,
  CDFAnnotationV1,
  ImageAssetLink,
  ImageClassification,
  ImageKeypointCollection,
  ImageObjectDetectionBoundingBox,
  ImageObjectDetectionPolygon,
  ImageObjectDetectionPolyline,
  RegionShape,
  Status,
} from 'src/api/annotation/types';
import {
  convertCDFAnnotationV1StatusToStatus,
  convertCDFAnnotationV1ToImageAssetLink,
  convertCDFAnnotationV1ToImageClassification,
  convertCDFAnnotationV1ToImageExtractedText,
  convertCDFAnnotationV1ToImageKeypointCollection,
  convertCDFAnnotationV1ToImageObjectDetectionBoundingBox,
  convertCDFAnnotationV1ToImageObjectDetectionPolygon,
  convertCDFAnnotationV1ToImageObjectDetectionPolyline,
  convertCDFAnnotationV1ToVisionAnnotation,
} from 'src/api/annotation/converters';
import { mockAnnotationList } from 'src/__test-utils/fixtures/annotationsV1';
import {
  AnnotationStatus,
  KeypointItem,
} from 'src/utils/AnnotationUtilsV1/AnnotationUtilsV1';
import {
  VisionImageAssetLinkAnnotation,
  VisionImageExtractedTextAnnotation,
  VisionImageKeypointCollectionAnnotation,
  VisionImageObjectDetectionAnnotation,
} from 'src/modules/Common/types';
import { getDummyAnnotation } from 'src/__test-utils/annotations';
import { VisionDetectionModelType } from 'src/api/vision/detectionModels/types';

describe('Test convertCDFAnnotationV1ToImageClassification', () => {
  test('Missing text', () => {
    const cdfAnnotationV1 = {} as CDFAnnotationV1;
    const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

    expect(
      convertCDFAnnotationV1ToImageClassification(cdfAnnotationV1)
    ).toEqual(null);
    expect(consoleSpy).toHaveBeenCalled();
  });

  test('Region ignored - valid ImageClassification', () => {
    const cdfAnnotationV1 = {
      text: 'gauge',
      region: {
        shape: RegionShape.Rectangle,
        vertices: [
          { x: 0, y: 0.1 },
          { x: 1, y: 0.3 },
        ],
      },
      data: { confidence: 0.1 },
    } as CDFAnnotationV1;

    expect(
      convertCDFAnnotationV1ToImageClassification(cdfAnnotationV1)
    ).toStrictEqual({ confidence: 0.1, label: 'gauge' } as ImageClassification);
  });
});

describe('Test convertCDFAnnotationV1ToImageObjectDetectionBoundingBox', () => {
  test('Invalid BoundingBox', () => {
    const cdfAnnotationV1 = {} as CDFAnnotationV1;
    const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

    expect(
      convertCDFAnnotationV1ToImageObjectDetectionBoundingBox(cdfAnnotationV1)
    ).toStrictEqual(null);
    expect(consoleSpy).toHaveBeenCalled();
  });

  test('Should return converted type', () => {
    const cdfObjectAnnotationV1 = mockAnnotationList.find(
      (annotation) =>
        annotation.annotationType === 'vision/objectdetection' &&
        annotation.region.shape === 'rectangle'
    ) as CDFAnnotationV1;
    expect(
      convertCDFAnnotationV1ToImageObjectDetectionBoundingBox(
        cdfObjectAnnotationV1
      )
    ).toStrictEqual({
      confidence: cdfObjectAnnotationV1.data?.confidence,
      label: cdfObjectAnnotationV1.text,
      boundingBox: {
        xMin: cdfObjectAnnotationV1.region?.vertices[0].x,
        yMin: cdfObjectAnnotationV1.region?.vertices[0].y,
        xMax: cdfObjectAnnotationV1.region?.vertices[1].x,
        yMax: cdfObjectAnnotationV1.region?.vertices[1].y,
      },
    } as ImageObjectDetectionBoundingBox);
  });
});

describe('Test convertCDFAnnotationV1ToImageObjectDetectionPolygon', () => {
  test('Missing vertices', () => {
    const cdfAnnotationV1 = {} as CDFAnnotationV1;
    const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

    expect(
      convertCDFAnnotationV1ToImageObjectDetectionPolygon(cdfAnnotationV1)
    ).toStrictEqual(null);
    expect(consoleSpy).toHaveBeenCalled();
  });

  test('Should return converted type', () => {
    const cdfObjectAnnotationV1 = mockAnnotationList.find(
      (annotation) =>
        annotation.annotationType === 'vision/objectdetection' &&
        annotation.region.shape === 'polygon'
    ) as CDFAnnotationV1;
    expect(
      convertCDFAnnotationV1ToImageObjectDetectionPolygon(cdfObjectAnnotationV1)
    ).toStrictEqual({
      confidence: cdfObjectAnnotationV1.data?.confidence,
      label: cdfObjectAnnotationV1.text,
      polygon: {
        vertices: cdfObjectAnnotationV1.region?.vertices,
      },
    } as ImageObjectDetectionPolygon);
  });
});

describe('Test convertCDFAnnotationV1ToImageObjectDetectionPolyline', () => {
  test('Missing vertices', () => {
    const cdfAnnotationV1 = {} as CDFAnnotationV1;
    const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

    expect(
      convertCDFAnnotationV1ToImageObjectDetectionPolyline(cdfAnnotationV1)
    ).toStrictEqual(null);
    expect(consoleSpy).toHaveBeenCalled();
  });

  test('Should return converted type', () => {
    const cdfObjectAnnotationV1 = mockAnnotationList.find(
      (annotation) =>
        annotation.annotationType === 'vision/objectdetection' &&
        annotation.region.shape === 'polyline'
    ) as CDFAnnotationV1;
    expect(
      convertCDFAnnotationV1ToImageObjectDetectionPolyline(
        cdfObjectAnnotationV1
      )
    ).toStrictEqual({
      confidence: cdfObjectAnnotationV1.data?.confidence,
      label: cdfObjectAnnotationV1.text,
      polyline: {
        vertices: cdfObjectAnnotationV1.region?.vertices,
      },
    } as ImageObjectDetectionPolyline);
  });
});

describe('Test convertCDFAnnotationV1ToImageExtractedText', () => {
  test('Missing bounding box', () => {
    const cdfAnnotationV1 = {} as CDFAnnotationV1;
    const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

    expect(
      convertCDFAnnotationV1ToImageClassification(cdfAnnotationV1)
    ).toStrictEqual(null);
    expect(consoleSpy).toHaveBeenCalled();
  });

  test('Should return converted type', () => {
    const cdfTextAnnotationV1 = mockAnnotationList.find(
      (annotation) => annotation.annotationType === 'vision/ocr'
    ) as CDFAnnotationV1;
    expect(
      convertCDFAnnotationV1ToImageExtractedText(cdfTextAnnotationV1)
    ).toStrictEqual({
      confidence: cdfTextAnnotationV1.data?.confidence,
      text: cdfTextAnnotationV1.text,
      textRegion: {
        xMin: cdfTextAnnotationV1.region?.vertices[0].x,
        yMin: cdfTextAnnotationV1.region?.vertices[0].y,
        xMax: cdfTextAnnotationV1.region?.vertices[1].x,
        yMax: cdfTextAnnotationV1.region?.vertices[1].y,
      },
    });
  });
});

describe('test convertCDFAnnotationV1ToImageAssetLink', () => {
  const boundingBox = {
    region: {
      shape: RegionShape.Rectangle,
      vertices: [
        { x: 0, y: 0.1 },
        { x: 1, y: 0.3 },
      ],
    },
  };
  test('Invalid BoundingBox', () => {
    const cdfAnnotationV1 = {} as CDFAnnotationV1;
    const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

    expect(
      convertCDFAnnotationV1ToImageAssetLink(cdfAnnotationV1)
    ).toStrictEqual(null);
    expect(consoleSpy).toHaveBeenCalled();
  });

  test('Invalid asset link', () => {
    const cdfAnnotationV1 = {
      ...boundingBox,
    } as CDFAnnotationV1;
    const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

    expect(
      convertCDFAnnotationV1ToImageAssetLink(cdfAnnotationV1)
    ).toStrictEqual(null);
    expect(consoleSpy).toHaveBeenCalled();
  });

  test('Should return converted type', () => {
    const cdfTagAnnotationV1 = mockAnnotationList.find(
      (annotation) => annotation.annotationType === 'vision/tagdetection'
    ) as CDFAnnotationV1;

    expect(
      convertCDFAnnotationV1ToImageAssetLink(cdfTagAnnotationV1)
    ).toStrictEqual({
      text: cdfTagAnnotationV1.text,
      confidence: cdfTagAnnotationV1.data?.confidence,
      assetRef: {
        id: cdfTagAnnotationV1.linkedResourceId,
        externalId: cdfTagAnnotationV1.linkedResourceExternalId,
      },
      textRegion: {
        xMin: cdfTagAnnotationV1.region?.vertices[0].x,
        yMin: cdfTagAnnotationV1.region?.vertices[0].y,
        xMax: cdfTagAnnotationV1.region?.vertices[1].x,
        yMax: cdfTagAnnotationV1.region?.vertices[1].y,
      },
    } as ImageAssetLink);
  });
});

describe('Test convertCDFAnnotationV1ToImageKeypointCollection', () => {
  test('Invalid keypoint collection', () => {
    const cdfKeypointAnnotationV1 = {} as CDFAnnotationV1;
    const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

    expect(
      convertCDFAnnotationV1ToImageKeypointCollection(cdfKeypointAnnotationV1)
    ).toStrictEqual(null);
    expect(consoleSpy).toHaveBeenCalled();
  });

  test('Should return converted type', () => {
    const cdfKeypointAnnotationV1 = mockAnnotationList.find(
      (annotation) =>
        annotation.annotationType === 'vision/objectdetection' &&
        annotation.region.shape === 'points'
    ) as CDFAnnotationV1;
    expect(
      convertCDFAnnotationV1ToImageKeypointCollection(cdfKeypointAnnotationV1)
    ).toStrictEqual({
      confidence: cdfKeypointAnnotationV1.data?.confidence,
      label: cdfKeypointAnnotationV1.text,
      keypoints: cdfKeypointAnnotationV1.region?.vertices.map(
        (vertex, index) => {
          return {
            label: cdfKeypointAnnotationV1.data?.keypoints![index].caption,
            confidence: cdfKeypointAnnotationV1.data?.confidence,
            point: vertex,
          };
        }
      ),
    } as ImageKeypointCollection);
  });
});

describe('Test convertAnnotationStatusToStatus', () => {
  test('Invalid Status', () => {
    expect(
      convertCDFAnnotationV1StatusToStatus('' as AnnotationStatus)
    ).toEqual(Status.Suggested);
  });

  test('Valid Status', () => {
    expect(
      convertCDFAnnotationV1StatusToStatus(AnnotationStatus.Verified)
    ).toEqual(Status.Approved);
    expect(
      convertCDFAnnotationV1StatusToStatus(AnnotationStatus.Deleted)
    ).toEqual(Status.Rejected);
    expect(
      convertCDFAnnotationV1StatusToStatus(AnnotationStatus.Rejected)
    ).toEqual(Status.Rejected);
    expect(
      convertCDFAnnotationV1StatusToStatus(AnnotationStatus.Unhandled)
    ).toEqual(Status.Suggested);
  });
});

// todo: Better if these tests could be run after mocking validator functions and typeguard functions used within the main converter function
describe('Test convertCDFAnnotationV1ToVisionAnnotation', () => {
  test('annotationId, annotationExternalId and annotationStatus', () => {
    const cdfAnnotation = {} as CDFAnnotationV1;
    const consoleSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    const cdfAnnotationWithIdV1 = getDummyAnnotation(
      1,
      VisionDetectionModelType.OCR,
      {
        confidence: 0.8,
        shape: RegionShape.Rectangle,
        vertices: [
          { x: 0, y: 0.1 },
          { x: 1, y: 0.3 },
        ],
      }
    );

    const cdfAnnotationWithExternalIdV1 = {
      ...cdfAnnotationWithIdV1,
      annotatedResourceId: undefined,
      annotatedResourceExternalId: 'one',
    };

    expect(convertCDFAnnotationV1ToVisionAnnotation(cdfAnnotation)).toEqual(
      null
    );
    expect(
      convertCDFAnnotationV1ToVisionAnnotation(cdfAnnotationWithIdV1)
    ).toStrictEqual({
      id: cdfAnnotationWithIdV1.id,
      createdTime: cdfAnnotationWithIdV1.createdTime,
      lastUpdatedTime: cdfAnnotationWithIdV1.lastUpdatedTime,
      annotatedResourceId: cdfAnnotationWithIdV1.annotatedResourceId,
      status: Status.Suggested,
      confidence: cdfAnnotationWithIdV1.data?.confidence,
      annotationType: CDFAnnotationTypeEnum.ImagesTextRegion,
      text: cdfAnnotationWithIdV1.text,
      textRegion: {
        xMin: cdfAnnotationWithIdV1.region?.vertices[0].x,
        yMin: cdfAnnotationWithIdV1.region?.vertices[0].y,
        xMax: cdfAnnotationWithIdV1.region?.vertices[1].x,
        yMax: cdfAnnotationWithIdV1.region?.vertices[1].y,
      },
    } as VisionImageExtractedTextAnnotation);
    expect(
      convertCDFAnnotationV1ToVisionAnnotation(
        cdfAnnotationWithExternalIdV1 as unknown as CDFAnnotationV1
      )
    ).toEqual(null);
    expect(consoleSpy).toHaveBeenCalled();
  });

  test('conversions', () => {
    const cdfAnnotationWithOCR = getDummyAnnotation(
      1,
      VisionDetectionModelType.OCR,
      {
        confidence: 0.8,
        shape: RegionShape.Rectangle,
        vertices: [
          { x: 0, y: 0.1 },
          { x: 1, y: 0.3 },
        ],
      }
    );

    expect(
      convertCDFAnnotationV1ToVisionAnnotation(cdfAnnotationWithOCR)
    ).toStrictEqual({
      id: cdfAnnotationWithOCR.id,
      annotatedResourceId: cdfAnnotationWithOCR.annotatedResourceId,
      createdTime: cdfAnnotationWithOCR.createdTime,
      lastUpdatedTime: cdfAnnotationWithOCR.lastUpdatedTime,
      status: Status.Suggested,
      confidence: cdfAnnotationWithOCR.data?.confidence,
      text: cdfAnnotationWithOCR.text,
      annotationType: CDFAnnotationTypeEnum.ImagesTextRegion,
      textRegion: {
        xMin: cdfAnnotationWithOCR.region?.vertices[0].x,
        yMin: cdfAnnotationWithOCR.region?.vertices[0].y,
        xMax: cdfAnnotationWithOCR.region?.vertices[1].x,
        yMax: cdfAnnotationWithOCR.region?.vertices[1].y,
      },
    } as VisionImageExtractedTextAnnotation);

    const cdfAnnotationWithTag = getDummyAnnotation(
      1,
      VisionDetectionModelType.TagDetection,
      {
        confidence: 0.8,
        shape: RegionShape.Rectangle,
        vertices: [
          { x: 0, y: 0.1 },
          { x: 1, y: 0.3 },
        ],
        assetId: 1,
      }
    );

    expect(
      convertCDFAnnotationV1ToVisionAnnotation(cdfAnnotationWithTag)
    ).toStrictEqual({
      id: cdfAnnotationWithTag.id,
      annotatedResourceId: cdfAnnotationWithTag.annotatedResourceId,
      createdTime: cdfAnnotationWithTag.createdTime,
      lastUpdatedTime: cdfAnnotationWithTag.lastUpdatedTime,
      status: Status.Suggested,
      confidence: cdfAnnotationWithTag.data?.confidence,
      annotationType: CDFAnnotationTypeEnum.ImagesAssetLink,
      textRegion: {
        xMin: cdfAnnotationWithTag.region?.vertices[0].x,
        yMin: cdfAnnotationWithTag.region?.vertices[0].y,
        xMax: cdfAnnotationWithTag.region?.vertices[1].x,
        yMax: cdfAnnotationWithTag.region?.vertices[1].y,
      },
      text: cdfAnnotationWithTag.text,
      assetRef: { id: cdfAnnotationWithTag.linkedResourceId },
    } as VisionImageAssetLinkAnnotation);

    const cdfAnnotationWithKeypoint = getDummyAnnotation(
      1,
      VisionDetectionModelType.ObjectDetection,
      {
        confidence: 0.8,
        shape: RegionShape.Points,
        vertices: [
          { x: 0, y: 0.1 },
          { x: 1, y: 0.3 },
        ],
        data: {
          keypoint: true,
          keypoints: [{ caption: 'one' }, { caption: 'two' }] as KeypointItem[],
        },
      }
    );

    expect(
      convertCDFAnnotationV1ToVisionAnnotation(cdfAnnotationWithKeypoint)
    ).toStrictEqual({
      id: cdfAnnotationWithKeypoint.id,
      annotatedResourceId: cdfAnnotationWithKeypoint.annotatedResourceId,
      createdTime: cdfAnnotationWithKeypoint.createdTime,
      lastUpdatedTime: cdfAnnotationWithKeypoint.lastUpdatedTime,
      status: Status.Suggested,
      confidence: cdfAnnotationWithKeypoint.data?.confidence,
      label: cdfAnnotationWithKeypoint.text,
      annotationType: CDFAnnotationTypeEnum.ImagesKeypointCollection,
      keypoints: cdfAnnotationWithKeypoint.region!.vertices.map(
        (item, index) => ({
          point: item,
          label: cdfAnnotationWithKeypoint.data!.keypoints![index].caption,
          confidence: cdfAnnotationWithKeypoint.data?.confidence,
        })
      ),
    } as VisionImageKeypointCollectionAnnotation);

    const cdfAnnotationWithObjectDetection = getDummyAnnotation(
      1,
      VisionDetectionModelType.ObjectDetection,
      {
        confidence: 0.8,
        shape: RegionShape.Rectangle,
        vertices: [
          { x: 0, y: 0.1 },
          { x: 1, y: 0.3 },
        ],
      }
    );

    expect(
      convertCDFAnnotationV1ToVisionAnnotation(cdfAnnotationWithObjectDetection)
    ).toStrictEqual({
      id: cdfAnnotationWithObjectDetection.id,
      annotatedResourceId: cdfAnnotationWithObjectDetection.annotatedResourceId,
      createdTime: cdfAnnotationWithObjectDetection.createdTime,
      lastUpdatedTime: cdfAnnotationWithObjectDetection.lastUpdatedTime,
      confidence: cdfAnnotationWithObjectDetection.data?.confidence,
      status: Status.Suggested,
      label: cdfAnnotationWithObjectDetection.text,
      annotationType: CDFAnnotationTypeEnum.ImagesObjectDetection,

      boundingBox: {
        xMin: cdfAnnotationWithObjectDetection.region?.vertices[0].x,
        yMin: cdfAnnotationWithObjectDetection.region?.vertices[0].y,
        xMax: cdfAnnotationWithObjectDetection.region?.vertices[1].x,
        yMax: cdfAnnotationWithObjectDetection.region?.vertices[1].y,
      },
    } as VisionImageObjectDetectionAnnotation);

    const cdfAnnotationWithPolygon = getDummyAnnotation(
      1,
      VisionDetectionModelType.ObjectDetection,
      {
        confidence: 0.8,
        shape: RegionShape.Polygon,
        vertices: [
          { x: 0, y: 0.1 },
          { x: 0.3, y: 0.5 },
          { x: 1, y: 1 },
        ],
      }
    );

    expect(
      convertCDFAnnotationV1ToVisionAnnotation(cdfAnnotationWithPolygon)
    ).toStrictEqual({
      id: cdfAnnotationWithPolygon.id,
      annotatedResourceId: cdfAnnotationWithPolygon.annotatedResourceId,
      createdTime: cdfAnnotationWithPolygon.createdTime,
      lastUpdatedTime: cdfAnnotationWithPolygon.lastUpdatedTime,
      confidence: cdfAnnotationWithPolygon.data?.confidence,
      status: Status.Suggested,
      label: cdfAnnotationWithPolygon.text,
      annotationType: CDFAnnotationTypeEnum.ImagesObjectDetection,
      polygon: {
        vertices: cdfAnnotationWithPolygon.region?.vertices,
      },
    } as VisionImageObjectDetectionAnnotation);

    const cdfAnnotationWithPolyline = getDummyAnnotation(
      1,
      VisionDetectionModelType.ObjectDetection,
      {
        confidence: 0.8,
        shape: RegionShape.Polyline,
        vertices: [
          { x: 0, y: 0.1 },
          { x: 1, y: 0.3 },
        ],
      }
    );

    expect(
      convertCDFAnnotationV1ToVisionAnnotation(cdfAnnotationWithPolyline)
    ).toStrictEqual({
      id: cdfAnnotationWithPolyline.id,
      annotatedResourceId: cdfAnnotationWithPolyline.annotatedResourceId,
      createdTime: cdfAnnotationWithPolyline.createdTime,
      lastUpdatedTime: cdfAnnotationWithPolyline.lastUpdatedTime,
      confidence: cdfAnnotationWithPolyline.data?.confidence,
      status: Status.Suggested,
      label: cdfAnnotationWithPolyline.text,
      annotationType: CDFAnnotationTypeEnum.ImagesObjectDetection,
      polyline: {
        vertices: cdfAnnotationWithPolyline.region?.vertices,
      },
    } as VisionImageObjectDetectionAnnotation);
  });
});
