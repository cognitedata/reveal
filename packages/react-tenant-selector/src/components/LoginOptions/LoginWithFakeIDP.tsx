import * as React from 'react';
import axios from 'axios';
import omit from 'lodash/omit';
import { Button } from '@cognite/cogs.js';
import { saveToLocalStorage } from '@cognite/storage';
import { CogniteAuth } from '@cognite/auth-utils';

import { FakeIdp } from '../../utils';

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

  const handleClick = () => {
    setLoading(true);
    axios
      .post(`http://localhost:8200/login/token`, omit(fakeIdpOptions, 'name'))
      .then((result) => {
        saveToLocalStorage('fakeIdp', {
          project: fakeIdpOptions.project,
          cluster: fakeIdpOptions.cluster,
          idToken: result.data.id_token,
          accessToken: result.data.access_token,
        });

        if (authClient) {
          authClient.loginInitial({
            flow: 'FAKE_IDP',
          });
        }

        handleSubmit(fakeIdpOptions.project);
      })
      .catch((error) => {
        setLoading(false);
        // eslint-disable-next-line no-console
        console.error(
          'There has been an error, do you have the FakeIdP service running?',
          error
        );
      });
  };

  return (
    <>
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
