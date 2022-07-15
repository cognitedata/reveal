import * as React from 'react';
// import { MapType } from '../types';
import type { Map as MapType } from 'maplibre-gl';

import { UnmountConfirmationDefaultContent } from './UnmountConfirmationDefaultContent';
import { UnmountConfirmationModal } from './UnmountConfirmationModal';

export interface UnmountConfirmationProps {
  enabled?: boolean;
  map?: MapType;
  onCancel?: () => void;
}
export const UnmountConfirmation: React.FC<
  React.PropsWithChildren<UnmountConfirmationProps>
> = ({ children, enabled, map, onCancel }) => {
  const [showModal, setShowModal] = React.useState(false);

  // Handle clicking outside while in drawing mode
  React.useEffect(() => {
    const outsideListener = (event: MouseEvent) => {
      const clickIsOutsideOfMap =
        map && !map.getContainer().contains(event.target as Node);

      if (clickIsOutsideOfMap && enabled) {
        event.preventDefault();
        event.stopPropagation();
        setShowModal(true);
      }
    };

    document.addEventListener('mousedown', outsideListener);
    return () => {
      document.removeEventListener('mousedown', outsideListener);
    };
  }, [map, enabled]);

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
    setShowModal(false);
  };

  const handleOk = () => {
    setShowModal(false);
  };

  if (showModal) {
    return (
      <UnmountConfirmationModal
        open={showModal}
        onCancel={handleCancel}
        onOk={handleOk}
      >
        {children || (
          <UnmountConfirmationDefaultContent onCancel={handleCancel} />
        )}
      </UnmountConfirmationModal>
    );
  }

  return null;
};
