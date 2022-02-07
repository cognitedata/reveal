import {
  Asset,
  AssetAggregatedProperty,
  CogniteInternalId,
} from '@cognite/sdk';

export const rootAssets: Asset[] = [
  {
    createdTime: new Date(1624179082281),
    lastUpdatedTime: new Date(1624179082281),
    rootId: 7358469003370275,
    externalId: 'LER',
    name: 'Lervik platform 1',
    description: 'First platform in Lervik E&P',
    metadata: {},
    id: 7358469003370275,
  },
  {
    createdTime: new Date(1600167566305),
    lastUpdatedTime: new Date(1604931100058),
    rootId: 5937867326653296,
    externalId: 'Oil_Rig',
    name: 'Oil Rig',
    description: '',
    metadata: {
      model_id: '455529105706499',
      a_really_long_field: 'with a really very long field value',
    },
    id: 5937867326653296,
  },
  {
    createdTime: new Date(1608200546396),
    lastUpdatedTime: new Date(1608200546396),
    rootId: 2173222508977208,
    externalId: 'Oil_Rig_2',
    name: 'Oil Rig 2',
    metadata: {},
    id: 2173222508977208,
  },
  {
    createdTime: new Date(1608200546396),
    lastUpdatedTime: new Date(1622459618670),
    rootId: 1664217390306455,
    externalId: 'Oil_Rig_3',
    name: 'Oil Rig 3',
    metadata: {},
    id: 1664217390306455,
  },
  {
    createdTime: new Date(1608200546396),
    lastUpdatedTime: new Date(1608200546396),
    rootId: 3338583961467271,
    externalId: 'Oil_Rig_4',
    name: 'Oil Rig 4',
    metadata: {},
    id: 3338583961467271,
  },
  {
    createdTime: new Date(1607957188251),
    lastUpdatedTime: new Date(1615130080925),
    rootId: 787578579555860,
    externalId: 'WindTurbine1',
    name: 'Wind Turbine 1',
    metadata: {
      model_id: '4300627345378121',
    },
    id: 787578579555860,
  },
  {
    createdTime: new Date(1607957188251),
    lastUpdatedTime: new Date(1615130098447),
    rootId: 4061085976136978,
    externalId: 'WindTurbine2',
    name: 'Wind Turbine 2',
    metadata: {},
    id: 4061085976136978,
  },
  {
    createdTime: new Date(1607957188251),
    lastUpdatedTime: new Date(1615130106271),
    rootId: 8112080787850448,
    externalId: 'WindTurbine3',
    name: 'Wind Turbine 3',
    metadata: {},
    id: 8112080787850448,
  },
];

