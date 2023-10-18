import {
  ExtendedResourceItem,
  ResourceItem,
  ResourceSelection,
} from '../types';

export const getResourceItem = (): ResourceItem => {
  return { id: 1234, externalId: 'abcd', type: 'asset' };
};

export const getExtendedResourceItem = (): ExtendedResourceItem => {
  return {
    id: 7990758739061,
    externalId: 'LOR_KARLSTAD_WELL_11_Well_PRESSURE_MOTOR_FREQ',
    type: 'timeSeries',
    dateRange: [new Date('2022,1,19'), new Date('2023,2,20')],
  };
};

export const getSelectedRowsFixture = (): ResourceSelection => {
  return {
    asset: {},
    file: {
      '16869846011556': {
        id: 16869846011556,
        externalId: '3647-213996626542_ophiuchus_162325.txt',
        type: 'file',
      },
    },
    timeSeries: {
      '7990758739061': {
        id: 7990758739061,
        externalId: 'LOR_KARLSTAD_WELL_11_Well_PRESSURE_MOTOR_FREQ',
        type: 'timeSeries',
      },
      '13882587267336': {
        id: 13882587267336,
        externalId: 'LOR_ARENDAL_WELL_11_Well_PRESSURE_WELL_HEAD_TUBING',
        type: 'timeSeries',
      },
    },
    sequence: {},
    threeD: {},
    event: {},
    charts: {},
  };
};
