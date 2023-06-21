import {
  CDFAnnotationTypeEnum,
  RegionShape,
  Status,
} from 'src/api/annotation/types';
import {
  convertVisionJobAnnotationToImageAssetLinkList,
  convertVisionJobAnnotationToImageClassification,
  convertVisionJobAnnotationToImageExtractedText,
  convertVisionJobAnnotationToImageKeypointCollection,
  convertVisionJobAnnotationToImageObjectDetectionBoundingBox,
  convertVisionJobResultItemToUnsavedVisionAnnotation,
  convertVisionJobResultsToUnsavedVisionAnnotations,
} from 'src/api/vision/detectionModels/converters';
import {
  GaugeReaderJobAnnotation,
  LegacyVisionJobResultItem,
  VisionDetectionModelType,
  VisionJobAnnotation,
} from 'src/api/vision/detectionModels/types';
import {
  UnsavedVisionAnnotation,
  VisionAnnotationDataType,
} from 'src/modules/Common/types';

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
    const visionJobResultItem = {} as LegacyVisionJobResultItem;
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
    } as LegacyVisionJobResultItem;

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
    } as LegacyVisionJobResultItem;

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
    } as LegacyVisionJobResultItem;

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
    } as LegacyVisionJobResultItem;

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
    } as LegacyVisionJobResultItem;

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

const getDummyUnsavedAnnotation = (
  data: VisionAnnotationDataType,
  fileId: number,
  type: CDFAnnotationTypeEnum,
  status = Status.Suggested
): UnsavedVisionAnnotation<VisionAnnotationDataType> => {
  return {
    data,
    status,
    annotatedResourceId: fileId,
    annotationType: type,
  };
};

