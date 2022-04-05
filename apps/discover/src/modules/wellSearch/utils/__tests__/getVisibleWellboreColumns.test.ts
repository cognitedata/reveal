import { getWellboreColumns } from 'pages/authorized/constant';
import { getWellColumns } from 'pages/authorized/search/well/getWellColumns';

import { getVisibleWellboreColumns } from '../getVisibleWellboreColumns';

describe('getVisibleWellboreColumns', () => {
  const wellColumns = getWellColumns();
  const wellboreColumns = getWellboreColumns();
  it('should return expected result', () => {
    const result = getVisibleWellboreColumns(
      ['wellname', 'kbElevation', 'testColumnName'],
      wellColumns,
      wellboreColumns
    );

    expect(result).toMatchObject(Object.values(wellboreColumns));
  });

  it('should return first value of wellborecolumns only', () => {
    const result = getVisibleWellboreColumns(
      ['wellname', 'testColumnName'],
      wellColumns,
      wellboreColumns
    );

    expect(result).toMatchObject([Object.values(wellboreColumns)[0]]);
  });
});
