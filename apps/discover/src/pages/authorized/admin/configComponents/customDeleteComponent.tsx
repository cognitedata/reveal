import { geospatial } from 'services/geospatial';

import { Modal } from '@cognite/cogs.js';

import { CustomDeleteComponent } from '../projectConfig';

export const customDeleteComponent: CustomDeleteComponent = (props) => {
  switch (props.type) {
    case 'map.children.layers': {
      const handleOk = async () => {
        if (props.id) {
          await geospatial.deleteFeatureType(props.id);
        }
        props.onOk();
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
