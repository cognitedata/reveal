import { geospatial } from 'services/geospatial';

import { Modal } from '@cognite/cogs.js';

import { showErrorMessage, showInfoMessage } from 'components/Toast';

import { CustomDeleteComponent } from '../projectConfig';

export const customDeleteComponent: CustomDeleteComponent = (props) => {
  switch (props.type) {
    case 'map.children.layers': {
      const handleOk = async () => {
        if (props.id) {
          try {
            // while deleting if we do not find corresponding featureType then
            // we just want to delete the layer from project config (props.onOk)
            await geospatial.getFeatureType(props.id);

            try {
              // if successful in finding featureType then we just delete corresponding data from geospatial
              // and then try for deleting layer from project config
              await geospatial.deleteFeatureType(props.id);
              props.onOk();
            } catch (e) {
              // in case we couldn't delete data, we do not want to delete layer from project config otherwise
              // we would never be able to delete corresponding data in future.
              showErrorMessage('Could not delete layer.');
            }
          } catch (e) {
            showInfoMessage(
              'No layer data present. Deleting layer from project config.'
            );
            props.onOk();
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
          onCancel={props.onClose}
          closable={false}
        >
          {`Are you sure you want to delete ${props.label || 'this entity'}?`}
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
          onOk={props.onOk}
          onCancel={props.onClose}
          closable={false}
        >
          {`Are you sure you want to delete ${props.label}?`}
        </Modal>
      );
  }
};
