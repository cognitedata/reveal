import { Drawer } from '@data-exploration/components';

import { ResourceSelector, ResourceSelectorProps } from './ResourceSelector';

type ResourceSelectorDrawerProps = ResourceSelectorProps & {
  visible: boolean;
  initialWidth?: number | `${number}%`;
  onClose: () => void;
};

export const ResourceSelectorDrawer = ({
  visible,
  initialWidth,
  onClose,
  ...props
}: ResourceSelectorDrawerProps) => {
  return (
    <Drawer visible={visible} initialWidth={initialWidth} onClose={onClose}>
      <ResourceSelector {...props} />
    </Drawer>
  );
};
