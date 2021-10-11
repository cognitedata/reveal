import { Dropdown } from '@cognite/cogs.js';

import { useHoverListener } from 'hooks/useHoverListener';

import { TabsDropdownWrapper, TabsMenuWrapper } from './elements';

interface Props {
  content: React.ReactElement;
  children: React.ReactElement;
  onHoverChange?: (value: boolean) => void;
}
export const TabsHoverDropdown: React.FC<Props> = ({
  content,
  children,
  onHoverChange,
}) => {
  const elRef = useHoverListener(onHoverChange);

  return (
    <TabsDropdownWrapper ref={elRef}>
      <Dropdown
        visible
        placement="bottom-end"
        content={<TabsMenuWrapper>{content}</TabsMenuWrapper>}
      >
        {children}
      </Dropdown>
    </TabsDropdownWrapper>
  );
};
