import {
  getDummyImageAssetLinkAnnotation,
  getDummyImageClassificationAnnotation,
  getDummyImageExtractedTextAnnotation,
  getDummyImageKeypointCollectionAnnotation,
  getDummyImageObjectDetectionBoundingBoxAnnotation,
  getDummyImageObjectDetectionPolygonAnnotation,
  getDummyImageObjectDetectionPolylineAnnotation,
  getDummyUnsavedAnnotation,
  getDummyVisionReviewAnnotation,
} from 'src/__test-utils/getDummyAnnotations';
import {
  CDFAnnotationTypeEnum,
  ImageKeypointCollection,
  ImageObjectDetectionPolygon,
  Status,
} from 'src/api/annotation/types';
import {
  convertRegionToUnsavedVisionAnnotation,
  convertTempKeypointCollectionToRegions,
  convertVisionReviewAnnotationsToRegions,
  convertVisionReviewAnnotationToRegions,
} from 'src/modules/Review/Components/ReactImageAnnotateWrapper/converters';
import { VisionAnnotationDataType } from 'src/modules/Common/types';
import {
  AnnotatorBoxRegion,
  AnnotatorLineRegion,
  AnnotatorPointRegion,
  AnnotatorPolygonRegion,
  AnnotatorRegion,
  AnnotatorRegionType,
} from 'src/modules/Review/Components/ReactImageAnnotateWrapper/types';
import {
  TempKeypointCollection,
  VisionReviewAnnotation,
} from 'src/modules/Review/types';
import { getDummyTempKeypointCollection } from 'src/__test-utils/annotations';
import {
  getDummyRegion,
  getDummyRegionOriginatedInAnnotator,
} from 'src/modules/Review/Components/ReactImageAnnotateWrapper/__test-utils/region';

const dummyImageClassificationAnnotation =
  getDummyImageClassificationAnnotation({
    id: 1,
    annotatedResourceId: 10,
    label: 'foo',
    status: Status.Suggested,
  });
const dummyImageObjectDetectionBoundingBoxAnnotation =
  getDummyImageObjectDetectionBoundingBoxAnnotation({
    id: 2,
    label: 'pump',
    boundingBox: {
      xMin: 0,
      yMin: 0,
      xMax: 1,
      yMax: 1,
    },
    annotatedResourceId: 10,
  });

const dummyImageObjectDetectionPolygonAnnotation =
  getDummyImageObjectDetectionPolygonAnnotation({
    id: 3,
    annotatedResourceId: 10,
    label: 'testPolygon',
    polygon: {
      vertices: [
        { x: 0, y: 0 },
        { x: 1, y: 1 },
        { x: 0.5, y: 0.5 },
      ],
    },
  });

const dummyImageObjectDetectionPolylineAnnotation =
  getDummyImageObjectDetectionPolylineAnnotation({
    id: 4,
    annotatedResourceId: 10,
    label: 'testPolyline',
    polyline: {
      vertices: [
        { x: 0, y: 0 },
        { x: 1, y: 1 },
      ],
    },
  });

const dummyImageExtractedTextAnnotation = getDummyImageExtractedTextAnnotation({
  id: 5,
  annotatedResourceId: 10,
  text: 'test',
  textRegion: {
    xMin: 0,
    yMin: 0,
    xMax: 1,
    yMax: 1,
  },
});

const dummyImageAssetLinkTextAnnotation = getDummyImageAssetLinkAnnotation({
  id: 6,
  annotatedResourceId: 10,
  text: 'asset-link',
  textRegion: {
    xMin: 0,
    yMin: 0,
    xMax: 1,
    yMax: 1,
  },
});

const dummyImageKeypointCollectionAnnotation =
  getDummyImageKeypointCollectionAnnotation({
    id: 7,
    annotatedResourceId: 10,
    keypoints: [
      { label: 'one', point: { x: 0, y: 0 }, confidence: 0.5 },
      { label: 'two', point: { x: 1, y: 1 }, confidence: 0.5 },
    ],
  });

