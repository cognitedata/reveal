import { ResourceItem } from '@cognite/data-exploration';
import { CogniteClient } from '@cognite/sdk';
import { isSupportedFileInfo } from '@cognite/unified-file-viewer';
import isSupportedResourceType from './isSupportedResourceType';

const isSupportedResourceItem = async (
  sdk: CogniteClient,
  item: ResourceItem
): Promise<boolean> => {
  if (!isSupportedResourceType(item.type)) {
    return false;
  }

  if (item.type !== 'file') {
    return true;
  }

  const fileInfo = await sdk.files.retrieve([{ id: item.id }]);

  return isSupportedFileInfo(fileInfo[0]);
};

export default isSupportedResourceItem;
