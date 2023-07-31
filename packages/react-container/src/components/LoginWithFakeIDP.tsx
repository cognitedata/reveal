import { saveToLocalStorage } from '@cognite/storage';
import * as React from 'react';
import { saveFlow } from '@cognite/auth-utils';
import { Button, ToastContainer } from '@cognite/cogs.js';
import { FakeIdp } from '@cognite/sidecar';

type Props = {
  handleSubmit: (project: string) => void;
  disabled?: boolean;
  fakeIdpOptions: FakeIdp;
};

export const FAKE_IDP_USER_LS_KEY = 'fakeIdp user';
const LoginWithFakeIDP: React.FC<Props> = ({
  fakeIdpOptions,
  handleSubmit,
  disabled,
}) => {
  const [loading, setLoading] = React.useState(false);

  const handleClick = async () => {
    setLoading(true);
    saveFlow('FAKE_IDP');
    // this needs to be moved to auth-utils when the issue with version resolving is fixed
    saveToLocalStorage(
      FAKE_IDP_USER_LS_KEY,
      fakeIdpOptions.name || fakeIdpOptions.fakeApplicationId
    );
    handleSubmit(fakeIdpOptions.project);
  };

  return (
    <>
      <ToastContainer />
      <Button
        style={{ height: 40, marginTop: 10 }}
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
