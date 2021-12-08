import { CustomComponent } from '../projectConfig';

import { LayersFormModal } from './LayersFormModal';
import { MetadataFormModal } from './MetadataFormModal';

export const customConfigComponent: CustomComponent = ({
  onClose,
  onOk,
  metadataValue,
  type,
}) => {
  switch (type) {
    case 'map.children.layers':
      return (
        <LayersFormModal
          onClose={onClose}
          onOk={onOk}
          metadataValue={metadataValue}
          type={type}
        />
      );
    default:
      return (
        <MetadataFormModal
          onClose={onClose}
          onOk={onOk}
          metadataValue={metadataValue}
          type={type}
        />
      );
  }
};