const dummyImageClassificationReviewAnnotation = getDummyVisionReviewAnnotation(
  dummyImageClassificationAnnotation,
  true,
  true
);
const dummyImageAssetLinkReviewAnnotation = getDummyVisionReviewAnnotation(
  dummyImageAssetLinkTextAnnotation,
  true,
  true
);
const dummyImageExtractedTextReviewAnnotation = getDummyVisionReviewAnnotation(
  dummyImageExtractedTextAnnotation,
  true,
  true
);
const dummyImageBoundingBoxReviewAnnotation = getDummyVisionReviewAnnotation(
  dummyImageObjectDetectionBoundingBoxAnnotation,
  true,
  true
);
const dummyImagePolygonReviewAnnotation = getDummyVisionReviewAnnotation(
  dummyImageObjectDetectionPolygonAnnotation,
  true,
  true
);
const dummyImagePolyLineReviewAnnotation = getDummyVisionReviewAnnotation(
  dummyImageObjectDetectionPolylineAnnotation,
  true,
  true
);
const dummyImageKeypointCollectionReviewAnnotation =
  getDummyVisionReviewAnnotation(
    dummyImageKeypointCollectionAnnotation,
    true,
    true
  ) as VisionReviewAnnotation<ImageKeypointCollection>;

const dummyTempKeypointCollection = getDummyTempKeypointCollection({});

describe('test convertVisionReviewAnnotationsToRegions', () => {
  it('should return empty if annotations are empty', () => {
    expect(convertVisionReviewAnnotationsToRegions([])).toEqual([]);
  });
  it('should return empty if invalid annotations are provided', () => {
    const consoleSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});
    expect(
      convertVisionReviewAnnotationsToRegions([
        {},
        {},
      ] as VisionReviewAnnotation<VisionAnnotationDataType>[])
    ).toEqual([]);
    expect(consoleSpy).toHaveBeenCalled();
  });
  it('should return correct regions for annotations', () => {
    expect(
      convertVisionReviewAnnotationsToRegions([
        dummyImageClassificationReviewAnnotation,
        dummyImageBoundingBoxReviewAnnotation,
        dummyImageKeypointCollectionReviewAnnotation,
      ])
    ).toEqual([
      {
        ...getDummyRegion<AnnotatorBoxRegion>({
          reviewAnnotation: dummyImageBoundingBoxReviewAnnotation,
          visible: dummyImageBoundingBoxReviewAnnotation.show,
          editingLabels: dummyImageBoundingBoxReviewAnnotation.selected,
          highlighted: dummyImageBoundingBoxReviewAnnotation.selected,
          regionProps: {
            type: AnnotatorRegionType.BoxRegion,
            x: dummyImageObjectDetectionBoundingBoxAnnotation.boundingBox.xMin,
            y: dummyImageObjectDetectionBoundingBoxAnnotation.boundingBox.yMin,
            w:
              dummyImageObjectDetectionBoundingBoxAnnotation.boundingBox.xMax -
              dummyImageObjectDetectionBoundingBoxAnnotation.boundingBox.xMin,
            h:
              dummyImageObjectDetectionBoundingBoxAnnotation.boundingBox.yMax -
              dummyImageObjectDetectionBoundingBoxAnnotation.boundingBox.yMin,
          },
        }),
      },
      ...dummyImageKeypointCollectionReviewAnnotation.annotation.keypoints.map(
        (keypoint) => ({
          ...getDummyRegion<AnnotatorPointRegion>({
            reviewAnnotation: dummyImageKeypointCollectionReviewAnnotation,
            id: keypoint.id,
            visible: dummyImageKeypointCollectionReviewAnnotation.show,
            highlighted: true,
            editingLabels: keypoint.selected,
            tags: [],
            regionProps: {
              type: AnnotatorRegionType.PointRegion,
              parentAnnotationId: dummyImageKeypointCollectionAnnotation.id,
              keypointLabel: keypoint.keypoint.label,
              keypointConfidence: keypoint.keypoint.confidence,
              x: keypoint.keypoint.point.x,
              y: keypoint.keypoint.point.y,
            },
          }),
        })
      ),
    ]);
  });
});

