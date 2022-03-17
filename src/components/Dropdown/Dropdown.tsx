import {
  ComponentProps,
  CSSProperties,
  ReactElement,
  useCallback,
  useState,
} from 'react';
import { Button, Dropdown, IconType, Menu } from '@cognite/cogs.js';

import { Container, MenuText } from './elements';

type Props = {
  style?: CSSProperties;
  title?: string;
  options: {
    label: string;
    icon: IconType;
    onClick: () => void;
  }[];
  open: boolean;
  children: ReactElement;
  onClose: () => void;
};

/** Controlled */
const ChartsDropdown = ({
  style = { minWidth: '10rem' },
  title,
  options,
  children,
  open,
  onClose,
}: Props) => {
  return (
    <Dropdown
      visible={open}
      onClickOutside={onClose}
      content={
        <Container>
          <Menu onClick={onClose} style={{ ...style }}>
            {title && <Menu.Header>{title}</Menu.Header>}
            {options.map((item) => (
              <Menu.Item
                key={item.label}
                appendIcon={item.icon}
                onClick={item.onClick}
              >
                <MenuText>{item.label}</MenuText>
              </Menu.Item>
            ))}
          </Menu>
        </Container>
      }
    >
      {children}
    </Dropdown>
  );
};

interface UncontrolledDropdownProps
  extends Omit<Props, 'open' | 'onClose' | 'children'> {
  btnProps?: Omit<ComponentProps<typeof Button>, 'onClick'>;
  label?: string;
}

const Uncontrolled = ({
  btnProps,
  label,
  ...args
}: UncontrolledDropdownProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const closeMenu = useCallback(() => {
    setIsMenuOpen((prevState) => !prevState);
  }, []);

  return (
    <ChartsDropdown open={isMenuOpen} onClose={closeMenu} {...args}>
      <Button
        type="ghost"
        icon="EllipsisHorizontal"
        style={{ height: 28 }}
        aria-label="Open dropdown"
        {...btnProps}
        onClick={() => setIsMenuOpen(true)}
      >
        {label}
      </Button>
    </ChartsDropdown>
  );
};

ChartsDropdown.Uncontrolled = Uncontrolled;

export default ChartsDropdown;
