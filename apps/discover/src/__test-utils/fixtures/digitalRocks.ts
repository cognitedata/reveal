import { Asset } from '@cognite/sdk';

export const getMockDigitalRockAsset: (extras?: Partial<Asset>) => Asset = (
  extras = {}
) => ({
  createdTime: new Date(1396357617000),
  lastUpdatedTime: new Date(1396357617334),
  rootId: 3050953320632644,
  parentId: 4328270755234172,
  parentExternalId: 'USA0000571201',
  externalId: 'USA0000571201_25H_HCT_1_a_1',
  name: 'USA0000571201_25H_HCT_1_a_1',
  description: 'Digital_Rock_Image',
  dataSetId: 88701337267318,
  metadata: {
    core_id: '',
    created_date: '11.Apr.20 09:08:56',
    datasetName: 'BP-digital-rocks',
    image_resolution: '2.55',
    image_resolution_unit: 'um',
    parent_image_id: '25H_HCT_1_a_1',
    plug_depth: '17400.7',
    plug_depth_datum: '',
    plug_depth_unit: 'ft',
    plug_id: '25H',
    plug_type: 'Chunks',
    type: 'Digital Rock',
    wellboreName: 'GC743_5',
    xdim: '750',
    ydim: '750',
    zdim: '1000',
    dimensionXYZ: '750, 750, 1000',
    plugDepthAndDatum: '17400.7 / ',
  },
  source: 'Digital Rocks',
  id: 6229416940913027,
  ...extras,
});
