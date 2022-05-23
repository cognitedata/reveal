import reducer, { initialState } from 'src/modules/Common/store/common/slice';
import { DeleteAnnotationsV1 } from 'src/store/thunks/Annotation/DeleteAnnotationsV1';
import { RetrieveAnnotations } from 'src/store/thunks/Annotation/RetrieveAnnotations';
import { SaveAnnotationsV1 } from 'src/store/thunks/Annotation/SaveAnnotationsV1';
import { SaveAnnotationTemplates } from 'src/store/thunks/Annotation/SaveAnnotationTemplates';
import { UpdateAnnotationsV1 } from 'src/store/thunks/Annotation/UpdateAnnotationsV1';
import { UpdateFiles } from 'src/store/thunks/Files/UpdateFiles';

describe('Test common reducer', () => {
  const fulfilledActionTypes = [
    SaveAnnotationsV1.fulfilled.type,
    DeleteAnnotationsV1.fulfilled.type,
    UpdateAnnotationsV1.fulfilled.type,
    UpdateFiles.fulfilled.type,
  ];

  const rejectedActionTypes = [
    SaveAnnotationsV1.rejected.type,
    RetrieveAnnotations.rejected.type,
    DeleteAnnotationsV1.rejected.type,
    UpdateAnnotationsV1.rejected.type,
    UpdateFiles.rejected.type,
    SaveAnnotationTemplates.rejected.type,
  ];

  test('should return the initial state', () => {
    expect(reducer(undefined, { type: undefined })).toEqual(initialState);
  });

  test('should set saveState on SaveAnnotations', () => {
    fulfilledActionTypes.forEach((actionType) => {
      const action = {
        type: actionType,
      };
      const state = reducer(initialState, action).saveState;
      expect(state.mode).toEqual('timestamp');
      expect(typeof state.time).toBe('number');
    });
  });

  test('should not change saveState if error is not given', () => {
    rejectedActionTypes.forEach((actionType) => {
      const action = {
        type: actionType,
      };
      const state = reducer(initialState, action).saveState;
      expect(state.mode).toEqual(initialState.saveState.mode);
      expect(typeof state.time).toBe('number');
    });
  });

  test('should set saveState to error when error is provided', () => {
    rejectedActionTypes.forEach((actionType) => {
      const action = {
        type: actionType,
        error: {
          message: 'unsucessful',
        },
      };
      const state = reducer(initialState, action).saveState;
      expect(state.mode).toEqual('error');
      expect(typeof state.time).toBe('number');
    });
  });
});
