import React from 'react';
import { AccessPermission } from 'src/utils/types';

type Props = {
  capabilities: Array<AccessPermission>;
};

export default function NoAccessPage({ capabilities }: Props) {
  return (
    <div>
      Missing one or more required capabilities:{' '}
      <pre>{JSON.stringify(capabilities)}</pre>
    </div>
  );
}
