import {
  deleteFeatureType,
  getFeatureType,
} from 'domain/geospatial/service/network';

import { Modal } from '@cognite/cogs.js';

import { showErrorMessage, showInfoMessage } from 'components/Toast';

import { CustomDeleteProps } from '../projectConfig';

export const CustomDeleteComponent = ({
  type,
  featureTypeId,
  onDelete,
  onClose,
  label,
}: CustomDeleteProps) => {
  switch (type) {
    case 'map.children.layers': {
      const handleOk = async () => {
        if (featureTypeId) {
          try {
            // while deleting if we do not find corresponding featureType then
            // we just want to delete the layer from project config (onDelete)
            await getFeatureType(featureTypeId);

            try {
              // if successful in finding featureType then we just delete corresponding data from geospatial
              // and then try for deleting layer from project config
              await deleteFeatureType(featureTypeId);
              onDelete();
            } catch (e) {
              // in case we couldn't delete data, we do not want to delete layer from project config otherwise
              // we would never be able to delete corresponding data in future.
              showErrorMessage('Could not delete layer.');
            }
          } catch (e) {
            showInfoMessage(
              'No layer data present. Deleting layer from project config.'
            );
            onDelete();
          }
        }
      };

      return (
        <Modal
          visible
          title="Confirm Deletion"
          appElement={document.getElementById('root') || undefined}
          okText="Delete"
          onOk={handleOk}
          onCancel={onClose}
          closable={false}
        >
          {`Are you sure you want to delete ${label || 'this entity'}?`}
          <br />
          This will also delete the corresponding GeoJSON data stored as layer
          source.
        </Modal>
      );
    }
    default:
      return (
        <Modal
          visible
          title="Confirm Deletion"
          appElement={document.getElementById('root') || undefined}
          okText="Delete"
          onOk={onDelete}
          onCancel={onClose}
          closable={false}
        >
          {`Are you sure you want to delete ${label}?`}
        </Modal>
      );
  }
};
