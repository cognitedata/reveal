import { mapCurvesToOptions, mapOptionsToCurves } from '../utils';

const curves = ['CP_POST', 'SHMIN_SHALE_ML_PRE'];
const curveOptions = [
  {
    label: 'CP_POST',
    value: 'CP_POST',
  },
  {
    label: 'SHMIN_SHALE_ML_PRE',
    value: 'SHMIN_SHALE_ML_PRE',
  },
];

describe('Measurement filter utils', () => {
  test('Should return curve options', () => {
    expect(mapCurvesToOptions(curves)).toEqual(curveOptions);
  });

  test('Should return curves from options', () => {
    expect(mapOptionsToCurves(curveOptions)).toEqual(curves);
  });
});