describe('test convertVisionReviewAnnotationToRegions', () => {
  it('should return empty if empty', () => {
    const consoleSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});
    expect(
      convertVisionReviewAnnotationToRegions(
        {} as VisionReviewAnnotation<VisionAnnotationDataType>
      )
    ).toEqual([]);
    expect(consoleSpy).toHaveBeenCalled();
  });
  it('should return empty if annotation is missing', () => {
    const consoleSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});
    expect(
      convertVisionReviewAnnotationToRegions({
        show: true,
        selected: true,
      } as VisionReviewAnnotation<VisionAnnotationDataType>)
    ).toEqual([]);
    expect(consoleSpy).toHaveBeenCalled();
  });
  it('should return empty if annotation id is missing', () => {
    const consoleSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});
    expect(
      convertVisionReviewAnnotationToRegions({
        ...dummyImageKeypointCollectionReviewAnnotation,
        annotation: {
          ...dummyImageKeypointCollectionReviewAnnotation.annotation,
          id: undefined!,
        },
      } as VisionReviewAnnotation<VisionAnnotationDataType>)
    ).toEqual([]);
    expect(consoleSpy).toHaveBeenCalled();
  });
  it('should return empty if annotation type is missing', () => {
    const consoleSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});
    expect(
      convertVisionReviewAnnotationToRegions({
        ...dummyImageKeypointCollectionReviewAnnotation,
        annotation: {
          ...dummyImageKeypointCollectionReviewAnnotation.annotation,
          annotationType: undefined!,
        },
      } as VisionReviewAnnotation<VisionAnnotationDataType>)
    ).toEqual([]);
    expect(consoleSpy).toHaveBeenCalled();
  });
  it('should return empty if status is missing', () => {
    const consoleSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});
    expect(
      convertVisionReviewAnnotationToRegions({
        ...dummyImageKeypointCollectionReviewAnnotation,
        annotation: {
          ...dummyImageKeypointCollectionReviewAnnotation.annotation,
          status: undefined!,
        },
      } as VisionReviewAnnotation<VisionAnnotationDataType>)
    ).toEqual([]);
    expect(consoleSpy).toHaveBeenCalled();
  });
  it('should return empty if any label is missing', () => {
    const consoleSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});
    expect(
      convertVisionReviewAnnotationToRegions({
        ...dummyImageKeypointCollectionReviewAnnotation,
        annotation: {
          ...dummyImageKeypointCollectionReviewAnnotation.annotation,
          label: undefined!,
        },
      } as VisionReviewAnnotation<VisionAnnotationDataType>)
    ).toEqual([]);
    expect(
      convertVisionReviewAnnotationToRegions({
        ...dummyImageKeypointCollectionReviewAnnotation,
        annotation: {
          ...dummyImageKeypointCollectionReviewAnnotation.annotation,
          label: '',
        },
      } as VisionReviewAnnotation<VisionAnnotationDataType>)
    ).toEqual([]);
    expect(consoleSpy).toHaveBeenCalled();
  });
  it('should return empty if keypoints are missing for ImageKeypointCollection annotations', () => {
    const consoleSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});
    expect(
      convertVisionReviewAnnotationToRegions({
        ...dummyImageKeypointCollectionReviewAnnotation,
        annotation: {
          ...dummyImageKeypointCollectionReviewAnnotation.annotation,
          keypoints: [],
        },
      } as VisionReviewAnnotation<VisionAnnotationDataType>)
    ).toEqual([]);
    expect(consoleSpy).toHaveBeenCalled();
  });
  it('should return empty for ImageClassification annotation', () => {
    expect(
      convertVisionReviewAnnotationToRegions(
        getDummyVisionReviewAnnotation(
          dummyImageClassificationAnnotation,
          true,
          true
        )
      )
    ).toEqual([]);
  });
  it('should return correct region if show field is not provided', () => {
    const dummyImagePolygonReviewAnnotationWithShowFalse = {
      ...dummyImagePolygonReviewAnnotation,
      show: undefined as unknown as boolean,
    } as VisionReviewAnnotation<ImageObjectDetectionPolygon>;
    expect(
      convertVisionReviewAnnotationToRegions(
        dummyImagePolygonReviewAnnotationWithShowFalse
      )
    ).toStrictEqual([
      {
        ...getDummyRegion<AnnotatorPolygonRegion>({
          reviewAnnotation: dummyImagePolygonReviewAnnotationWithShowFalse,
          visible: false,
          editingLabels:
            dummyImagePolygonReviewAnnotationWithShowFalse.selected,
          highlighted: dummyImagePolygonReviewAnnotationWithShowFalse.selected,
          regionProps: {
            type: AnnotatorRegionType.PolygonRegion,
            points:
              dummyImagePolygonReviewAnnotationWithShowFalse.annotation.polygon.vertices.map(
                (point) => [point.x, point.y]
              ),
          },
        }),
      },
    ] as AnnotatorPolygonRegion[]);
  });
  it('should return correct region if selected field is not provided', () => {
    const dummyImagePolygonReviewAnnotationWithSelectedFalse = {
      ...dummyImagePolygonReviewAnnotation,
      selected: undefined as unknown as boolean,
    } as VisionReviewAnnotation<ImageObjectDetectionPolygon>;
    expect(
      convertVisionReviewAnnotationToRegions(
        dummyImagePolygonReviewAnnotationWithSelectedFalse
      )
    ).toStrictEqual([
      {
        ...getDummyRegion<AnnotatorPolygonRegion>({
          reviewAnnotation: dummyImagePolygonReviewAnnotationWithSelectedFalse,
          visible: dummyImagePolygonReviewAnnotationWithSelectedFalse.show,
          editingLabels: false,
          highlighted: false,
          regionProps: {
            type: AnnotatorRegionType.PolygonRegion,
            points:
              dummyImagePolygonReviewAnnotationWithSelectedFalse.annotation.polygon.vertices.map(
                (point) => [point.x, point.y]
              ),
          },
        }),
      },
    ] as AnnotatorPolygonRegion[]);
  });
  it('should return correct region for ImageAssetLink Annotation', () => {
    expect(
      convertVisionReviewAnnotationToRegions(
        dummyImageAssetLinkReviewAnnotation
      )
    ).toStrictEqual([
      {
        ...getDummyRegion<AnnotatorBoxRegion>({
          reviewAnnotation: dummyImageAssetLinkReviewAnnotation,
          visible: dummyImageAssetLinkReviewAnnotation.show,
          editingLabels: dummyImageAssetLinkReviewAnnotation.selected,
          highlighted: dummyImageAssetLinkReviewAnnotation.selected,
          regionProps: {
            type: AnnotatorRegionType.BoxRegion,
            x: dummyImageAssetLinkTextAnnotation.textRegion.xMin,
            y: dummyImageAssetLinkTextAnnotation.textRegion.yMin,
            w:
              dummyImageAssetLinkTextAnnotation.textRegion.xMax -
              dummyImageAssetLinkTextAnnotation.textRegion.xMin,
            h:
              dummyImageAssetLinkTextAnnotation.textRegion.yMax -
              dummyImageAssetLinkTextAnnotation.textRegion.yMin,
          },
        }),
      },
    ] as AnnotatorBoxRegion[]);
  });
  it('should return correct region for ImageExtractedText Annotation', () => {
    expect(
      convertVisionReviewAnnotationToRegions(
        dummyImageExtractedTextReviewAnnotation
      )
    ).toEqual([
      {
        ...getDummyRegion<AnnotatorBoxRegion>({
          reviewAnnotation: dummyImageExtractedTextReviewAnnotation,
          visible: dummyImageExtractedTextReviewAnnotation.show,
          editingLabels: dummyImageExtractedTextReviewAnnotation.selected,
          highlighted: dummyImageExtractedTextReviewAnnotation.selected,
          regionProps: {
            type: AnnotatorRegionType.BoxRegion,
            x: dummyImageExtractedTextAnnotation.textRegion.xMin,
            y: dummyImageExtractedTextAnnotation.textRegion.yMin,
            w:
              dummyImageExtractedTextAnnotation.textRegion.xMax -
              dummyImageExtractedTextAnnotation.textRegion.xMin,
            h:
              dummyImageExtractedTextAnnotation.textRegion.yMax -
              dummyImageExtractedTextAnnotation.textRegion.yMin,
          },
        }),
      },
    ] as AnnotatorBoxRegion[]);
  });
  it('should return correct region for ImageObjectDetectionBoundingBox Annotation', () => {
    expect(
      convertVisionReviewAnnotationToRegions(
        dummyImageBoundingBoxReviewAnnotation
      )
    ).toEqual([
      {
        ...getDummyRegion<AnnotatorBoxRegion>({
          reviewAnnotation: dummyImageBoundingBoxReviewAnnotation,
          visible: dummyImageBoundingBoxReviewAnnotation.show,
          editingLabels: dummyImageBoundingBoxReviewAnnotation.selected,
          highlighted: dummyImageBoundingBoxReviewAnnotation.selected,
          regionProps: {
            type: AnnotatorRegionType.BoxRegion,
            x: dummyImageObjectDetectionBoundingBoxAnnotation.boundingBox.xMin,
            y: dummyImageObjectDetectionBoundingBoxAnnotation.boundingBox.yMin,
            w:
              dummyImageObjectDetectionBoundingBoxAnnotation.boundingBox.xMax -
              dummyImageObjectDetectionBoundingBoxAnnotation.boundingBox.xMin,
            h:
              dummyImageObjectDetectionBoundingBoxAnnotation.boundingBox.yMax -
              dummyImageObjectDetectionBoundingBoxAnnotation.boundingBox.yMin,
          },
        }),
      },
    ] as AnnotatorBoxRegion[]);
  });
  it('should return correct region for ImageObjectDetectionPolygon Annotation', () => {
    expect(
      convertVisionReviewAnnotationToRegions(dummyImagePolygonReviewAnnotation)
    ).toEqual([
      {
        ...getDummyRegion<AnnotatorPolygonRegion>({
          reviewAnnotation: dummyImagePolygonReviewAnnotation,
          visible: dummyImagePolygonReviewAnnotation.show,
          editingLabels: dummyImagePolygonReviewAnnotation.selected,
          highlighted: dummyImagePolygonReviewAnnotation.selected,
          regionProps: {
            type: AnnotatorRegionType.PolygonRegion,
            points:
              dummyImageObjectDetectionPolygonAnnotation.polygon.vertices.map(
                (point) => [point.x, point.y]
              ),
          },
        }),
      },
    ] as AnnotatorPolygonRegion[]);
  });
  it('should return correct regions for ImageObjectDetectionPolyline Annotation', () => {
    const consoleSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});
    expect(
      convertVisionReviewAnnotationToRegions(dummyImagePolyLineReviewAnnotation)
    ).toEqual([
      {
        ...getDummyRegion<AnnotatorLineRegion>({
          reviewAnnotation: dummyImagePolyLineReviewAnnotation,
          visible: dummyImagePolyLineReviewAnnotation.show,
          editingLabels: dummyImagePolyLineReviewAnnotation.selected,
          highlighted: dummyImagePolyLineReviewAnnotation.selected,
          regionProps: {
            type: AnnotatorRegionType.LineRegion,
            x1: dummyImageObjectDetectionPolylineAnnotation.polyline.vertices[0]
              .x,
            y1: dummyImageObjectDetectionPolylineAnnotation.polyline.vertices[0]
              .y,
            x2: dummyImageObjectDetectionPolylineAnnotation.polyline.vertices[1]
              .x,
            y2: dummyImageObjectDetectionPolylineAnnotation.polyline.vertices[1]
              .y,
          },
        }),
      },
    ] as AnnotatorLineRegion[]);
    expect(consoleSpy).toHaveBeenCalled();
  });
  it('should return correct region for ImageKeypointCollection Annotation', () => {
    const dummyRegions =
      dummyImageKeypointCollectionReviewAnnotation.annotation.keypoints.map(
        (keypoint) =>
          ({
            ...getDummyRegion<AnnotatorPointRegion>({
              reviewAnnotation: dummyImageKeypointCollectionReviewAnnotation,
              id: keypoint.id,
              visible: dummyImageKeypointCollectionReviewAnnotation.show,
              highlighted: true,
              editingLabels: false,
              tags: [],
              regionProps: {
                type: AnnotatorRegionType.PointRegion,
                parentAnnotationId: dummyImageKeypointCollectionAnnotation.id,
                keypointLabel: keypoint.keypoint.label,
                keypointConfidence: keypoint.keypoint.confidence,
                x: keypoint.keypoint.point.x,
                y: keypoint.keypoint.point.y,
              },
            }),
          } as AnnotatorPointRegion)
      );
    expect(
      convertVisionReviewAnnotationToRegions(
        dummyImageKeypointCollectionReviewAnnotation
      )
    ).toEqual(dummyRegions);
  });
  it('should return correct regions for ImageKeypointCollection Annotation when annotation not selected and a single keypoint selected', () => {
    const selectedKeypointIndices = [0, 1, 2];
    const dummyReviewAnnotation = getDummyVisionReviewAnnotation(
      dummyImageKeypointCollectionAnnotation,
      false,
      true,
      selectedKeypointIndices
    );
    const dummyRegions = (
      dummyReviewAnnotation as VisionReviewAnnotation<ImageKeypointCollection>
    ).annotation.keypoints.map(
      (keypoint) =>
        ({
          ...getDummyRegion<AnnotatorPointRegion>({
            reviewAnnotation: dummyReviewAnnotation,
            id: keypoint.id,
            visible: dummyReviewAnnotation.show,
            highlighted: keypoint.selected,
            editingLabels: keypoint.selected,
            tags: [],
            regionProps: {
              type: AnnotatorRegionType.PointRegion,
              parentAnnotationId: dummyImageKeypointCollectionAnnotation.id,
              keypointLabel: keypoint.keypoint.label,
              keypointConfidence: keypoint.keypoint.confidence,
              x: keypoint.keypoint.point.x,
              y: keypoint.keypoint.point.y,
            },
          }),
        } as AnnotatorPointRegion)
    );
    expect(
      convertVisionReviewAnnotationToRegions(dummyReviewAnnotation)
    ).toEqual(dummyRegions);
  });
});

