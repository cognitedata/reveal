import { Button, Dropdown, Menu } from '@cognite/cogs.js';
import uniqueId from 'lodash/uniqueId';
import { ComponentProps, useState } from 'react';

interface Props extends ComponentProps<typeof Dropdown> {
  recordId: string;
  dropdownMenuProps?: ComponentProps<typeof Menu>;
  items?: ComponentProps<typeof Menu.Item>[];
}

export const ContextDropdown = ({
  items = [],
  recordId,
  dropdownMenuProps,
  ...rest
}: Props) => {
  const [focus, setFocus] = useState(false);
  return (
    <span className="context-dropdown-container">
      <Dropdown
        onShown={() => setFocus(true)}
        onHidden={() => setFocus(false)}
        hideOnSelect
        content={
          items.length > 0 ? (
            <Menu {...dropdownMenuProps}>
              {items.map((props) => (
                <Menu.Item key={uniqueId(recordId)} {...props} />
              ))}
            </Menu>
          ) : null
        }
        appendTo="parent"
        {...rest}
      >
        <Button
          type="ghost"
          size="small"
          disabled={items.length === 0}
          icon="EllipsisHorizontal"
          title="Actions"
          aria-label={`Actions for ${recordId}`}
          style={
            focus
              ? {
                  background: 'var(--cogs-btn-color-ghost--hover)',
                  color: 'var(--cogs-btn-color-inverted)',
                }
              : {}
          }
        />
      </Dropdown>
    </span>
  );
};
