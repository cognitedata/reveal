import { useTranslation } from '@flows/common';
import { useDeleteFlow } from '@flows/hooks/files';

import { Button, Dropdown, Menu } from '@cognite/cogs.js';

export default function FlowListItemMenu({
  externalId,
}: {
  externalId: string;
}) {
  const { t } = useTranslation();
  const { mutate, isLoading } = useDeleteFlow();
  return (
    <Dropdown
      content={
        <Menu>
          <Menu.Item
            disabled={isLoading}
            onClick={() => mutate({ externalId })}
          >
            {t('list-delete')}
          </Menu.Item>
        </Menu>
      }
    >
      <Button
        aria-label="Open options menu for flow"
        type="ghost"
        icon="EllipsisVertical"
      />
    </Dropdown>
  );
}