describe('test convertRegionToUnsavedVisionAnnotation', () => {
  const selected = true;
  const visible = true;
  it('should return null on empty region', () => {
    const consoleSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});
    expect(
      convertRegionToUnsavedVisionAnnotation({} as AnnotatorRegion)
    ).toBeNull();
    expect(consoleSpy).toHaveBeenCalled();
  });
  it('if invalid region type should return null', () => {
    const consoleSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});
    expect(
      convertRegionToUnsavedVisionAnnotation({
        ...getDummyRegion<any>({
          reviewAnnotation: dummyImageClassificationReviewAnnotation,
          regionProps: {
            type: 'classification',
          },
        }),
      } as AnnotatorRegion)
    ).toBeNull();
    expect(consoleSpy).toHaveBeenCalled();
  });
  it('For AnnotatorBox region converted from an existing annotation should return null', () => {
    expect(
      convertRegionToUnsavedVisionAnnotation({
        ...getDummyRegion<AnnotatorBoxRegion>({
          reviewAnnotation: dummyImageBoundingBoxReviewAnnotation,
          visible,
          editingLabels: selected,
          regionProps: {
            type: AnnotatorRegionType.BoxRegion,
            x: 0,
            y: 0,
            w: 1,
            h: 1,
          },
        }),
      } as AnnotatorRegion)
    ).toBeNull();
  });
  it('If Box region and CDFAnnotationType Extracted text should return null', () => {
    const consoleSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});
    expect(
      convertRegionToUnsavedVisionAnnotation({
        ...getDummyRegion<AnnotatorBoxRegion>({
          reviewAnnotation: dummyImageExtractedTextReviewAnnotation,
          visible,
          editingLabels: selected,
          regionProps: {
            type: AnnotatorRegionType.BoxRegion,
            x: 0,
            y: 0,
            w: 1,
            h: 1,
          },
        }),
      } as AnnotatorRegion)
    ).toBeNull();
    expect(consoleSpy).toHaveBeenCalled();
  });
  it('If Box region and CDFAnnotationType ImageAssetLink should return null', () => {
    const consoleSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});
    expect(
      convertRegionToUnsavedVisionAnnotation({
        ...getDummyRegion<AnnotatorBoxRegion>({
          reviewAnnotation: dummyImageAssetLinkReviewAnnotation,
          visible,
          editingLabels: selected,
          regionProps: {
            type: AnnotatorRegionType.BoxRegion,
            x: 0,
            y: 0,
            w: 1,
            h: 1,
          },
        }),
      } as AnnotatorRegion)
    ).toBeNull();
    expect(consoleSpy).toHaveBeenCalled();
  });
  it('If Box region should return UnsavedVisionAnnotation<<ImageObjectDetection>>', () => {
    const {
      annotatedResourceId,
      ...dummyUnsavedObjectDetectionAnnotationWithoutAnnotatedResourceId
    } = getDummyUnsavedAnnotation({
      ...dummyImageObjectDetectionBoundingBoxAnnotation,
      confidence: 1,
      status: Status.Approved,
    });

    expect(
      convertRegionToUnsavedVisionAnnotation(
        getDummyRegionOriginatedInAnnotator({
          id: dummyImageObjectDetectionBoundingBoxAnnotation.id,
          annotationLabelOrText:
            dummyImageObjectDetectionBoundingBoxAnnotation.label,
          color: 'red',
          ...{
            type: AnnotatorRegionType.BoxRegion,
            x: 0,
            y: 0,
            w: 1,
            h: 1,
          },
        }) as AnnotatorRegion
      )
    ).toStrictEqual(
      dummyUnsavedObjectDetectionAnnotationWithoutAnnotatedResourceId
    );
  });
  it('If Polygon region should return UnsavedVisionAnnotation<<ImageObjectDetection>>', () => {
    const {
      annotatedResourceId,
      ...dummyUnsavedObjectDetectionAnnotationWithoutAnnotatedResourceId
    } = getDummyUnsavedAnnotation({
      ...dummyImageObjectDetectionPolygonAnnotation,
      confidence: 1,
      status: Status.Approved,
    });

    expect(
      convertRegionToUnsavedVisionAnnotation(
        getDummyRegionOriginatedInAnnotator({
          id: dummyImageObjectDetectionPolygonAnnotation.id,
          annotationLabelOrText:
            dummyImageObjectDetectionPolygonAnnotation.label,
          color: 'red',
          ...{
            type: AnnotatorRegionType.PolygonRegion,
            points:
              dummyImageObjectDetectionPolygonAnnotation.polygon.vertices.map(
                (vertex) => [vertex.x, vertex.y]
              ),
          },
        }) as AnnotatorRegion
      )
    ).toStrictEqual(
      dummyUnsavedObjectDetectionAnnotationWithoutAnnotatedResourceId
    );
  });
  it('If Line region should return UnsavedVisionAnnotation<<ImageObjectDetection>>', () => {
    const {
      annotatedResourceId,
      ...dummyUnsavedObjectDetectionAnnotationWithoutAnnotatedResourceId
    } = getDummyUnsavedAnnotation({
      ...dummyImageObjectDetectionPolylineAnnotation,
      confidence: 1,
      status: Status.Approved,
    });
    expect(
      convertRegionToUnsavedVisionAnnotation(
        getDummyRegionOriginatedInAnnotator({
          id: dummyImageObjectDetectionPolylineAnnotation.id,
          annotationLabelOrText:
            dummyImageObjectDetectionPolylineAnnotation.label,
          color: 'red',
          ...{
            type: AnnotatorRegionType.LineRegion,
            x1: dummyImageObjectDetectionPolylineAnnotation.polyline.vertices[0]
              .x,
            y1: dummyImageObjectDetectionPolylineAnnotation.polyline.vertices[0]
              .y,
            x2: dummyImageObjectDetectionPolylineAnnotation.polyline.vertices[1]
              .x,
            y2: dummyImageObjectDetectionPolylineAnnotation.polyline.vertices[1]
              .y,
          },
        }) as AnnotatorRegion
      )
    ).toStrictEqual(
      dummyUnsavedObjectDetectionAnnotationWithoutAnnotatedResourceId
    );
  });
});

