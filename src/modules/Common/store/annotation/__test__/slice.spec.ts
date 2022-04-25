import reducer, {
  initialState,
} from 'src/modules/Common/store/annotation/slice';

describe('Test annotationV1 reducer', () => {
  test('should return the initial state', () => {
    expect(reducer(undefined, { type: undefined })).toEqual(initialState);
  });
});
