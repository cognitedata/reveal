import * as React from 'react';
import { Button, toast, ToastContainer } from '@cognite/cogs.js';
import { CogniteAuth, doFakeIdPLogin } from '@cognite/auth-utils';
import { FakeIdp } from '@cognite/sidecar';

type Props = {
  authClient?: CogniteAuth;
  handleSubmit: (tenant: string) => void;
  disabled?: boolean;
  fakeIdpOptions: FakeIdp;
};
const LoginWithFakeIDP: React.FC<Props> = ({
  fakeIdpOptions,
  authClient,
  handleSubmit,
  disabled,
}) => {
  const [loading, setLoading] = React.useState(false);

  const handleClick = async () => {
    setLoading(true);
    try {
      await doFakeIdPLogin(fakeIdpOptions);
      if (authClient) {
        authClient.loginInitial({
          flow: 'FAKE_IDP',
        });
      }
      handleSubmit(fakeIdpOptions.project);
    } catch (error: any) {
      toast.error(
        <div>
          <h3>FakeIdP Error</h3>
          <div>Do you have the FakeIdP service running?</div>
          <div>{JSON.stringify(error)}</div>
        </div>
      );
    }
    setLoading(false);
  };

  return (
    <>
      <ToastContainer />
      <Button
        style={{ height: 40, width: '100%', marginTop: 10 }}
        size="default"
        type="secondary"
        disabled={disabled}
        loading={loading}
        onClick={handleClick}
      >
        Login with Fake IDP (
        {fakeIdpOptions.name || fakeIdpOptions.fakeApplicationId || ''})
      </Button>
    </>
  );
};

export default LoginWithFakeIDP;
