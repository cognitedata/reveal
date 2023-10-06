import { CDFStatusModes } from '../../../Components/CDFStatus/CDFStatus';
import { selectCDFState } from '../selectors';
import { initialState } from '../slice';

describe('Test CDF state selector', () => {
  test('should return initial saveState data', () => {
    expect(selectCDFState(initialState).mode).toEqual(
      'saved' as CDFStatusModes
    );
  });

  test('should return current saveState data', () => {
    const saveState = {
      mode: 'error' as CDFStatusModes,
      time: new Date().getTime(),
    };

    const previousState = {
      ...initialState,
      saveState,
    };
    expect(selectCDFState(previousState)).toEqual(saveState);
  });
});
