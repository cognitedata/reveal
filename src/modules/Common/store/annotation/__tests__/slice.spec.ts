import reducer, {
  initialState,
} from 'src/modules/Common/store/annotation/slice';
import {
  clearExplorerFileState,
  clearFileState,
} from 'src/store/commonActions';
import { CreateAnnotations } from 'src/store/thunks/Annotation/CreateAnnotations';
import { DeleteAnnotations } from 'src/store/thunks/Annotation/DeleteAnnotations';
import { RetrieveAnnotations } from 'src/store/thunks/Annotation/RetrieveAnnotations';
import { UpdateAnnotations } from 'src/store/thunks/Annotation/UpdateAnnotations';
import { DeleteFilesById } from 'src/store/thunks/Files/DeleteFilesById';
import { AnnotationDetectionJobUpdate } from 'src/store/thunks/Process/AnnotationDetectionJobUpdate';
import { AnnotationUtils } from 'src/utils/AnnotationUtils';

describe('Test annotation reducer', () => {
  const getDummyAnnotation = (
    id?: number,
    modelType?: number,
    annotatedResourceId?: number
  ) => {
    return AnnotationUtils.createVisionAnnotationStub(
      id || 1,
      'pump',
      modelType || 1,
      annotatedResourceId || 1,
      123,
      124,
      { shape: 'rectangle', vertices: [] }
    );
  };

  test('should return the initial state', () => {
    expect(reducer(undefined, { type: undefined })).toEqual(initialState);
  });

  describe('Test RetrieveAnnotations.pending action', () => {
    test('should clear entire state when clear cache is true', () => {
      const action = {
        type: RetrieveAnnotations.pending.type,
        meta: {
          arg: {
            fileIds: [],
            clearCache: true,
          },
        },
      };

      const previousState = {
        files: {
          byId: {
            '10': [1, 2],
          },
        },
        annotations: {
          byId: {
            '1': getDummyAnnotation(1),
            '2': getDummyAnnotation(2),
          },
        },
      };

      expect(reducer(previousState, action)).toEqual({
        files: {
          byId: {},
        },
        annotations: {
          byId: {},
        },
      });
    });

    test('should clear only specified fileIds when clear cache is false', () => {
      const action = {
        type: RetrieveAnnotations.pending.type,
        meta: {
          arg: {
            fileIds: [10],
            clearCache: false,
          },
        },
      };

      const previousState = {
        files: {
          byId: {
            '10': [1],
            '20': [2],
          },
        },
        annotations: {
          byId: {
            '1': getDummyAnnotation(1),
            '2': getDummyAnnotation(2),
          },
        },
      };

      expect(reducer(previousState, action)).toEqual({
        files: {
          byId: { '20': [2] },
        },
        annotations: {
          byId: { '2': getDummyAnnotation(2) },
        },
      });
    });

    test('should keep state unchanged if nonexisting fileIds are provided', () => {
      const action = {
        type: RetrieveAnnotations.pending.type,
        meta: {
          arg: {
            fileIds: [30],
            clearCache: false,
          },
        },
      };

      const previousState = {
        files: {
          byId: {
            '10': [1],
          },
        },
        annotations: {
          byId: {
            '1': getDummyAnnotation(1),
          },
        },
      };

      expect(reducer(previousState, action)).toEqual(previousState);
    });
  });

  describe('Test RetrieveAnnotations.fulfilled action', () => {
    test('should populate state', () => {
      const action = {
        type: RetrieveAnnotations.fulfilled.type,
        payload: [
          getDummyAnnotation(1, undefined, 10), // existing annotation and file
          getDummyAnnotation(2, undefined, 10), // new annotation for existing file with annotation
          getDummyAnnotation(3, undefined, 20), // new annotation for existing file without annotation
          getDummyAnnotation(4, undefined, 30), // new file and annotation
        ],
      };

      const previousState = {
        files: {
          byId: {
            '10': [1],
            '20': [],
          },
        },
        annotations: {
          byId: {
            '1': getDummyAnnotation(1, undefined, 10),
          },
        },
      };

      expect(reducer(previousState, action)).toEqual({
        files: {
          byId: {
            '10': [1, 2], // should add only new annotation to existing file
            '20': [3], // should add new annotation to existing file, previously without annotations
            '30': [4], // should add new file and annotation
          },
        },
        annotations: {
          byId: {
            '1': getDummyAnnotation(1, undefined, 10),
            '2': getDummyAnnotation(2, undefined, 10),
            '3': getDummyAnnotation(3, undefined, 20),
            '4': getDummyAnnotation(4, undefined, 30),
          },
        },
      });
    });
  });

  describe('Test DeleteAnnotations.fulfilled action', () => {
    test('should not change state for nonexisitng annotation id', () => {
      const action = {
        type: DeleteAnnotations.fulfilled.type,
        payload: [3], // annotation ids to delete
      };

      const previousState = {
        files: {
          byId: {
            '10': [1],
          },
        },
        annotations: {
          byId: {
            '1': getDummyAnnotation(1, undefined, 10),
          },
        },
      };

      expect(reducer(previousState, action)).toEqual(previousState);
    });

    test('should clean entire state since all annotation ids in state given in payload', () => {
      const action = {
        type: DeleteAnnotations.fulfilled.type,
        payload: [1, 2], // annotation ids to delete
      };

      const previousState = {
        files: {
          byId: {
            '10': [1, 2],
          },
        },
        annotations: {
          byId: {
            '1': getDummyAnnotation(1, undefined, 10),
            '2': getDummyAnnotation(2, undefined, 10),
          },
        },
      };

      expect(reducer(previousState, action)).toEqual(initialState);
    });
  });

  test('should only remove annotations with specified ids', () => {
    const action = {
      type: DeleteAnnotations.fulfilled.type,
      payload: [2], // annotation ids to delete
    };

    const previousState = {
      files: {
        byId: {
          '10': [1, 2],
        },
      },
      annotations: {
        byId: {
          '1': getDummyAnnotation(1, undefined, 10),
          '2': getDummyAnnotation(2, undefined, 10),
        },
      },
    };

    expect(reducer(previousState, action)).toEqual({
      files: {
        byId: {
          '10': [1],
        },
      },
      annotations: {
        byId: {
          '1': getDummyAnnotation(1, undefined, 10),
        },
      },
    });
  });

  test('should delete annotation with non existing file id', () => {
    const action = {
      type: DeleteAnnotations.fulfilled.type,
      payload: [1], // annotation ids to delete
    };

    const previousState = {
      files: {
        byId: {
          '20': [1], // annotation.annotatedResourceId ('10') not in sync with state.files.byId ('20')
        },
      },
      annotations: {
        byId: {
          '1': getDummyAnnotation(1, undefined, 10),
        },
      },
    };

    expect(reducer(previousState, action)).toEqual({
      // TODO: is this behavior desired?
      files: {
        byId: {
          '20': [1],
        },
      },
      annotations: {
        byId: {},
      },
    });
  });

  describe('Test populator actions', () => {
    // TODO: same test as for RetrieveAnnotations.fulfilled, should be removed after refactoring
    const actionTypes = [
      CreateAnnotations.fulfilled.type,
      AnnotationDetectionJobUpdate.fulfilled.type,
      UpdateAnnotations.fulfilled.type,
    ];
    test('should populate state', () => {
      actionTypes.forEach((actionType) => {
        const action = {
          type: actionType,
          payload: [
            getDummyAnnotation(1, undefined, 10), // existing annotation and file
            getDummyAnnotation(2, undefined, 10), // new annotation for existing file with annotation
            getDummyAnnotation(3, undefined, 20), // new annotation for existing file without annotation
            getDummyAnnotation(4, undefined, 30), // new file and annotation
          ],
        };

        const previousState = {
          files: {
            byId: {
              '10': [1],
              '20': [],
            },
          },
          annotations: {
            byId: {
              '1': getDummyAnnotation(1, undefined, 10),
            },
          },
        };

        expect(reducer(previousState, action)).toEqual({
          files: {
            byId: {
              '10': [1, 2], // should add only new annotation to existing file
              '20': [3], // should add new annotation to existing file, previously without annotations
              '30': [4], // should add new file and annotation
            },
          },
          annotations: {
            byId: {
              '1': getDummyAnnotation(1, undefined, 10),
              '2': getDummyAnnotation(2, undefined, 10),
              '3': getDummyAnnotation(3, undefined, 20),
              '4': getDummyAnnotation(4, undefined, 30),
            },
          },
        });
      });
    });
  });

  describe('Test delete actions based on file ids', () => {
    const actionTypes = [
      DeleteFilesById.fulfilled.type,
      clearFileState.type,
      clearExplorerFileState.type,
    ];
    test('should delete file and corresponding annotations from state', () => {
      actionTypes.forEach((actionType) => {
        const action = {
          type: actionType,
          payload: [20], // file id to delete
        };

        const previousState = {
          files: {
            byId: {
              '10': [1],
              '20': [2],
            },
          },
          annotations: {
            byId: {
              '1': getDummyAnnotation(1),
              '2': getDummyAnnotation(2),
            },
          },
        };

        expect(reducer(previousState, action)).toEqual({
          files: {
            byId: {
              '10': [1],
            },
          },
          annotations: {
            byId: {
              '1': getDummyAnnotation(1),
            },
          },
        });
      });
    });
  });
});
