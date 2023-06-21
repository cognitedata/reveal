import { selectCDFState } from 'src/modules/Common/store/common/selectors';
import { initialState } from 'src/modules/Common/store/common/slice';
import { CDFStatusModes } from 'src/modules/Common/Components/CDFStatus/CDFStatus';

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
