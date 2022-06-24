import { predefinedAnnotations } from 'src/__test-utils/fixtures/predefinedAnnotations';
import { getPredefinedKeypointsWithColor } from 'src/store/util/getPredefinedKeypointsWithCorrectColors';

describe('getPredefinedKeypointsWithColor', () => {
  const shapeAnnotation = predefinedAnnotations.find(
    (predefinedAnnotation) => predefinedAnnotation.data.keypoint === undefined
  );
  const keypointCollectionBeforeJune2022 = predefinedAnnotations.find(
    (predefinedAnnotation) =>
      predefinedAnnotation.text.search('before-june-2022') !== -1
  );
  const keypointCollectionAfterJune2022 = predefinedAnnotations.find(
    (predefinedAnnotation) =>
      predefinedAnnotation.text.search('after-june-2022') !== -1
  );

  it(`All keypoints should have same color for keypoints for predefined annotations before june 2022,
      where color will be the keypoint color of the first keypoint`, () => {
    expect(
      getPredefinedKeypointsWithColor(
        keypointCollectionBeforeJune2022!.data.keypoints,
        keypointCollectionBeforeJune2022!.data.color
      )
    ).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          color: keypointCollectionBeforeJune2022!.data.keypoints![0].color,
        }),
      ])
    );
  });
  it('All keypoints should have same color for keypoints for predefined annotations after june 2022', () => {
    expect(
      getPredefinedKeypointsWithColor(
        keypointCollectionAfterJune2022!.data.keypoints,
        keypointCollectionAfterJune2022!.data.color
      )
    ).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          color: keypointCollectionAfterJune2022!.data.color,
        }),
      ])
    );
  });
  it('Should return undefined to shape annotations', () => {
    expect(
      getPredefinedKeypointsWithColor(
        shapeAnnotation?.data.keypoints,
        shapeAnnotation?.data.color
      )
    ).toBeUndefined();
  });
  it('Should return empty array if keypoints are not provided', () => {
    expect(getPredefinedKeypointsWithColor([], 'color')).toEqual([]);
  });
});
