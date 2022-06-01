import { DropdownProps as CogsDropdownProps, IconType } from '@cognite/cogs.js';

export type DropdownProps = Omit<CogsDropdownProps, 'openOnHover'>;

export type DropdownItemProps = {
  children: React.ReactNode;
  /**
   * To display menus in app
   */
  href?: string | undefined;
  onClick?:
    | ((e: React.MouseEvent<HTMLElement, MouseEvent>) => void)
    | undefined;
  appendIcon?: IconType;
  selected?: boolean | undefined;
  disabled?: boolean | undefined;
  showAppendedIconOnHover?: boolean | undefined;
};

export type DropdownSubmenuProps = Omit<DropdownProps, 'hideOnSelect'> & {
  children: React.ReactNode;
  appendIcon?: IconType;
  icon?: IconType;
};

export type DropdownContextType = {
  hideOnSelect: boolean;
  dropdownVisible: boolean;
  setDropdownVisible: (visible: boolean) => void;
};
