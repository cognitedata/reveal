import React from 'react';
import { Button } from '@cognite/cogs.js';
import { CogniteAuth, saveFlow } from '@cognite/auth-utils';

interface Props {
  authClient?: CogniteAuth;
}
const LoginWithADFS: React.FC<Props> = ({ authClient }: Props) => {
  const handleClick = () => {
    if (authClient) {
      saveFlow('ADFS');
      authClient.login('ADFS');
    }
  };

  return (
    <Button
      style={{ height: 40, width: '100%', marginTop: 10 }}
      size="large"
      type="secondary"
      onClick={handleClick}
    >
      Login with ADFS
    </Button>
  );
};

export default LoginWithADFS;
