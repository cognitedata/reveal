import { Button } from '@cognite/cogs.js';
import { useInsertFlow } from 'hooks/raw';
import { v4 } from 'uuid';

export default function CreateButton({}: {}) {
  const { mutate, isLoading } = useInsertFlow();
  return (
    <Button
      disabled={isLoading}
      icon={isLoading ? 'Loader' : 'Add'}
      onClick={() =>
        mutate({
          id: v4(),
          name: 'new flow',
          flow: {},
        })
      }
    >
      Create flow
    </Button>
  );
}
