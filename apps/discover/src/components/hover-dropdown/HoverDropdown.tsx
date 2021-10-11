import { useHoverListener } from 'hooks/useHoverListener';

import { DropdownWrapper, MenuWrapper } from './elements';

interface Props {
  content: React.ReactElement;
  children: React.ReactElement;
  onHoverChange?: (value: boolean) => void;
}
export const HoverDropdown: React.FC<Props> = ({
  content,
  children,
  onHoverChange,
}) => {
  const elRef = useHoverListener(onHoverChange);

  return (
    <DropdownWrapper ref={elRef}>
      {children}
      <MenuWrapper>{content}</MenuWrapper>
    </DropdownWrapper>
  );
};
