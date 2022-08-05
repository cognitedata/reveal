import { getDummyRegionOriginatedInAnnotator } from 'src/modules/Review/Components/ReactImageAnnotateWrapper/__test-utils/region';
import {
  AnnotatorNewRegion,
  AnnotatorPointRegion,
  AnnotatorRegionType,
} from 'src/modules/Review/Components/ReactImageAnnotateWrapper/types';
import { getKeypointForAnnotatorPointRegion } from 'src/modules/Review/store/annotatorWrapper/utils';

describe('Test getKeypointForAnnotatorPointRegion function', () => {
  const tempRegionWithoutLabel = {
    id: 1,
    type: AnnotatorRegionType.PointRegion,
    x: 0.5,
    y: 0.5,
  } as AnnotatorNewRegion;

  const tempRegionWithLabels = getDummyRegionOriginatedInAnnotator({
    id: 1,
    annotationLabelOrText: 'valve',
    type: AnnotatorRegionType.PointRegion,
    x: 0.6,
    y: 0.8,
    keypointLabel: 'up',
    keypointConfidence: 1,
    color: 'red',
    parentAnnotationId: 0,
  });

  test('if region is empty', () => {
    expect(
      getKeypointForAnnotatorPointRegion({} as AnnotatorPointRegion)
    ).toBeNull();
  });

  test('if region is without keypoint label', () => {
    expect(
      getKeypointForAnnotatorPointRegion(
        tempRegionWithoutLabel as AnnotatorPointRegion
      )
    ).toBeNull();
  });

  test('if region is without point', () => {
    expect(
      getKeypointForAnnotatorPointRegion({
        ...tempRegionWithoutLabel,
        x: NaN,
      } as AnnotatorPointRegion)
    ).toBeNull();
    expect(
      getKeypointForAnnotatorPointRegion({
        ...tempRegionWithoutLabel,
        y: NaN,
      } as AnnotatorPointRegion)
    ).toBeNull();
  });
  test('if valid region', () => {
    expect(
      getKeypointForAnnotatorPointRegion(
        tempRegionWithLabels as AnnotatorPointRegion
      )
    ).toStrictEqual({
      point: expect.objectContaining({
        x: (tempRegionWithLabels as AnnotatorPointRegion).x,
        y: (tempRegionWithLabels as AnnotatorPointRegion).y,
      }),
      label: (tempRegionWithLabels as AnnotatorPointRegion).keypointLabel,
      confidence: (tempRegionWithLabels as AnnotatorPointRegion)
        .keypointConfidence,
    });
  });
});
