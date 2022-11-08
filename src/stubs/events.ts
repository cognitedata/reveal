import { CogniteEvent } from '@cognite/sdk';

export const events: CogniteEvent[] = [
  {
    id: 18829367093500,
    type: 'LubeOil_65-CT-510',
    subtype: '123',
    externalId: 'LubeOil_65-CT-510',
    metadata: {},
    createdTime: new Date(),
    lastUpdatedTime: new Date(),
  },
  {
    type: 'cognite_annotation',
    subtype: 'pnid_annotation',
    description: '',
    metadata: {
      CDF_ANNOTATION_box:
        '{"xMax":0.31,"xMin":0.27588235294117647,"yMax":0.40931780366056575,"yMin":0.3872712146422629}',
      CDF_ANNOTATION_file_id: '1',
      CDF_ANNOTATION_version: '5',
      CDF_ANNOTATION_status: 'verified',
      CDF_ANNOTATION_resource_type: 'asset',
      CDF_ANNOTATION_checked_by: 'UNKNOWN',
      CDF_ANNOTATION_resource_id: '560489721305992',
      CDF_ANNOTATION_page: '1',
    },
    source: 'job:6257758094934739',
    id: 180038378217268,
    lastUpdatedTime: new Date(),
    createdTime: new Date(),
  },
  {
    type: 'cognite_annotation',
    subtype: 'pnid_annotation',
    description: 'This is another customizable annotation!',
    metadata: {
      CDF_ANNOTATION_box:
        '{"xMin":0.6129383340287385,"yMin":0.7275193798449612,"xMax":0.6608961302530543,"yMax":0.79728682170542634}',
      CDF_ANNOTATION_file_external_id: 'SKA-AK-P-XB-2930-001.png',
      CDF_ANNOTATION_resource_external_id: 'LOR_GATHERING_POINT_E',
      CDF_ANNOTATION_resource_type: 'asset',
      CDF_ANNOTATION_status: 'verified',
      CDF_ANNOTATION_version: '5',
    },
    source: 'email:anna.gadacz@cognite.com',
    id: 2222,
    lastUpdatedTime: new Date(),
    createdTime: new Date(),
  },
];
