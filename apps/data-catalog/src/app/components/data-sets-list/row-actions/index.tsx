import Dropdown from '@data-catalog-app/components/dropdown/Dropdown';

import { Button, Menu, MenuItemProps } from '@cognite/cogs.js';

type RowActionsProps = {
  actions: MenuItemProps[];
  loading?: boolean;
};

const RowActions = ({
  actions,
  loading = false,
}: RowActionsProps): JSX.Element => {
  return (
    <Dropdown
      content={
        <Menu loading={loading}>
          {actions.map((buttonProps, idx) => (
            <Menu.Item key={idx} iconPlacement="left" {...buttonProps} />
          ))}
        </Menu>
      }
      placement="bottom-end"
    >
      <Button
        type="ghost"
        size="small"
        icon="EllipsisHorizontal"
        aria-label="Options"
      />
    </Dropdown>
  );
};

export default RowActions;
