import { Button, ButtonProps, Menu } from '@cognite/cogs.js';

import Dropdown from 'components/dropdown/Dropdown';

type RowActionsProps = {
  actions: Omit<ButtonProps, 'type'>[];
};

const RowActions = ({ actions }: RowActionsProps): JSX.Element => {
  return (
    <Dropdown
      content={
        <Menu>
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
