import { Button } from '@cognite/cogs.js';
import { useTranslation } from 'common';
import { useInsertFlow } from 'hooks/raw';
import { v4 } from 'uuid';

export default function CreateButton({}: {}) {
  const { t } = useTranslation();
  const { mutate, isLoading } = useInsertFlow();
  return (
    <Button
      type="primary"
      disabled={isLoading}
      icon={isLoading ? 'Loader' : 'Add'}
      onClick={() =>
        mutate({
          id: v4(),
          name: `Flow-demo ${new Date().getTime().toString()}`,
          description: `This is for the first iteration`,
          canvas: {
            nodes: [],
            edges: [],
          },
        })
      }
    >
      {t('list-create-flow')}
    </Button>
  );
}
