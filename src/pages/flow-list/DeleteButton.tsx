import { Button } from '@cognite/cogs.js';
import { useDeleteFlow } from 'hooks/raw';

export default function DeleteButton({ id }: { id: string }) {
  const { mutate, isLoading } = useDeleteFlow();
  return (
    <Button
      size="small"
      disabled={isLoading}
      icon={isLoading ? 'Loader' : 'Remove'}
      onClick={() =>
        mutate({
          id,
        })
      }
    >
      Delete flow
    </Button>
  );
}