describe('test convertTempKeypointCollectionToRegions', () => {
  it('should return empty array on empty unsavedKeypointCollection', () => {
    expect(
      convertTempKeypointCollectionToRegions({} as TempKeypointCollection)
    ).toEqual([]);
  });
  it('should return empty array on no data field', () => {
    expect(
      convertTempKeypointCollectionToRegions({
        ...dummyTempKeypointCollection,
        data: undefined!,
      })
    ).toEqual([]);
  });
  it('should return empty array on empty data object', () => {
    expect(
      convertTempKeypointCollectionToRegions({
        ...dummyTempKeypointCollection,
        data: {} as any,
      })
    ).toEqual([]);
  });
  it('should return empty array on empty id', () => {
    expect(
      convertTempKeypointCollectionToRegions({
        ...dummyTempKeypointCollection,
        id: undefined!,
      })
    ).toEqual([]);
  });
  it('should return empty array on empty label', () => {
    expect(
      convertTempKeypointCollectionToRegions({
        ...dummyTempKeypointCollection,
        data: {
          ...dummyTempKeypointCollection.data,
          label: '',
        },
      })
    ).toEqual([]);
    expect(
      convertTempKeypointCollectionToRegions({
        ...dummyTempKeypointCollection,
        data: {
          ...dummyTempKeypointCollection.data,
          label: undefined!,
        },
      })
    ).toEqual([]);
  });
  it('should return empty array on empty keypoints', () => {
    expect(
      convertTempKeypointCollectionToRegions({
        ...dummyTempKeypointCollection,
        data: {
          ...dummyTempKeypointCollection.data,
          keypoints: undefined!,
        },
      })
    ).toEqual([]);
    expect(
      convertTempKeypointCollectionToRegions({
        ...dummyTempKeypointCollection,
        data: {
          ...dummyTempKeypointCollection.data,
          keypoints: [],
        },
      })
    ).toEqual([]);
  });
  it('should return correct regions', () => {
    const dummyRegions = dummyTempKeypointCollection.data.keypoints.map(
      (keypoint) =>
        ({
          ...getDummyRegion<AnnotatorPointRegion>({
            reviewAnnotation: {
              annotation: {
                id: dummyTempKeypointCollection.id,
                annotatedResourceId:
                  dummyTempKeypointCollection.annotatedResourceId,
                ...dummyTempKeypointCollection.data,
                status: Status.Approved,
                annotationType: CDFAnnotationTypeEnum.ImagesKeypointCollection,
                createdTime: 0,
                lastUpdatedTime: 0,
              },
              selected: true,
              show: true,
            },
            id: keypoint.id,
            visible: true,
            highlighted: true,
            editingLabels: keypoint.selected,
            tags: [],
            regionProps: {
              type: AnnotatorRegionType.PointRegion,
              parentAnnotationId: dummyTempKeypointCollection.id,
              keypointLabel: keypoint.keypoint.label,
              keypointConfidence: keypoint.keypoint.confidence,
              x: keypoint.keypoint.point.x,
              y: keypoint.keypoint.point.y,
            },
          }),
        } as AnnotatorPointRegion)
    );
    expect(
      convertTempKeypointCollectionToRegions(dummyTempKeypointCollection)
    ).toStrictEqual(dummyRegions);
  });
});
