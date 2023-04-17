import { Button, Dropdown, Menu } from '@cognite/cogs.js';
import { useTranslation } from 'common';
import { useDeleteFlow } from 'hooks/files';

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
      <Button type="ghost" icon={'EllipsisVertical'} />
    </Dropdown>
  );
}
