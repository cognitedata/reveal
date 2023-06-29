import { Drawer } from '@data-exploration/components';

import { ResourceSelector, ResourceSelectorProps } from './ResourceSelector';

type ResourceSelectorDrawerProps = ResourceSelectorProps & {
  visible: boolean;
  onClose: () => void;
};

export const ResourceSelectorDrawer = ({
  visible,
  onClose,
  ...props
}: ResourceSelectorDrawerProps) => {
  return (
    <Drawer visible={visible} onClose={onClose}>
      <ResourceSelector {...props} />
    </Drawer>
  );
};
