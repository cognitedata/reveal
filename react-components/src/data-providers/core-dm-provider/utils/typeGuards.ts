import { NodeItem } from '../../FdmSDK';
import {
  COGNITE_ASSET_VIEW_VERSION_KEY,
  CogniteAssetProperties,
  CORE_DM_SPACE
} from '../dataModels';

export function isCoreDmAssetNode(node: NodeItem): node is NodeItem<CogniteAssetProperties> {
  return (
    CORE_DM_SPACE in node.properties &&
    COGNITE_ASSET_VIEW_VERSION_KEY in
      (node as NodeItem<CogniteAssetProperties>).properties[CORE_DM_SPACE] &&
    (node as NodeItem<CogniteAssetProperties>).properties[CORE_DM_SPACE][
      COGNITE_ASSET_VIEW_VERSION_KEY
    ].name !== undefined
  );
}
