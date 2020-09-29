import { Asset, FileInfo } from 'cognite-sdk-v3';
import {
  ResourcePreviewObserver,
  ResourcePreviewProps,
  OpenSelectorProps,
  ResourceSelector,
} from '../context';

export const ResourcePreviewContextFunctions = (_: ResourcePreviewObserver) =>
  null;
export const ResourcePreviewPropsFunctions = (_: ResourcePreviewProps) => null;

export const ResourceSelectorContextFunctions = (_: ResourceSelector) => null;

export const ResourceSelectorPropsFunctions: React.FC<OpenSelectorProps> = (
  _: OpenSelectorProps
) => null;

export const asset: Asset = {
  externalId: 'From3D_/ASDAA-1"-WP-101006-AK_121275507867333',
  name: '/ASDAA-1"-WP-101006-AK',
  parentId: 7220949428049946,
  parentExternalId: 'From3D_ZONE 2 of SITE /DAL2-PVV-AB_3174871612398173',
  metadata: {
    Item_Hidden: 'false',
    Item_Icon: 'LcOaNodeIcon:4->4',
    'Item_Internal Type': 'lcldrvm_container',
    Item_Material: 'Color 243Translucent(0.00)',
    Item_Name: '/ASDAA-1"-WP-101006-AK',
    Item_Required: 'false',
  },
  id: 1,
  createdTime: new Date(),
  lastUpdatedTime: new Date(),
  rootId: 992198577673480,
};
export const file: FileInfo = {
  id: 1,
  name: 'Processed-PnID.png',
  mimeType: 'image/png',
  metadata: {
    COGNITE_INTERACTIVE_PNID: 'true',
    original_file_id: '1216889823476445',
  },
  assetIds: [1],
  uploaded: true,
  uploadedTime: new Date(),
  createdTime: new Date(),
  lastUpdatedTime: new Date(),
};
