import environment, { initialState } from './slice';

const environmentReducer = environment.reducer;

describe('environment slice', () => {
  it('should handle initial state', () => {
    expect(environmentReducer(undefined, { type: {}, payload: {} })).toEqual(
      initialState
    );
  });
});