describe('convertVisionJobResultsToUnsavedVisionAnnotations', () => {
  test('empty job results', () => {
    Object.keys(VisionDetectionModelType).forEach((key) => {
      expect(
        convertVisionJobResultsToUnsavedVisionAnnotations(
          [],
          key as unknown as VisionDetectionModelType
        )
      ).toStrictEqual([]);
    });
  });

  describe('Test UnifiedVisionJobResultItems', () => {
    test('should return correct annotations for annotate service text predictions', () => {
      const textPredictions = [
        {
          fileId: 1,
          predictions: {
            textPredictions: [
              {
                confidence: 0.885,
                text: 'D',
                textRegion: {
                  xMax: 0.7076023391812866,
                  xMin: 0.7022860180754918,
                  yMax: 0.32196969696969696,
                  yMin: 0.3162878787878788,
                },
              },
            ],
          },
        },
      ];
      expect(
        convertVisionJobResultsToUnsavedVisionAnnotations(
          textPredictions,
          VisionDetectionModelType.OCR
        )
      ).toStrictEqual(
        expect.arrayContaining([
          expect.objectContaining(
            getDummyUnsavedAnnotation(
              textPredictions[0].predictions.textPredictions[0],
              textPredictions[0].fileId,
              CDFAnnotationTypeEnum.ImagesTextRegion
            )
          ),
        ])
      );
      expect(
        convertVisionJobResultsToUnsavedVisionAnnotations(
          textPredictions,
          VisionDetectionModelType.OCR
        ).length
      ).toEqual(1);
    });
    test('should return correct annotations for annotate service asset tag predictions', () => {
      const assetTagPredictions = [
        {
          fileId: 1,
          predictions: {
            assetTagPredictions: [],
          },
        },
        {
          fileId: 2,
          predictions: {
            assetTagPredictions: [
              {
                assetRef: {
                  id: 737663757708986,
                },
                confidence: 1.0,
                text: '43-PT-0054',
                textRegion: {
                  xMax: 0.5113357843137255,
                  xMin: 0.49417892156862747,
                  yMax: 0.6066176470588236,
                  yMin: 0.6013071895424836,
                },
              },
            ],
          },
        },
      ];
      expect(
        convertVisionJobResultsToUnsavedVisionAnnotations(
          assetTagPredictions,
          VisionDetectionModelType.TagDetection
        )
      ).toStrictEqual(
        expect.arrayContaining([
          expect.objectContaining(
            getDummyUnsavedAnnotation(
              assetTagPredictions[1].predictions.assetTagPredictions[0],
              assetTagPredictions[1].fileId,
              CDFAnnotationTypeEnum.ImagesAssetLink
            )
          ),
        ])
      );
      expect(
        convertVisionJobResultsToUnsavedVisionAnnotations(
          assetTagPredictions,
          VisionDetectionModelType.TagDetection
        ).length
      ).toEqual(1);
    });
    test('should return correct annotations for annotate service object predictions', () => {
      const objectPredictions = [
        {
          fileId: 1,
          predictions: {
            industrialObjectPredictions: [],
          },
        },
        {
          fileId: 2,
          predictions: {
            industrialObjectPredictions: [
              {
                boundingBox: {
                  xMax: 0.47071415185928345,
                  xMin: 0.36518990993499756,
                  yMax: 0.8173280954360962,
                  yMin: 0.6837586164474487,
                },
                confidence: 0.70703125,
                label: 'valve',
              },
            ],
          },
        },
      ];
      expect(
        convertVisionJobResultsToUnsavedVisionAnnotations(
          objectPredictions,
          VisionDetectionModelType.ObjectDetection
        )
      ).toStrictEqual(
        expect.arrayContaining([
          expect.objectContaining(
            getDummyUnsavedAnnotation(
              objectPredictions[1].predictions.industrialObjectPredictions[0],
              objectPredictions[1].fileId,
              CDFAnnotationTypeEnum.ImagesObjectDetection
            )
          ),
        ])
      );
      expect(
        convertVisionJobResultsToUnsavedVisionAnnotations(
          objectPredictions,
          VisionDetectionModelType.ObjectDetection
        ).length
      ).toEqual(1);
    });
    test('should return correct annotations for annotate service people predictions', () => {
      const peoplePredictions = [
        {
          fileId: 1,
          predictions: {
            peoplePredictions: [
              {
                boundingBox: {
                  xMax: 0.5155458450317383,
                  xMin: 0.3443277180194855,
                  yMax: 0.6282840967178345,
                  yMin: 0.07562699913978577,
                },
                confidence: 0.8164102435112,
                label: 'person',
              },
            ],
          },
        },
      ];
      expect(
        convertVisionJobResultsToUnsavedVisionAnnotations(
          peoplePredictions,
          VisionDetectionModelType.PeopleDetection
        )
      ).toStrictEqual(
        expect.arrayContaining([
          expect.objectContaining(
            getDummyUnsavedAnnotation(
              peoplePredictions[0].predictions.peoplePredictions[0],
              peoplePredictions[0].fileId,
              CDFAnnotationTypeEnum.ImagesObjectDetection
            )
          ),
        ])
      );
      expect(
        convertVisionJobResultsToUnsavedVisionAnnotations(
          peoplePredictions,
          VisionDetectionModelType.PeopleDetection
        ).length
      ).toEqual(1);
    });
  });
  describe('test LegacyVisionJobResultItems', () => {
    test('should return correct annotations for gauge detection endpoint', () => {
      const gaugeDetectionAnnotations: LegacyVisionJobResultItem[] = [
        {
          annotations: [
            {
              confidence: 0.9375,
              region: {
                shape: 'rectangle',
                vertices: [
                  {
                    x: 0.30392156862745096,
                    y: 0.4169730392156863,
                  },
                  {
                    x: 0.4963235294117647,
                    y: 0.5637254901960784,
                  },
                ],
              },
              text: 'digital-gauge',
            },
          ],
          fileId: 1,
          height: 3264,
          width: 2448,
        },
      ];
      expect(
        convertVisionJobResultsToUnsavedVisionAnnotations(
          gaugeDetectionAnnotations,
          VisionDetectionModelType.GaugeReader
        )
      ).toStrictEqual(
        expect.arrayContaining([
          expect.objectContaining(
            getDummyUnsavedAnnotation(
              {
                confidence:
                  gaugeDetectionAnnotations[0].annotations[0].confidence,
                label: gaugeDetectionAnnotations[0].annotations[0].text,
                boundingBox: {
                  xMin: gaugeDetectionAnnotations[0].annotations[0].region!
                    .vertices[0].x,
                  xMax: gaugeDetectionAnnotations[0].annotations[0].region!
                    .vertices[1].x,
                  yMin: gaugeDetectionAnnotations[0].annotations[0].region!
                    .vertices[0].y,
                  yMax: gaugeDetectionAnnotations[0].annotations[0].region!
                    .vertices[1].y,
                },
              },
              gaugeDetectionAnnotations[0].fileId,
              CDFAnnotationTypeEnum.ImagesObjectDetection
            )
          ),
        ])
      );
      expect(
        convertVisionJobResultsToUnsavedVisionAnnotations(
          gaugeDetectionAnnotations,
          VisionDetectionModelType.GaugeReader
        ).length
      ).toEqual(1);
    });
  });
});
