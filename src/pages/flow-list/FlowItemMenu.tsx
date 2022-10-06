import { Button, Dropdown, Menu } from '@cognite/cogs.js';
import { useTranslation } from 'common';
import { useDeleteFlow } from 'hooks/raw';

export default function FlowListItemMenu({ id }: { id: string }) {
  const { t } = useTranslation();
  const { mutate, isLoading } = useDeleteFlow();
  return (
    <Dropdown
      content={
        <Menu>
          <Menu.Item disabled={isLoading} onClick={() => mutate({ id })}>
            {t('list-delete')}
          </Menu.Item>
        </Menu>
      }
    >
      <Button type="ghost" icon={'EllipsisVertical'} />
    </Dropdown>
  );
}
