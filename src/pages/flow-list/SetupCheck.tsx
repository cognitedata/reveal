import { Button, Icon } from '@cognite/cogs.js';
import { useCreateRawDB, useCreateRawTable, useRawSetupCheck } from 'hooks/raw';

type Props = { children?: React.ReactNode };

export default function RawSetupCheck({ children }: Props) {
  const { data, isLoading } = useRawSetupCheck();
  const { mutate: createDB, isLoading: isCreatingDB } = useCreateRawDB();
  const { mutate: createTable, isLoading: isCreatingTable } =
    useCreateRawTable();

  return (
    <div>
      {isLoading && <Icon type="Loader" />}
      {data && !data.hasDB && (
        <>
          <h2>Database missing!</h2>
          <Button
            onClick={() => createDB()}
            disabled={isCreatingDB}
            icon={isCreatingDB ? 'Loader' : 'Add'}
          >
            Create database
          </Button>
        </>
      )}
      {data && !data.hasTable && (
        <>
          <h2>Table missing!</h2>
          <Button
            onClick={() => createTable()}
            disabled={!data?.hasDB || isCreatingTable}
            icon={isCreatingDB ? 'Loader' : 'Add'}
          >
            Create table
          </Button>
        </>
      )}
      {data?.hasTable && data?.hasDB && children}
    </div>
  );
}
