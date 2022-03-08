import { initialState } from 'src/modules/Review/store/annotationLabel/slice';
import { deleteCollection } from 'src/modules/Review/store/annotationLabel/utils';
import { AnnotationStatus } from 'src/utils/AnnotationUtils';

describe('Test deleteCollection', () => {
  const dummyKeyPoint = (id: string) => {
    return {
      id,
      caption: 'center',
      order: '1',
      color: 'red',
    };
  };

  const dummyKeyPointCollection = (id: string, keypointIds: string[]) => {
    return {
      id,
      keypointIds,
      name: 'gauge',
      show: true,
      status: AnnotationStatus.Verified,
    };
  };

  const dummyState = {
    ...initialState,
    collections: {
      byId: {
        c1: dummyKeyPointCollection('c1', ['k1']),
        c2: dummyKeyPointCollection('c2', ['k2']),
      },
      allIds: ['c1', 'c2'],
      selectedIds: ['c1', 'c2'],
    },
    keypointMap: {
      byId: { k1: dummyKeyPoint('k1'), k2: dummyKeyPoint('k2') },
      allIds: ['k1', 'k2'],
      selectedIds: ['k1', 'k2'],
    },
    lastCollectionId: 'c1',
  };
  const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

  test('should show warning for non-existing collections, but otherwise do nothing', () => {
    const modifiedState = JSON.parse(JSON.stringify(dummyState));
    expect(deleteCollection(modifiedState, 'non-existing-id')).toEqual(
      undefined
    );
    expect(modifiedState).toEqual(dummyState);
    expect(consoleSpy).toHaveBeenCalled();
  });

  test('should remove specified collection and corresponding keypointMap', () => {
    const modifiedState = JSON.parse(JSON.stringify(dummyState));
    expect(consoleSpy).not.toHaveBeenCalled();
    expect(deleteCollection(modifiedState, 'c1')).toEqual(undefined);
    expect(modifiedState).toEqual({
      ...initialState,
      lastCollectionId: undefined,
      collections: {
        byId: {
          c2: dummyKeyPointCollection('c2', ['k2']),
        },
        allIds: ['c2'],
        selectedIds: ['c2'],
      },
      keypointMap: {
        byId: { k2: dummyKeyPoint('k2') },
        allIds: ['k2'],
        selectedIds: ['k2'],
      },
    });
  });
});
