import { Button } from '@cognite/cogs.js';
import { useTranslation } from 'common';
import { useCreateFlow } from 'hooks/files';
import { Dispatch, SetStateAction } from 'react';

type Props = {
  showCreateModal: boolean;
  setShowCreateModal: Dispatch<SetStateAction<boolean>>;
};

export default function CreateButton({
  showCreateModal,
  setShowCreateModal,
}: Props) {
  const { t } = useTranslation();
  const { isLoading } = useCreateFlow();
  return (
    <Button
      type="primary"
      disabled={isLoading}
      icon={isLoading ? 'Loader' : 'Add'}
      onClick={() => setShowCreateModal(!showCreateModal)}
    >
      {t('list-create-flow')}
    </Button>
  );
}
