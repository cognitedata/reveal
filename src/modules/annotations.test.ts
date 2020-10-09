import {
  createAnnotations,
  deleteAnnotations,
  clearAnnotationsForFile,
} from '@cognite/annotations';
import { FileInfo } from '@cognite/sdk';
import reducer, * as Annotations from './annotations';
import { mockStore } from '../utils/mockStore';

jest.mock('utils/AnnotationUtils');
jest.mock('@cognite/annotations');

const mockFile: FileInfo = {
  name: 'hello world',
  id: 1,
  createdTime: new Date(),
  lastUpdatedTime: new Date(),
  uploaded: false,
};

describe('Annotations store', () => {
  describe('reducer', () => {
    const annotations = [
      {
        id: 8336389869138460,
        type: 'User Defined',
        label: '23-TT-92532',
        assetId: 4079869018995790,
        boundingBox: {
          x: 2275.0734327360547,
          y: 869.932678897374,
          width: 100.33670033670023,
          height: 76.0942760942761,
        },
        version: 1,
        fileId: 77016948636687,
      },
      {
        type: 'Model Generated',
        boundingBox: {
          x: 3279,
          y: 530,
          width: 100,
          height: 57,
        },
        fileId: 77016948636687,
        assetId: 8637010283259847,
        label: '23-HV-92540-03',
        id: 7756165219433458,
      },
    ];

    const newStoreState = reducer(undefined, { type: 'INIT' });
    it('annotations/CREATE_ANNOTATIONS_DONE', () => {
      const action = {
        type: 'annotations/CREATE_ANNOTATIONS_DONE',
        fileId: 77016948636687,
        annotations,
      };
      const result = reducer(newStoreState, action);
      expect(result.byFileId[77016948636687].annotations.length).toEqual(2);
    });
    it('annotations/DELETE_ANNOTATIONS_DONE', () => {
      const action = {
        type: 'annotations/CREATE_ANNOTATIONS_DONE',
        fileId: 77016948636687,
        annotations,
      };
      const action2 = {
        type: 'annotations/DELETE_ANNOTATIONS_DONE',
        fileId: 77016948636687,
        annotations,
      };
      const result = reducer(reducer(newStoreState, action), action2);
      expect(result.byFileId[77016948636687].annotations.length).toEqual(0);
    });
  });
  describe('actions', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });
    it('createAnnotations', async () => {
      createAnnotations.mockReturnValue([
        {
          type: 'Model Generated',
          boundingBox: {
            x: 3279,
            y: 530,
            width: 100,
            height: 57,
          },
          fileId: 1,
          assetId: 8637010283259847,
          label: '23-HV-92540-03',
          id: 123,
        },
      ]);
      // @ts-ignore
      const store = mockStore({
        // @ts-ignore
        annotations: { byFileId: {} },
      });
      await store.dispatch(Annotations.create(mockFile, []));
      expect(createAnnotations).toBeCalledTimes(1);
      expect(store.getActions().length).toEqual(1);
    });
    it('deleteAnnotations', async () => {
      // @ts-ignore
      const store = mockStore({
        // @ts-ignore
        annotations: { byFileId: {} },
      });
      await store.dispatch(Annotations.remove(mockFile, []));
      expect(deleteAnnotations).toBeCalledTimes(1);
      expect(store.getActions().length).toEqual(1);
    });
    it('clearAnnotations', async () => {
      // @ts-ignore
      const store = mockStore({
        // @ts-ignore
        annotations: { byFileId: {} },
      });
      await store.dispatch(Annotations.clear(mockFile));
      expect(clearAnnotationsForFile).toBeCalledTimes(1);
      expect(store.getActions().length).toEqual(1);
    });
  });
});
