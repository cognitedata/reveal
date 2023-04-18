import { createLink } from '@cognite/cdf-utilities';
import { Button } from '@cognite/cogs.js';
import { CANVAS_PATH, useTranslation } from 'common';
import { useCreateFlow } from 'hooks/files';
import { useNavigate } from 'react-router-dom';
import { v4 } from 'uuid';

export default function CreateButton({}: {}) {
  const { t } = useTranslation();
  const { mutateAsync, isLoading } = useCreateFlow();
  const navigate = useNavigate();
  return (
    <Button
      type="primary"
      disabled={isLoading}
      icon={isLoading ? 'Loader' : 'Add'}
      onClick={() =>
        mutateAsync({
          id: v4(),
          name: `Flow-demo ${new Date().getTime().toString()}`,
          description: `This is for the first iteration`,
          canvas: {
            nodes: [],
            edges: [],
          },
        }).then((fileInfo) => {
          navigate(createLink(`/${CANVAS_PATH}/${fileInfo.externalId}`));
        })
      }
    >
      {t('list-create-flow')}
    </Button>
  );
}
