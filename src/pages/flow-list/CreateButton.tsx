import { Button } from '@cognite/cogs.js';
import { useInsertFlow } from 'hooks/raw';
import { v4 } from 'uuid';

export default function CreateButton({}: {}) {
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
          flow: {},
        })
      }
    >
      Create flow
    </Button>
  );
}