export const randomAssets: Asset[] = [
  {
    createdTime: new Date(1600167567031),
    lastUpdatedTime: new Date(1615891875905),
    rootId: 5937867326653296,
    parentId: 3410501024925486,
    parentExternalId: 'LOR-002',
    externalId: '02-V-2415',
    name: '02-V-2415',
    description: 'VALVE FB M',
    metadata: {
      'Category Code': 'ADM',
      'Function Code': 'SYST',
      'LOCATION (FACILITY AREA CODE)': 'FL1Q4',
      'Preceded by tag': '21PI1017',
      'Sub System No.': '',
      'Superceded by tag': '13ESV2030',
    },
    id: 8671131529374242,
  },
  {
    createdTime: new Date(1600167567031),
    lastUpdatedTime: new Date(1604918455346),
    rootId: 5937867326653296,
    parentId: 2102102533085073,
    parentExternalId: 'LOR-010',
    externalId: '10-ESDV-10030',
    name: '10-ESDV-10030',
    metadata: {
      'Category Code': 'ADM',
      'Function Code': 'SYST',
      'Preceded by tag': '21PI1032',
      'Sub System No.': '',
      'Superceded by tag': '13PT2043',
    },
    id: 744649169771873,
  },
  {
    createdTime: new Date(1600167566305),
    lastUpdatedTime: new Date(1604918534365),
    rootId: 5937867326653296,
    parentId: 2503963059326808,
    parentExternalId: 'LOR-011',
    externalId: '11-ESDV-10010',
    name: '11-ESDV-10010',
    metadata: {
      'Category Code': 'ADM',
      'Function Code': 'SYST',
      'Preceded by tag': '13-ESV-2031',
      'Sub System No.': '',
      'Superceded by tag': '13-ESV-2031',
    },
    id: 6431046055532742,
  },
  {
    createdTime: new Date(1600167566305),
    lastUpdatedTime: new Date(1604918483449),
    rootId: 5937867326653296,
    parentId: 2503963059326808,
    parentExternalId: 'LOR-011',
    externalId: '11-ESDV-10020',
    name: '11-ESDV-10020',
    metadata: {
      'Category Code': 'ADM',
      'Function Code': 'SYST',
      'Preceded by tag': '21PT1017',
      'Sub System No.': '',
      'Superceded by tag': '13PT2044',
    },
    id: 2858667766881508,
  },
  {
    createdTime: new Date(1600167566305),
    lastUpdatedTime: new Date(1604918564581),
    rootId: 5937867326653296,
    parentId: 2503963059326808,
    parentExternalId: 'LOR-011',
    externalId: '11-HCV-52521',
    name: '11-HCV-52521',
    metadata: {
      'Category Code': 'ADM',
      'Function Code': 'SYST',
      'Preceded by tag': '13PT2046',
      'Sub System No.': '',
      'Superceded by tag': '13PT2121',
    },
    id: 8565684560878817,
  },
  {
    createdTime: new Date(1600167566305),
    lastUpdatedTime: new Date(1604918531847),
    rootId: 5937867326653296,
    parentId: 2503963059326808,
    parentExternalId: 'LOR-011',
    externalId: '11-HCV-52526',
    name: '11-HCV-52526',
    metadata: {
      'Category Code': 'ADM',
      'Function Code': 'SYST',
      'Preceded by tag': '13ESV2080',
      'Sub System No.': '',
      'Superceded by tag': '21PI1017',
    },
    id: 6290499256967622,
  },
  {
    createdTime: new Date(1600167566305),
    lastUpdatedTime: new Date(1604918569543),
    rootId: 5937867326653296,
    parentId: 2503963059326808,
    parentExternalId: 'LOR-011',
    externalId: '11-HCV-52553',
    name: '11-HCV-52553',
    metadata: {
      'Category Code': 'ADM',
      'Function Code': 'SYST',
      'Preceded by tag': '13-ESV-2031',
      'Sub System No.': '',
      'Superceded by tag': '21ZT1018',
    },
    id: 8926248480064524,
  },
  {
    createdTime: new Date(1610610584294),
    lastUpdatedTime: new Date(1610610584294),
    rootId: 4563220786036803,
    parentId: 4563220786036803,
    parentExternalId: '4650652196144007',
    externalId: '3111454725058294',
    name: '23',
    description: 'GAS COMPRESSION AND RE-INJECTION (PH)',
    metadata: {},
    id: 3304380782307993,
  },
  {
    createdTime: new Date(1600167566305),
    lastUpdatedTime: new Date(1604918557306),
    rootId: 5937867326653296,
    parentId: 5575839912201129,
    parentExternalId: 'VAL',
    externalId: '23',
    name: '23',
    description: 'GAS COMPRESSION AND RE-INJECTION (PH)',
    metadata: {
      'Category Code': 'ADM',
      'Function Code': 'SYST',
      'Preceded by tag': '21PT1017',
      'Sub System No.': '',
      'Superceded by tag': '13PT2123',
    },
    id: 8080771499945473,
  },
  {
    createdTime: new Date(1600167566305),
    lastUpdatedTime: new Date(1604918476357),
    rootId: 5937867326653296,
    parentId: 5966564505417592,
    parentExternalId: '23-XX-9106',
    externalId: '23-1ST STAGE COMP DRY GAS SEAL SYS-PH',
    name: '23-1ST STAGE COMP DRY GAS SEAL SYS-PH',
    description: '1ST STAGE COMP DRY GAS SEAL SYS ON PH',
    metadata: {},
    id: 2312569317831464,
  },
  {
    createdTime: new Date(1610610584294),
    lastUpdatedTime: new Date(1610610584294),
    rootId: 4563220786036803,
    parentId: 4276078376901186,
    parentExternalId: '4856008121737468',
    externalId: '3904753668320840',
    name: '23-1ST STAGE COMP DRY GAS SEAL SYS-PH',
    description: '1ST STAGE COMP DRY GAS SEAL SYS ON PH',
    metadata: {},
    id: 4148485923249432,
  },
];

export const getRandomAssets = ({
  parentId,
  id,
  count = 1,
}: {
  parentId?: CogniteInternalId;
  id?: CogniteInternalId;
  count: number;
}): Asset[] => {
  const result = [];
  // eslint-disable-next-line no-plusplus
  while (count--) {
    const randAst =
      randomAssets[Math.floor(Math.random() * randomAssets.length)];
    const randId = Math.trunc(Math.random() * 10000);
    result.push({
      ...randAst,
      parentId,
      id: id || +randAst.id + randId,
      externalId: `${randAst.externalId}_${randId}`,
    });
  }
  return result;
};

export const getAggregates = (
  aggregatedProperties: AssetAggregatedProperty[] | undefined
) => {
  const hasChildCount = aggregatedProperties?.includes('childCount');
  return hasChildCount
    ? {
        // set random childCount every second time
        childCount: Math.random() * 10 > 5 ? Math.trunc(Math.random() * 10) : 0,
      }
    : undefined;
};

export class MockAssets {
  static single = () => rootAssets[0];

  static multiple = () => rootAssets;
}
