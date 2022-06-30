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
      CDF_ANNOTATION_file_id: '7660754220271677',
      CDF_ANNOTATION_version: '5',
      CDF_ANNOTATION_status: 'verified',
      CDF_ANNOTATION_resource_type: 'asset',
      CDF_ANNOTATION_checked_by: 'UNKNOWN',
      CDF_ANNOTATION_resource_id: '1358166556159813',
    },
    source: 'job:6257758094934739',
    id: 180038378217268,
    lastUpdatedTime: new Date(),
    createdTime: new Date(),
  },
];
