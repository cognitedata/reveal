import {
  convertVisionJobAnnotationToImageAssetLinkList,
  convertVisionJobAnnotationToImageClassification,
  convertVisionJobAnnotationToImageExtractedText,
  convertVisionJobAnnotationToImageKeypointCollection,
  convertVisionJobAnnotationToImageObjectDetectionBoundingBox,
  convertVisionJobResultItemToUnsavedVisionAnnotation,
} from 'src/api/vision/detectionModels/converters';
import {
  CDFAnnotationTypeEnum,
  RegionShape,
  Status,
} from 'src/api/annotation/types';
import {
  GaugeReaderJobAnnotation,
  VisionDetectionModelType,
  VisionJobAnnotation,
  VisionJobResultItem,
} from 'src/api/vision/detectionModels/types';

describe('convertVisionJobAnnotationToImageClassification', () => {
  test('Missing confidence and label', () => {
    const visionJobAnnotation = {} as VisionJobAnnotation;
    expect(
      convertVisionJobAnnotationToImageClassification(visionJobAnnotation)
    ).toStrictEqual({ confidence: undefined, label: undefined });
  });

  test('Region ignored - valid ImageClassification', () => {
    const visionJobAnnotation = {
      confidence: 0.1,
      text: 'gauge',
      region: {
        shape: RegionShape.Rectangle,
        vertices: [
          { x: 0, y: 0.1 },
          { x: 1, y: 0.3 },
        ],
      },
    } as VisionJobAnnotation;
    expect(
      convertVisionJobAnnotationToImageClassification(visionJobAnnotation)
    ).toStrictEqual({ confidence: 0.1, label: 'gauge' });
  });
});

describe('convertVisionJobAnnotationToImageObjectDetectionBoundingBox', () => {
  const boundingBox = {
    region: {
      shape: RegionShape.Rectangle,
      vertices: [
        { x: 0, y: 0.1 },
        { x: 1, y: 0.3 },
      ],
    },
  };
  test('Invalid boundingbox', () => {
    const visionJobAnnotation = {} as VisionJobAnnotation;
    const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

    expect(
      convertVisionJobAnnotationToImageObjectDetectionBoundingBox(
        visionJobAnnotation
      )
    ).toStrictEqual(null);
    expect(consoleSpy).toHaveBeenCalled();
  });

  test('Should return converted type', () => {
    const visionJobAnnotation = {
      text: 'gauge',
      confidence: 0.1,
      ...boundingBox,
    } as VisionJobAnnotation;
    expect(
      convertVisionJobAnnotationToImageObjectDetectionBoundingBox(
        visionJobAnnotation
      )
    ).toStrictEqual({
      confidence: visionJobAnnotation.confidence,
      label: visionJobAnnotation.text,
      boundingBox: {
        xMin: boundingBox.region.vertices[0].x,
        yMin: boundingBox.region.vertices[0].y,
        xMax: boundingBox.region.vertices[1].x,
        yMax: boundingBox.region.vertices[1].y,
      },
    });
  });
});

describe('convertVisionJobAnnotationToImageExtractedText', () => {
  const boundingBox = {
    region: {
      shape: RegionShape.Rectangle,
      vertices: [
        { x: 0, y: 0.1 },
        { x: 1, y: 0.3 },
      ],
    },
  };
  test('Invalid boundingbox', () => {
    const visionJobAnnotation = {} as VisionJobAnnotation;
    const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

    expect(
      convertVisionJobAnnotationToImageExtractedText(visionJobAnnotation)
    ).toStrictEqual(null);
    expect(consoleSpy).toHaveBeenCalled();
  });

  test('Should return converted type', () => {
    const visionJobAnnotation = {
      text: 'gauge',
      confidence: 0.1,
      ...boundingBox,
    } as VisionJobAnnotation;
    expect(
      convertVisionJobAnnotationToImageExtractedText(visionJobAnnotation)
    ).toStrictEqual({
      confidence: visionJobAnnotation.confidence,
      text: visionJobAnnotation.text,
      textRegion: {
        xMin: boundingBox.region.vertices[0].x,
        yMin: boundingBox.region.vertices[0].y,
        xMax: boundingBox.region.vertices[1].x,
        yMax: boundingBox.region.vertices[1].y,
      },
    });
  });
});

