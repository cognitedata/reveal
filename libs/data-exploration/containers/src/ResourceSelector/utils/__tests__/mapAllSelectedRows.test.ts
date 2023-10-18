import {
  INITIAL_SELECTED_ROWS,
  getExtendedResourceItem,
  getSelectedRowsFixture,
} from '@data-exploration-lib/core';

import { mapAllSelectedRows } from '../mapAllSelectedRows';

const selectedRows = getSelectedRowsFixture();

const extendedItem = getExtendedResourceItem();

describe('mapAllSelectedRows', () => {
  it('should return empty array', () => {
    const result = mapAllSelectedRows(INITIAL_SELECTED_ROWS);
    expect(result).toEqual([]);
  });

  it('should return expected result', () => {
    const result = mapAllSelectedRows(selectedRows);
    expect(result).toStrictEqual([
      {
        id: 16869846011556,
        externalId: '3647-213996626542_ophiuchus_162325.txt',
        type: 'file',
      },
      {
        id: 7990758739061,
        externalId: 'LOR_KARLSTAD_WELL_11_Well_PRESSURE_MOTOR_FREQ',
        type: 'timeSeries',
      },
      {
        id: 13882587267336,
        externalId: 'LOR_ARENDAL_WELL_11_Well_PRESSURE_WELL_HEAD_TUBING',
        type: 'timeSeries',
      },
    ]);
  });

  it('should return expected result with input', () => {
    const result = mapAllSelectedRows(selectedRows, {
      [extendedItem.id]: extendedItem,
    });
    expect(result[1]).toStrictEqual({
      id: 7990758739061,
      externalId: 'LOR_KARLSTAD_WELL_11_Well_PRESSURE_MOTOR_FREQ',
      type: 'timeSeries',
      dateRange: extendedItem.dateRange,
    });
  });
});
