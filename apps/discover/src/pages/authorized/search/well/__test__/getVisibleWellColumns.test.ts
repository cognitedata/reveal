import { FEET } from 'constants/units';

import { getVisibleWellColumns } from '../getVisibleWellColumns';

describe('getVisibleWellColumns', () => {
  it('result should contain passed unit and only the selected columns', async () => {
    const result = getVisibleWellColumns({
      unit: FEET,
      enabled: ['fieldname', 'waterDepth'],
    });

    expect(result.fieldname.Header).toEqual('Field name');
    expect(result.waterDepth.Header).toEqual('Water depth (ft)');
    expect(result.operator).toEqual(undefined);
  });
});