describe('convertVisionJobAnnotationToImageAssetLinkList', () => {
  const boundingBox = {
    region: {
      shape: RegionShape.Rectangle,
      vertices: [
        { x: 0, y: 0.1 },
        { x: 1, y: 0.3 },
      ],
    },
  };
  test('Invalid boundingbox', () => {
    const visionJobAnnotation = {} as VisionJobAnnotation;
    const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

    expect(
      convertVisionJobAnnotationToImageAssetLinkList(visionJobAnnotation)
    ).toStrictEqual(null);
    expect(consoleSpy).toHaveBeenCalled();
  });

  test('Invalid assetIds', () => {
    const visionJobAnnotation = {
      ...boundingBox,
      assetIds: [] as number[],
    } as VisionJobAnnotation;
    const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

    expect(
      convertVisionJobAnnotationToImageAssetLinkList(visionJobAnnotation)
    ).toStrictEqual(null);
    expect(consoleSpy).toHaveBeenCalled();
  });

  test('Should return converted type', () => {
    const visionJobAnnotation = {
      text: 'asset',
      confidence: 0.1,
      assetIds: [1, 2],
      ...boundingBox,
    } as VisionJobAnnotation;
    expect(
      convertVisionJobAnnotationToImageAssetLinkList(visionJobAnnotation)
    ).toStrictEqual([
      {
        text: 'asset',
        confidence: visionJobAnnotation.confidence,
        assetRef: { id: 1 },
        textRegion: {
          xMin: boundingBox.region.vertices[0].x,
          yMin: boundingBox.region.vertices[0].y,
          xMax: boundingBox.region.vertices[1].x,
          yMax: boundingBox.region.vertices[1].y,
        },
      },
      {
        text: 'asset',
        confidence: visionJobAnnotation.confidence,
        assetRef: { id: 2 },
        textRegion: {
          xMin: boundingBox.region.vertices[0].x,
          yMin: boundingBox.region.vertices[0].y,
          xMax: boundingBox.region.vertices[1].x,
          yMax: boundingBox.region.vertices[1].y,
        },
      },
    ]);
  });
});

describe('convertVisionJobAnnotationToImageKeypointCollection', () => {
  const points = {
    region: {
      shape: RegionShape.Points,
      vertices: [
        { x: 0, y: 0.1 },
        { x: 1, y: 0.3 },
      ],
    },
  };
  test('Invalid keypoint collection', () => {
    const visionJobAnnotation = {} as VisionJobAnnotation;
    const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

    expect(
      convertVisionJobAnnotationToImageKeypointCollection(visionJobAnnotation)
    ).toStrictEqual(null);
    expect(consoleSpy).toHaveBeenCalled();
  });

  test('Should return converted type', () => {
    const visionJobAnnotation = {
      text: 'gauge',
      confidence: 0.1,
      data: {
        keypointNames: ['left', 'right'],
        gauge_value: 1.2,
      },
      ...points,
    } as VisionJobAnnotation;
    expect(
      convertVisionJobAnnotationToImageKeypointCollection(visionJobAnnotation)
    ).toStrictEqual({
      confidence: visionJobAnnotation.confidence,
      label: visionJobAnnotation.text,
      attributes: {
        // unit: {
        //   type: 'unit',
        //   value: (visionJobAnnotation as GaugeReaderJobAnnotation).data.unit,
        // },
        gaugeValue: {
          type: 'numerical',
          value: (visionJobAnnotation as GaugeReaderJobAnnotation).data
            .gauge_value,
        },
      },
      keypoints: Object.fromEntries(
        visionJobAnnotation.region?.vertices.map((vertex, index) => [
          (visionJobAnnotation as GaugeReaderJobAnnotation).data.keypointNames[
            index
          ],
          {
            confidence: visionJobAnnotation.confidence,
            point: vertex,
          },
        ]) || []
      ),
    });
  });
});

