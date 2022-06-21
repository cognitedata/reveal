import {
  ReviewKeypoint,
  TempKeypointCollection,
} from 'src/modules/Review/types';
import { CDFAnnotationTypeEnum, Status } from 'src/api/annotation/types';
import { convertTempKeypointCollectionToUnsavedVisionImageKeypointCollection } from 'src/modules/Review/store/review/utils';
import { getDummyTempKeypointCollection } from 'src/__test-utils/annotations';

const dummyTempKeypointCollection = getDummyTempKeypointCollection({});

describe('test convertTempKeypointCollectionToUnsavedVisionImageKeypointCollection', () => {
  it('should return null if collection is empty', () => {
    expect(
      convertTempKeypointCollectionToUnsavedVisionImageKeypointCollection(
        {} as TempKeypointCollection
      )
    ).toBeNull();
  });
  it('should return null when annotation resource Id is not a valid number', () => {
    expect(
      convertTempKeypointCollectionToUnsavedVisionImageKeypointCollection({
        ...dummyTempKeypointCollection,
        annotatedResourceId: NaN,
      })
    ).toBeNull();
    expect(
      convertTempKeypointCollectionToUnsavedVisionImageKeypointCollection({
        ...dummyTempKeypointCollection,
        annotatedResourceId: Infinity,
      })
    ).toBeNull();
    expect(
      convertTempKeypointCollectionToUnsavedVisionImageKeypointCollection({
        ...dummyTempKeypointCollection,
        annotatedResourceId: undefined!,
      })
    ).toBeNull();
  });
  it('should return null when label is not provided', () => {
    expect(
      convertTempKeypointCollectionToUnsavedVisionImageKeypointCollection({
        ...dummyTempKeypointCollection,
        data: {
          ...dummyTempKeypointCollection.data,
          label: '',
        },
      })
    ).toBeNull();
    expect(
      convertTempKeypointCollectionToUnsavedVisionImageKeypointCollection({
        ...dummyTempKeypointCollection,
        data: {
          ...dummyTempKeypointCollection.data,
          label: undefined as unknown as string,
        },
      })
    ).toBeNull();
  });
  it('should return null when review keypoints are not provided or the length is 0', () => {
    expect(
      convertTempKeypointCollectionToUnsavedVisionImageKeypointCollection({
        ...dummyTempKeypointCollection,
        data: {
          ...dummyTempKeypointCollection.data,
          keypoints: undefined as unknown as ReviewKeypoint[],
        },
      })
    ).toBeNull();
    expect(
      convertTempKeypointCollectionToUnsavedVisionImageKeypointCollection({
        ...dummyTempKeypointCollection,
        data: {
          ...dummyTempKeypointCollection.data,
          keypoints: [],
        },
      })
    ).toBeNull();
  });
  it('should return correct UnsavedVisionImageKeypointCollectionAnnotation with all confidences set to 1', () => {
    expect(
      convertTempKeypointCollectionToUnsavedVisionImageKeypointCollection({
        ...getDummyTempKeypointCollection({}),
      })
    ).toStrictEqual({
      annotatedResourceId: dummyTempKeypointCollection.annotatedResourceId,
      annotationType: CDFAnnotationTypeEnum.ImagesKeypointCollection,
      status: Status.Approved,
      data: {
        label: dummyTempKeypointCollection.data.label,
        keypoints: dummyTempKeypointCollection.data.keypoints.map(
          ({ keypoint }) => ({
            label: keypoint.label,
            confidence: 1,
            point: keypoint.point,
          })
        ),
        confidence: 1,
      },
    });
  });
});