describe('convertVisionJobResultItemToUnsavedVisionAnnotation', () => {
  const rectangleShape = {
    region: {
      shape: RegionShape.Rectangle,
      vertices: [
        { x: 0, y: 0.1 },
        { x: 1, y: 0.3 },
      ],
    },
  };
  test('Non existing model type', () => {
    const visionJobResultItem = {} as VisionJobResultItem;
    const visionDetectionModelType = 10 as VisionDetectionModelType;

    expect(
      convertVisionJobResultItemToUnsavedVisionAnnotation(
        visionJobResultItem,
        visionDetectionModelType
      )
    ).toStrictEqual([]);
  });

  test('Invalid type (missing bounding box)', () => {
    const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

    const visionJobResultItem = {
      fileId: 1,
      annotations: [
        {
          text: 'gauge',
          confidence: 0.1,
        },
      ],
    } as VisionJobResultItem;

    [
      VisionDetectionModelType.OCR,
      VisionDetectionModelType.ObjectDetection,
      VisionDetectionModelType.TagDetection, // exclude custom model since it will fallback to classification
    ].forEach((visionDetectionModelType) => {
      expect(
        convertVisionJobResultItemToUnsavedVisionAnnotation(
          visionJobResultItem,
          visionDetectionModelType
        )
      ).toStrictEqual([]);
      expect(consoleSpy).toHaveBeenCalled();
    });
  });

  test('Valid type (objectDetection and custom model)', () => {
    const visionJobAnnotation = {
      text: 'gauge',
      confidence: 0.1,
      ...rectangleShape,
    } as VisionJobAnnotation;

    const visionJobResultItem = {
      fileId: 1,
      annotations: [visionJobAnnotation],
    } as VisionJobResultItem;

    [
      VisionDetectionModelType.ObjectDetection,
      VisionDetectionModelType.CustomModel,
    ].forEach((visionDetectionModelType) => {
      expect(
        convertVisionJobResultItemToUnsavedVisionAnnotation(
          visionJobResultItem,
          visionDetectionModelType
        )
      ).toStrictEqual([
        {
          annotationType: CDFAnnotationTypeEnum.ImagesObjectDetection,
          annotatedResourceId: visionJobResultItem.fileId,
          status: Status.Suggested,
          data: {
            label: visionJobAnnotation.text,
            confidence: visionJobAnnotation.confidence,
            boundingBox: {
              xMin: rectangleShape.region.vertices[0].x,
              yMin: rectangleShape.region.vertices[0].y,
              xMax: rectangleShape.region.vertices[1].x,
              yMax: rectangleShape.region.vertices[1].y,
            },
          },
        },
      ]);
    });
  });

  test('Valid type (textDetection)', () => {
    const visionJobAnnotation = {
      text: 'gauge',
      confidence: 0.1,
      assetIds: [1],
      ...rectangleShape,
    } as VisionJobAnnotation;

    const visionJobResultItem = {
      fileId: 1,
      annotations: [visionJobAnnotation],
    } as VisionJobResultItem;

    expect(
      convertVisionJobResultItemToUnsavedVisionAnnotation(
        visionJobResultItem,
        VisionDetectionModelType.OCR
      )
    ).toStrictEqual([
      {
        annotationType: CDFAnnotationTypeEnum.ImagesTextRegion,
        annotatedResourceId: visionJobResultItem.fileId,
        status: Status.Suggested,
        data: {
          text: visionJobAnnotation.text,
          confidence: visionJobAnnotation.confidence,
          textRegion: {
            xMin: rectangleShape.region.vertices[0].x,
            yMin: rectangleShape.region.vertices[0].y,
            xMax: rectangleShape.region.vertices[1].x,
            yMax: rectangleShape.region.vertices[1].y,
          },
        },
      },
    ]);
  });

  test('Valid type (tagDetection)', () => {
    const visionJobAnnotation = {
      text: 'gauge',
      confidence: 0.1,
      assetIds: [1],
      ...rectangleShape,
    } as VisionJobAnnotation;

    const visionJobResultItem = {
      fileId: 1,
      annotations: [visionJobAnnotation],
    } as VisionJobResultItem;

    expect(
      convertVisionJobResultItemToUnsavedVisionAnnotation(
        visionJobResultItem,
        VisionDetectionModelType.TagDetection
      )
    ).toStrictEqual([
      {
        annotationType: CDFAnnotationTypeEnum.ImagesAssetLink,
        annotatedResourceId: visionJobResultItem.fileId,
        status: Status.Suggested,
        data: {
          text: visionJobAnnotation.text,
          confidence: visionJobAnnotation.confidence,
          assetRef: {
            id: 1,
          },
          textRegion: {
            xMin: rectangleShape.region.vertices[0].x,
            yMin: rectangleShape.region.vertices[0].y,
            xMax: rectangleShape.region.vertices[1].x,
            yMax: rectangleShape.region.vertices[1].y,
          },
        },
      },
    ]);
  });

  test('Valid type (custom model classification)', () => {
    const visionJobAnnotation = {
      text: 'gauge',
      confidence: 0.1,
    } as VisionJobAnnotation;

    const visionJobResultItem = {
      fileId: 1,
      annotations: [visionJobAnnotation],
    } as VisionJobResultItem;

    expect(
      convertVisionJobResultItemToUnsavedVisionAnnotation(
        visionJobResultItem,
        VisionDetectionModelType.CustomModel
      )
    ).toStrictEqual([
      {
        annotationType: CDFAnnotationTypeEnum.ImagesClassification,
        annotatedResourceId: visionJobResultItem.fileId,
        status: Status.Suggested,
        data: {
          label: visionJobAnnotation.text,
          confidence: visionJobAnnotation.confidence,
        },
      },
    ]);
  });
});
